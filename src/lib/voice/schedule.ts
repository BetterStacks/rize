import { users, voiceCalls, type TTranscriptTurn } from "@/db/schema";
import db from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

/*
 * Scheduled calls: a person opts in, picks days and a local time, and Rize
 * calls them then. Everything here is off unless the person switched it on
 * themselves, and the rollout is limited by SCHEDULED_CALLS_ALLOWLIST.
 */

export const CALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type CallDay = (typeof CALL_DAYS)[number];

/** Calls are only placed between these local hours (inclusive start, exclusive end). */
export const EARLIEST_CALL_HOUR = 8;
export const LATEST_CALL_HOUR = 22;

/** The cron runs every 5 minutes; a call is due within this window after its time. */
export const DUE_WINDOW_MINUTES = 5;

/** After this many missed scheduled calls in a row, scheduling pauses. */
export const MAX_MISSED_IN_A_ROW = 3;

const DEFAULT_DAILY_CAP = 50;

/** Global cap on scheduled calls per UTC day, to bound cost. */
export function scheduledCallsDailyCap() {
  const n = Number(process.env.SCHEDULED_CALLS_DAILY_CAP);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_DAILY_CAP;
}

/*
 * Who may use scheduled calls during rollout. Comma-separated user ids, or
 * "*" for everyone. Unset or empty means nobody: the feature fails closed.
 */
export function scheduledCallsAllowed(userId: string) {
  const raw = (process.env.SCHEDULED_CALLS_ALLOWLIST || "").trim();
  if (!raw) return false;
  if (raw === "*") return true;
  return raw.split(",").map((s) => s.trim()).includes(userId);
}

export function isValidTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "HH:MM", 24-hour, within the allowed calling hours. */
export function isValidCallTime(time: string) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!m) return false;
  const hour = Number(m[1]);
  return hour >= EARLIEST_CALL_HOUR && hour < LATEST_CALL_HOUR;
}

/** The local weekday ("mon".."sun"), date ("YYYY-MM-DD") and minutes since midnight. */
export function localParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: get("weekday").toLowerCase().slice(0, 3) as CallDay,
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export type ScheduleFields = {
  dailyCallEnabled: boolean;
  scheduledCallsConsentedAt: Date | null;
  scheduledCallsPausedAt: Date | null;
  preferredCallTime: string | null;
  callTimezone: string | null;
  callDays: string[] | null;
  lastScheduledCallAt: Date | null;
};

/*
 * Is a scheduled call due now? True when today is one of the person's days,
 * their local time is within DUE_WINDOW_MINUTES after the chosen time, and
 * they haven't had a scheduled call yet today (in their timezone).
 */
export function isCallDue(s: ScheduleFields, now: Date) {
  if (!s.dailyCallEnabled || !s.scheduledCallsConsentedAt || s.scheduledCallsPausedAt) return false;
  if (!s.preferredCallTime || !s.callTimezone || !s.callDays?.length) return false;
  if (!isValidTimezone(s.callTimezone) || !isValidCallTime(s.preferredCallTime)) return false;

  const local = localParts(now, s.callTimezone);
  if (!s.callDays.includes(local.day)) return false;

  const [h, m] = s.preferredCallTime.split(":").map(Number);
  const target = h * 60 + m;
  if (local.minutes < target || local.minutes >= target + DUE_WINDOW_MINUTES) return false;

  if (s.lastScheduledCallAt) {
    const last = localParts(s.lastScheduledCallAt, s.callTimezone);
    if (last.date === local.date) return false;
  }
  return true;
}

/*
 * Did the person ask Rize to stop calling? Checked on their own words only.
 * English and common Hindi/Hinglish phrasings.
 */
const STOP_PATTERNS = [
  /\bstop calling\b/i,
  /\b(don'?t|do not|please don'?t) call me\b/i,
  /\bno more calls\b/i,
  /\bcall (mat|na) kar(o|na|ein|iye)?\b/i,
  /\bphone (mat|na) kar(o|na|ein|iye)?\b/i,
  /मत\s*(करो|करना|कीजिए).{0,6}(कॉल|फ़ोन|फोन)|(कॉल|फ़ोन|फोन)\s*मत/u,
];

export function askedToStopCalls(transcript: TTranscriptTurn[]) {
  return transcript.some(
    (t) => t.role === "user" && STOP_PATTERNS.some((re) => re.test(t.text))
  );
}

/** Switch scheduled calls off for a person. Their days and time are kept. */
export async function stopScheduledCalls(userId: string) {
  await db
    .update(users)
    .set({ dailyCallEnabled: false })
    .where(eq(users.id, userId));
}

/*
 * After a call ends with the person talking: a scheduled call that was
 * answered resets the missed counter, and asking to stop (on any call)
 * switches scheduling off.
 */
export async function applyScheduleSignalsAfterCall(callId: string, transcript: TTranscriptTurn[]) {
  const [call] = await db
    .select({ userId: voiceCalls.userId, trigger: voiceCalls.trigger })
    .from(voiceCalls)
    .where(eq(voiceCalls.id, callId))
    .limit(1);
  if (!call) return;

  if (askedToStopCalls(transcript)) {
    await stopScheduledCalls(call.userId);
    return;
  }
  if (call.trigger === "scheduled") {
    await db
      .update(users)
      .set({ missedScheduledCalls: 0 })
      .where(eq(users.id, call.userId));
  }
}

/*
 * A scheduled call wasn't answered. Count it, and pause scheduling after
 * MAX_MISSED_IN_A_ROW misses in a row so we stop ringing someone who isn't
 * picking up. The person can switch it back on in settings.
 */
export async function recordMissedScheduledCall(userId: string) {
  await db
    .update(users)
    .set({
      missedScheduledCalls: sql`${users.missedScheduledCalls} + 1`,
      scheduledCallsPausedAt: sql`CASE WHEN ${users.missedScheduledCalls} + 1 >= ${MAX_MISSED_IN_A_ROW} THEN now() ELSE ${users.scheduledCallsPausedAt} END`,
    })
    .where(and(eq(users.id, userId), eq(users.dailyCallEnabled, true)));
}
