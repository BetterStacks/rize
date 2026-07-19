"use server";

import { initiateCall } from "@/actions/call-actions";
import { users } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function initiateOnboardingCall(phoneNumber: string) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if phone number already exists for a different user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber))
    .limit(1);

  if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
    return {
      success: false,
      error: "This phone number is already associated with another account",
    };
  }

  // Update user with phone number
  if (session?.user?.phoneNumber !== phoneNumber) {
    await db
      .update(users)
      .set({ phoneNumber, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  }

  const result = await initiateCall({
    userId: session.user.id,
    phoneNumber,
    purpose: "onboarding",
  });

  if (result.success) {
    revalidatePath("/[username]", "layout");
  }

  return result;
}

export async function skipOnboarding() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Use session token as cookie key (expires with session)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(`phone_skipped_${session.session.token}`, "true");

    revalidatePath("/[username]", "layout");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to skip" };
  }
}
