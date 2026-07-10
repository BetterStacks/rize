"use server";

import { dailyCheckins, users } from "@/db/schema";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { placeTelnyxCall } from "@/lib/telnyx";
import { eq } from "drizzle-orm";

type CallPurpose = "onboarding" | "daily_checkin";

// Places an outbound call for a user and records the resulting call id
// against the right place depending on why the call is happening.
export async function initiateCall({
  userId,
  phoneNumber,
  purpose,
}: {
  userId: string;
  phoneNumber: string;
  purpose: CallPurpose;
}) {
  const { success: withinLimit } = await checkRateLimit("call", userId);
  if (!withinLimit) {
    return { success: false, error: "Too many call attempts. Please try again tomorrow." };
  }

  try {
    const call = await placeTelnyxCall({
      to: phoneNumber,
      metadata: { userId, purpose },
    });

    if (purpose === "onboarding") {
      await db
        .update(users)
        .set({ onboardingCallId: call.call_control_id, phoneNumberVerified: true })
        .where(eq(users.id, userId));
    } else {
      await db.insert(dailyCheckins).values({ userId, callId: call.call_control_id });
    }

    return { success: true, callId: call.call_control_id };
  } catch (error) {
    console.error(`Telnyx call failed (purpose: ${purpose}):`, error);
    return { success: false, error: (error as Error)?.message || "Failed to initiate call" };
  }
}
