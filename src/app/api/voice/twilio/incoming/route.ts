import { users, voiceCalls } from "@/db/schema";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { incomingCallTwiml, readTwilioForm, sayAndHangupTwiml } from "@/lib/voice/twilio";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

const twiml = (body: string) =>
  new NextResponse(body, { headers: { "Content-Type": "text/xml" } });

// A user calls TWILIO_PHONE_NUMBER (e.g. calling back a missed call). If the
// caller's number is verified on a Rize account, bridge them to the same AI as
// an outbound call; anyone else hears how to set it up.
// Twilio console: the number's "A call comes in" webhook points here (POST).
export async function POST(req: Request) {
  const params = await readTwilioForm(req);
  if (!params) return new NextResponse("Invalid signature", { status: 403 });

  const from = params.From;
  const [user] = from
    ? await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.phoneNumber, from), eq(users.phoneNumberVerified, true)))
        .orderBy(desc(users.updatedAt))
        .limit(1)
    : [];
  if (!user) {
    return twiml(
      sayAndHangupTwiml(
        "Hi, this is Rize. This number isn't linked to a Rize account yet. Verify your phone number in Rize settings, under Voice journal, and then call again."
      )
    );
  }

  // One live call at a time per user, same as outbound.
  const active = await db
    .select({ id: voiceCalls.id })
    .from(voiceCalls)
    .where(
      and(
        eq(voiceCalls.userId, user.id),
        inArray(voiceCalls.status, ["queued", "ringing", "in_progress"]),
        gt(voiceCalls.createdAt, new Date(Date.now() - 15 * 60 * 1000))
      )
    )
    .limit(1);
  if (active.length) {
    return twiml(sayAndHangupTwiml("You already have a Rize call in progress. Please try again in a few minutes."));
  }

  const { success } = await checkRateLimit("call", user.id);
  if (!success) {
    return twiml(sayAndHangupTwiml("You've reached today's call limit. Please try again tomorrow."));
  }

  // Caller ID can be spoofed, so a call into the Rize number is always a
  // journal call: it can only produce private drafts the account owner reviews,
  // never profile writes (which only the onboarding call makes).
  const kind = "journal" as const;

  const [call] = await db
    .insert(voiceCalls)
    .values({ userId: user.id, kind, status: "ringing", twilioCallSid: params.CallSid })
    .returning({ id: voiceCalls.id });

  return twiml(incomingCallTwiml(call.id));
}
