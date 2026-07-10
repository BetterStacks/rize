import { initiateCall } from "@/actions/call-actions";
import { dailyCheckins, users } from "@/db/schema";
import db from "@/lib/db";
import { and, eq, gt, gte, isNotNull, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

const toHHMM = (d: Date) => `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;

// Runs every 15 min (see vercel.json). Catches any preferred time in the
// window since the last run — e.g. the run at :15 covers times from :00
// (exclusive) through :15 (inclusive) — so a time like 12:07 still fires,
// not just times landing exactly on a quarter-hour.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = toHHMM(new Date(now.getTime() - 15 * 60 * 1000));
  const windowEnd = toHHMM(now);

  // windowStart > windowEnd means this run's window crosses midnight (UTC)
  const inWindow =
    windowStart <= windowEnd
      ? and(gt(users.preferredCallTime, windowStart), lte(users.preferredCallTime, windowEnd))
      : or(gt(users.preferredCallTime, windowStart), lte(users.preferredCallTime, windowEnd));

  const dueUsers = await db
    .select({ id: users.id, phoneNumber: users.phoneNumber, preferredCallTime: users.preferredCallTime })
    .from(users)
    .where(and(eq(users.dailyCallEnabled, true), isNotNull(users.phoneNumber), inWindow));

  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const results = [];

  for (const user of dueUsers) {
    const alreadyCalledToday = await db
      .select({ id: dailyCheckins.id })
      .from(dailyCheckins)
      .where(and(eq(dailyCheckins.userId, user.id), gte(dailyCheckins.createdAt, startOfDay)))
      .limit(1);

    if (alreadyCalledToday.length > 0) continue;

    const result = await initiateCall({
      userId: user.id,
      phoneNumber: user.phoneNumber!,
      purpose: "daily_checkin",
    });
    results.push({ userId: user.id, ...result });
  }

  return NextResponse.json({ checked: dueUsers.length, called: results.length, results });
}
