import { voiceCalls } from "@/db/schema";
import db from "@/lib/db";
import { uploadRecording } from "@/lib/voice/r2";
import { deleteTwilioRecording, downloadRecording, readTwilioForm } from "@/lib/voice/twilio";
import { and, eq } from "drizzle-orm";
import { after, NextResponse } from "next/server";

export const maxDuration = 60;

// Twilio says the call recording is ready: copy it to R2 (7-day expiry), then
// delete Twilio's copy.
export async function POST(req: Request) {
  const params = await readTwilioForm(req);
  if (!params) return new NextResponse("Invalid signature", { status: 403 });

  const callId = new URL(req.url).searchParams.get("callId");
  if (!callId || params.RecordingStatus !== "completed" || !params.RecordingUrl) {
    return new NextResponse(null, { status: 204 });
  }

  const call = await db.query.voiceCalls.findFirst({
    where: and(eq(voiceCalls.id, callId), eq(voiceCalls.twilioCallSid, params.CallSid)),
    columns: { id: true, recordingKey: true },
  });
  if (!call || call.recordingKey) return new NextResponse(null, { status: 204 });

  after(async () => {
    try {
      const audio = await downloadRecording(params.RecordingUrl);
      const { key, expiresAt } = await uploadRecording(call.id, audio, "audio/mpeg");
      await db
        .update(voiceCalls)
        .set({ recordingKey: key, recordingExpiresAt: expiresAt })
        .where(eq(voiceCalls.id, call.id));
      await deleteTwilioRecording(params.RecordingSid);
    } catch (error: any) {
      console.error("[voice] recording copy failed", call.id, error?.message);
    }
  });

  return new NextResponse(null, { status: 204 });
}
