import { users, voiceCalls } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { loadCallerContext, needsOnboarding } from "@/lib/voice/prompt";
import { startOutboundCall } from "@/lib/voice/twilio";
import { and, eq, gt, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// Starts an outbound call: Twilio dials the user, then bridges the call over
// SIP to our OpenAI project, where GPT-Live takes over.
export async function POST(req: Request) {
  // Session only; the profile fields getServerSession adds aren't needed here.
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  // Independent reads, run together. The daily call limit is checked only
  // after these pass, so a rejected request never uses up a call.
  const [[user], active, body] = await Promise.all([
    db
      .select({ phoneNumber: users.phoneNumber, phoneNumberVerified: users.phoneNumberVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    // One live call at a time per user.
    db
      .select({ id: voiceCalls.id })
      .from(voiceCalls)
      .where(
        and(
          eq(voiceCalls.userId, userId),
          inArray(voiceCalls.status, ["queued", "ringing", "in_progress"]),
          gt(voiceCalls.createdAt, new Date(Date.now() - 15 * 60 * 1000))
        )
      )
      .limit(1),
    req.json().catch(() => ({})),
  ]);
  if (!user?.phoneNumber || !user.phoneNumberVerified) {
    return NextResponse.json({ error: "Verify your phone number first" }, { status: 400 });
  }
  if (active.length) {
    return NextResponse.json({ error: "A call is already in progress" }, { status: 409 });
  }

  const { success } = await checkRateLimit("call", userId);
  if (!success) {
    return NextResponse.json(
      { error: "You've reached today's call limit. Try again tomorrow." },
      { status: 429 }
    );
  }

  // An explicit onboarding request doesn't need the profile read to decide.
  const kind =
    body?.kind === "onboarding" || needsOnboarding(await loadCallerContext(userId))
      ? "onboarding"
      : "journal";

  const [call] = await db
    .insert(voiceCalls)
    .values({ userId, kind, status: "queued" })
    .returning({ id: voiceCalls.id });

  try {
    const twilioCall = await startOutboundCall({ callId: call.id, to: user.phoneNumber });
    await Promise.all([
      db
        .update(voiceCalls)
        .set({ twilioCallSid: twilioCall.sid })
        .where(and(eq(voiceCalls.id, call.id), eq(voiceCalls.userId, userId))),
      kind === "onboarding"
        ? db.update(users).set({ onboardingCallId: call.id }).where(eq(users.id, userId))
        : null,
    ]);
  } catch (error: any) {
    console.error("[voice] Twilio call create failed", error?.code, error?.message);
    await db
      .update(voiceCalls)
      .set({ status: "failed", error: "Could not place the call", endedAt: new Date() })
      .where(eq(voiceCalls.id, call.id));
    return NextResponse.json({ error: "Could not place the call. Please try again later." }, { status: 502 });
  }

  return NextResponse.json({ callId: call.id, kind });
}
