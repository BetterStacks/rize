import { users, voiceCalls, type TVoiceCallKind } from "@/db/schema";
import db from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { startOutboundCall } from "./twilio";

export type PlaceCallResult =
  | { ok: true; callId: string }
  | { ok: false; callId: string; error: string };

/*
 * Records a call and asks Twilio to dial the person. Twilio then bridges the
 * call over SIP to our OpenAI project, where GPT-Live takes over. Shared by
 * "Call me" and scheduled calls; callers check auth, limits and consent first.
 */
export async function placeCall(opts: {
  userId: string;
  to: string;
  kind: TVoiceCallKind;
  trigger: "manual" | "scheduled";
}): Promise<PlaceCallResult> {
  const [call] = await db
    .insert(voiceCalls)
    .values({ userId: opts.userId, kind: opts.kind, trigger: opts.trigger, status: "queued" })
    .returning({ id: voiceCalls.id });

  try {
    const twilioCall = await startOutboundCall({ callId: call.id, to: opts.to });
    await Promise.all([
      db
        .update(voiceCalls)
        .set({ twilioCallSid: twilioCall.sid })
        .where(and(eq(voiceCalls.id, call.id), eq(voiceCalls.userId, opts.userId))),
      opts.kind === "onboarding"
        ? db.update(users).set({ onboardingCallId: call.id }).where(eq(users.id, opts.userId))
        : null,
    ]);
    return { ok: true, callId: call.id };
  } catch (error: any) {
    console.error("[voice] Twilio call create failed", error?.code, error?.message);
    await db
      .update(voiceCalls)
      .set({ status: "failed", error: "Could not place the call", endedAt: new Date() })
      .where(eq(voiceCalls.id, call.id));
    return { ok: false, callId: call.id, error: "Could not place the call" };
  }
}
