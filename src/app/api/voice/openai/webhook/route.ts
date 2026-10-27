import { voiceCalls } from "@/db/schema";
import db from "@/lib/db";
import { acceptSession, readSipHeader, rejectSession } from "@/lib/voice/openai-live";
import {
  buildJournalInstructions,
  buildOnboardingInstructions,
  loadCallerContext,
} from "@/lib/voice/prompt";
import { holdCallSession } from "@/lib/voice/session";
import { and, eq, gt, inArray, isNull } from "drizzle-orm";
import { after, NextResponse } from "next/server";
import OpenAI from "openai";

// This function keeps the GPT-Live sideband WebSocket open for the whole call
// (via `after`), so it needs the Pro plan's 800s limit with Fluid Compute.
// Must be a literal for Next.js; matches FUNCTION_MAX_DURATION_SECONDS.
export const maxDuration = 800;
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  webhookSecret: process.env.OPENAI_WEBHOOK_SECRET,
});

export async function POST(req: Request) {
  const raw = await req.text();
  let event: any;
  try {
    event = await openai.webhooks.unwrap(raw, Object.fromEntries(req.headers));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // `live.call.incoming` is the deprecated name of the same event.
  if (event.type !== "live.transport.incoming" && event.type !== "live.call.incoming") {
    return NextResponse.json({ received: true });
  }

  const sessionId: string | undefined = event.data?.session_id;
  if (!sessionId) return NextResponse.json({ received: true });

  const callId = readSipHeader(event.data?.sip_headers, "x-rize-call-id");
  const isUuid = !!callId && /^[0-9a-f-]{36}$/i.test(callId);

  // Only accept calls we placed in the last few minutes and haven't connected yet.
  // Claiming the row atomically also dedupes webhook redeliveries.
  const claimed = isUuid
    ? await db
        .update(voiceCalls)
        .set({ openaiSessionId: sessionId, status: "in_progress", startedAt: new Date() })
        .where(
          and(
            eq(voiceCalls.id, callId!),
            isNull(voiceCalls.openaiSessionId),
            inArray(voiceCalls.status, ["queued", "ringing"]),
            gt(voiceCalls.createdAt, new Date(Date.now() - 10 * 60 * 1000))
          )
        )
        .returning({ id: voiceCalls.id, userId: voiceCalls.userId, kind: voiceCalls.kind })
    : [];

  if (claimed.length === 0) {
    const existing = await db.query.voiceCalls.findFirst({
      where: eq(voiceCalls.openaiSessionId, sessionId),
      columns: { id: true },
    });
    // Redelivery of a call we already accepted: nothing more to do.
    if (existing) return NextResponse.json({ received: true });

    await rejectSession(sessionId, 603).catch(() => {});
    return NextResponse.json({ received: true });
  }

  const call = claimed[0];
  try {
    const ctx = await loadCallerContext(call.userId);
    const instructions =
      call.kind === "onboarding" ? buildOnboardingInstructions(ctx) : buildJournalInstructions(ctx);
    await acceptSession(sessionId, instructions);
  } catch (error: any) {
    console.error("[voice] accept failed", call.id, error?.message);
    await db
      .update(voiceCalls)
      .set({ status: "failed", error: "AI could not join the call", endedAt: new Date() })
      .where(eq(voiceCalls.id, call.id));
    return NextResponse.json({ received: true });
  }

  // Respond to OpenAI right away; the function stays alive for the call.
  after(() =>
    holdCallSession(call.id, sessionId, call.kind).catch((error) => {
      console.error("[voice] call session crashed", call.id, error?.message);
    })
  );
  return NextResponse.json({ received: true });
}
