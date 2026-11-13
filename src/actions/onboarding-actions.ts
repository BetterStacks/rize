"use server";

import { getServerSession } from "@/lib/auth";

// The onboarding call itself is placed through /api/voice/call (GPT-Live)
// after the user verifies their number in PhoneCollectionModal.

// Hides the "set up your call" dialog for this user on this browser. The
// cookie is keyed by user id (read in ProfilePage), so it survives signing
// out and back in, unlike the old session-token key.
export async function skipOnboarding() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(`phone_skipped_${session.user.id}`, "1", {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // No revalidation: the dialog closes on the client, and the next profile
    // render reads the cookie.
    return { success: true };
  } catch {
    return { success: false, error: "Failed to skip" };
  }
}
