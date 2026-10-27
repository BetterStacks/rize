"use server";

import { getServerSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// The onboarding call itself is placed through /api/voice/call (GPT-Live)
// after the user verifies their number in PhoneCollectionModal.

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
