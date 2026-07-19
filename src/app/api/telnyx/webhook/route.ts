import { checkRateLimit } from "@/lib/rate-limit";
import { startAiAssistant } from "@/lib/telnyx";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import db from "@/lib/db";
import { dailyCheckins, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { embedText } from "@/lib/memory";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

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

// Folds today's call summary into the user's existing rolling memory via one
// LLM call, so the memory stays short/current instead of growing unbounded.
async function synthesizeMemory(previousMemory: string | null, newSummary: string): Promise<string> {
  const prompt =
    "You maintain a short rolling memory of what a user has been focused on across daily check-in calls. " +
    "Given the existing memory and a new call summary, produce an updated memory (3-4 sentences max) that " +
    "folds in the new information and lets stale, no-longer-relevant details fade out.\n\n" +
    `Existing memory: ${previousMemory ?? "(none yet — this is their first check-in)"}\n\n` +
    `New summary from today's call: ${newSummary}\n\n` +
    "Generate ONLY the updated memory text, nothing else.";

  const { text } = await generateText({
    model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
    prompt,
    maxOutputTokens: 300,
    providerOptions: {
      google: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    },
  });

  return text.trim() || newSummary;
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
  const { userId, purpose } = decodeClientState(payload?.client_state);

  if (eventType === "call.answered") {
    // Same assistant/conversation runs for both onboarding and daily check-in calls.
    if ((purpose === "daily_checkin" || purpose === "onboarding") && process.env.TELNYX_ASSISTANT_ID) {
      let memoryContext: string | undefined;
      if (userId) {
        const [row] = await db.select({ memoryContext: users.memoryContext }).from(users).where(eq(users.id, userId)).limit(1);
        memoryContext = row?.memoryContext ?? undefined;
      }
      try {
        await startAiAssistant(payload.call_control_id, process.env.TELNYX_ASSISTANT_ID, memoryContext);
      } catch (error: any) {
        console.error("startAiAssistant failed:", JSON.stringify(error?.response?.data ?? error?.message));
      }
    }
  }

  if (eventType === "call.conversation_insights.generated") {
    const summary: string | undefined = payload?.results?.[0]?.result;
    if (summary && payload?.call_control_id) {
      let embedding: number[] | undefined;
      try {
        embedding = await embedText(summary);
      } catch (error) {
        console.error("embedText failed:", error);
      }

      await db
        .update(dailyCheckins)
        .set({ summary, ...(embedding ? { embedding } : {}) })
        .where(eq(dailyCheckins.callId, payload.call_control_id));

      if (userId) {
        const [row] = await db.select({ memoryContext: users.memoryContext }).from(users).where(eq(users.id, userId)).limit(1);
        try {
          const updatedMemory = await synthesizeMemory(row?.memoryContext ?? null, summary);
          await db.update(users).set({ memoryContext: updatedMemory }).where(eq(users.id, userId));
        } catch (error) {
          console.error("synthesizeMemory failed:", error);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
