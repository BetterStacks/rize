import { voiceCalls, type TVoiceCallStatus } from "@/db/schema";
import db from "@/lib/db";
import { readTwilioForm } from "@/lib/voice/twilio";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// Twilio call progress. GPT-Live's sideband is the source of truth once the
// AI joins; this mostly catches calls that never got that far.
export async function POST(req: Request) {
  const params = await readTwilioForm(req);
  if (!params) return new NextResponse("Invalid signature", { status: 403 });

  const callId = new URL(req.url).searchParams.get("callId");
  if (!callId) return new NextResponse(null, { status: 204 });

  const call = await db.query.voiceCalls.findFirst({
    where: and(eq(voiceCalls.id, callId), eq(voiceCalls.twilioCallSid, params.CallSid)),
  });
  if (!call) return new NextResponse(null, { status: 204 });

  const twilioStatus = params.CallStatus;
  const notConnected = !call.openaiSessionId;

  if (twilioStatus === "ringing" && call.status === "queued") {
    await db.update(voiceCalls).set({ status: "ringing" }).where(eq(voiceCalls.id, callId));
  } else if (["busy", "no-answer", "failed", "canceled", "completed"].includes(twilioStatus)) {
    const updates: Partial<typeof voiceCalls.$inferInsert> = {};
    if (notConnected) {
      const status: TVoiceCallStatus =
        twilioStatus === "busy" || twilioStatus === "no-answer" ? "no_answer" : "failed";
      updates.status = status;
      updates.endedAt = new Date();
      updates.error =
        twilioStatus === "completed" ? "The call ended before the AI joined" : `Twilio: ${twilioStatus}`;
    }
    if (!call.durationSeconds && params.CallDuration) {
      updates.durationSeconds = Number(params.CallDuration) || null;
    }
    if (Object.keys(updates).length) {
      await db
        .update(voiceCalls)
        .set(updates)
        .where(
          and(
            eq(voiceCalls.id, callId),
            // Never overwrite a finished conversation's status.
            notConnected
              ? inArray(voiceCalls.status, ["queued", "ringing"])
              : eq(voiceCalls.id, callId)
          )
        );
    }
  }

  return new NextResponse(null, { status: 204 });
}
