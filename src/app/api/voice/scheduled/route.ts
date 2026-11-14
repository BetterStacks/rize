import { users, voiceCalls } from "@/db/schema";
import db from "@/lib/db";
import { placeCall } from "@/lib/voice/place-call";
import { loadCallerContext, needsOnboarding } from "@/lib/voice/prompt";
import { isCallDue, scheduledCallsAllowed, scheduledCallsDailyCap } from "@/lib/voice/schedule";
import { and, count, eq, gte, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/*
 * Vercel Cron, every 5 minutes (vercel.json). Places the scheduled calls that
 * are due now. Only people who switched scheduled calls on themselves are
 * considered, only those on SCHEDULED_CALLS_ALLOWLIST are called, and the
 * total per day is capped by SCHEDULED_CALLS_DAILY_CAP.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: without a secret configured, nothing runs.
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfUtcDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [[{ placedToday }], candidates] = await Promise.all([
    db
      .select({ placedToday: count() })
      .from(voiceCalls)
      .where(and(eq(voiceCalls.trigger, "scheduled"), gte(voiceCalls.createdAt, startOfUtcDay))),
    db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        dailyCallEnabled: users.dailyCallEnabled,
        scheduledCallsConsentedAt: users.scheduledCallsConsentedAt,
        scheduledCallsPausedAt: users.scheduledCallsPausedAt,
        preferredCallTime: users.preferredCallTime,
        callTimezone: users.callTimezone,
        callDays: users.callDays,
        lastScheduledCallAt: users.lastScheduledCallAt,
      })
      .from(users)
      .where(
        and(
          eq(users.dailyCallEnabled, true),
          isNotNull(users.scheduledCallsConsentedAt),
          isNull(users.scheduledCallsPausedAt),
          eq(users.phoneNumberVerified, true),
          isNotNull(users.phoneNumber)
        )
      )
      .limit(1000),
  ]);

  let budget = Math.max(0, scheduledCallsDailyCap() - Number(placedToday));
  const due = candidates.filter((u) => scheduledCallsAllowed(u.id) && isCallDue(u, now));
  const summary = { due: due.length, placed: 0, skipped: 0, failed: 0, capped: 0 };

  for (const person of due) {
    if (budget <= 0) {
      summary.capped++;
      continue;
    }

    // Claim this person for today in one statement, so an overlapping run
    // can't dial them twice. 20 hours keeps one call per local day.
    const claimed = await db
      .update(users)
      .set({ lastScheduledCallAt: now })
      .where(
        and(
          eq(users.id, person.id),
          eq(users.dailyCallEnabled, true),
          or(
            isNull(users.lastScheduledCallAt),
            lt(users.lastScheduledCallAt, sql`now() - interval '20 hours'`)
          )
        )
      )
      .returning({ id: users.id });
    if (!claimed.length) {
      summary.skipped++;
      continue;
    }

    // One live call at a time: don't ring someone who is already on a call.
    const active = await db
      .select({ id: voiceCalls.id })
      .from(voiceCalls)
      .where(
        and(
          eq(voiceCalls.userId, person.id),
          inArray(voiceCalls.status, ["queued", "ringing", "in_progress"]),
          gte(voiceCalls.createdAt, new Date(now.getTime() - 15 * 60 * 1000))
        )
      )
      .limit(1);
    if (active.length) {
      summary.skipped++;
      continue;
    }

    const kind = needsOnboarding(await loadCallerContext(person.id)) ? "onboarding" : "journal";
    const result = await placeCall({
      userId: person.id,
      to: person.phoneNumber!,
      kind,
      trigger: "scheduled",
    });
    budget--;
    if (result.ok) summary.placed++;
    else summary.failed++;
  }

  if (summary.due) console.log("[voice] scheduled calls", summary);
  return NextResponse.json(summary);
}
