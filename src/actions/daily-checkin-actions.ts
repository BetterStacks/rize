"use server";

import { dailyCheckins, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const TIME_FORMAT = /^([01]\d|2[0-3]):([0-5]\d)$/; // "HH:MM", 24-hour
const ALLOWED_INTERVALS = [1, 3, 7] as const; // daily / every 3 days / weekly

export async function updateDailyCheckinSettings({
  enabled,
  preferredCallTime,
  phoneNumber,
  callIntervalDays,
}: {
  enabled: boolean;
  preferredCallTime: string;
  phoneNumber?: string;
  callIntervalDays: number;
}) {
  const session = await requireAuth();

  if (enabled && !TIME_FORMAT.test(preferredCallTime)) {
    return { success: false, error: "Invalid time format, expected HH:MM" };
  }

  if (enabled && !phoneNumber) {
    return { success: false, error: "Add a phone number before enabling daily calls" };
  }

  if (!ALLOWED_INTERVALS.includes(callIntervalDays as any)) {
    return { success: false, error: "Invalid call interval" };
  }

  if (phoneNumber) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (existing && existing.id !== session.user.id) {
      return { success: false, error: "This phone number is already associated with another account" };
    }
  }

  await db
    .update(users)
    .set({
      dailyCallEnabled: enabled,
      preferredCallTime,
      callIntervalDays,
      ...(phoneNumber ? { phoneNumber } : {}),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  return { success: true };
}

export async function getMyDailyCheckinSettings() {
  const session = await requireAuth();

  const [row] = await db
    .select({
      dailyCallEnabled: users.dailyCallEnabled,
      preferredCallTime: users.preferredCallTime,
      phoneNumber: users.phoneNumber,
      callIntervalDays: users.callIntervalDays,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return row ?? { dailyCallEnabled: false, preferredCallTime: null, phoneNumber: null, callIntervalDays: 1 };
}

export async function getMyDailyCheckins(limit: number = 30) {
  const session = await requireAuth();

  return db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, session.user.id))
    .orderBy(desc(dailyCheckins.createdAt))
    .limit(limit);
}
