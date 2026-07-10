import { checkRateLimit } from "@/lib/rate-limit";
import { startAiAssistant } from "@/lib/telnyx";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import db from "@/lib/db";
import { dailyCheckins } from "@/db/schema";
import { eq } from "drizzle-orm";

// Minimal ASN.1/SPKI DER header for a raw 32-byte Ed25519 public key, so
// Node's crypto module can import it without a third-party lib.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function verifyWebhookSignature(rawBody: string, req: Request): boolean {
  const publicKeyBase64 = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKeyBase64) return true; // not configured — skip (dev mode)

  const signatureHeader = req.headers.get("telnyx-signature-ed25519");
  const timestampHeader = req.headers.get("telnyx-timestamp");
  if (!signatureHeader || !timestampHeader) return false;

  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyBase64, "base64")]),
      format: "der",
      type: "spki",
    });
    return crypto.verify(
      null,
      Buffer.from(`${timestampHeader}|${rawBody}`),
      publicKey,
      Buffer.from(signatureHeader, "base64")
    );
  } catch {
    return false;
  }
}

function decodeClientState(clientState?: string): { userId?: string; purpose?: string } {
  if (!clientState) return {};
  try {
    return JSON.parse(Buffer.from(clientState, "base64").toString("utf-8"));
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "telnyx";
  const { success, response } = await checkRateLimit("webhook", ip);
  if (!success) return response!;

  const body = JSON.parse(rawBody);
  const eventType = body?.data?.event_type;
  const payload = body?.data?.payload;
  const { purpose } = decodeClientState(payload?.client_state);

  if (eventType === "call.answered") {
    // Same assistant/conversation runs for both onboarding and daily check-in calls.
    if ((purpose === "daily_checkin" || purpose === "onboarding") && process.env.TELNYX_ASSISTANT_ID) {
      try {
        await startAiAssistant(payload.call_control_id, process.env.TELNYX_ASSISTANT_ID);
      } catch (error: any) {
        console.error("startAiAssistant failed:", JSON.stringify(error?.response?.data ?? error?.message));
      }
    }
  }

  if (eventType === "call.conversation_insights.generated") {
    const summary: string | undefined = payload?.results?.[0]?.result;
    if (summary && payload?.call_control_id) {
      await db
        .update(dailyCheckins)
        .set({ summary })
        .where(eq(dailyCheckins.callId, payload.call_control_id));
    }
  }

  return NextResponse.json({ received: true });
}
