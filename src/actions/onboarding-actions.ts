"use server";

import { users } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";
import { VAPI_ASSISTANT_CONFIG } from "@/lib/vapi-config";
import axios from "axios";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function initiateOnboardingCall(phoneNumber: string) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate environment variables
    if (!process.env.VAPI_API_KEY) {
      console.error("VAPI_API_KEY is not configured");
      return {
        success: false,
        error: "VAPI configuration error. Please contact support.",
      };
    }

    if (!process.env.VAPI_PHONE_NUMBER_ID) {
      console.error("VAPI_PHONE_NUMBER_ID is not configured");
      return {
        success: false,
        error: "VAPI configuration error. Please contact support.",
      };
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
        .set({
          phoneNumber: phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));
    }
    // Trigger Vapi call here

    const vapiResponse = await axios.post(
      "https://api.vapi.ai/call",
      {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber,
        },
        assistant: {
          ...VAPI_ASSISTANT_CONFIG,
          firstMessage: VAPI_ASSISTANT_CONFIG.firstMessage.replace(
            "{userName}",
            session.user.name
          ),
        },
        metadata: {
          userId: session.user.id,
          userName: session.user.name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // Save call ID an set phone number verified to true
    await db
      .update(users)
      .set({ onboardingCallId: vapiResponse.data.id, phoneNumberVerified: true })
      .where(eq(users.id, session.user.id));

    revalidatePath("/[username]", "layout");
    return { success: true };
  } catch (error) {
    // Handle axios errors specifically
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      console.error("VAPI API Error:", {
        status: statusCode,
        data: errorData,
        message: error.message,
      });

      if (statusCode === 401) {
        return {
          success: false,
          error: "VAPI authentication failed. Please check your API key.",
        };
      }

      return {
        success: false,
        error: errorData?.message || error.message || "Failed to initiate call",
      };
    }

    return {
      success: false,
      error: (error as Error)?.message || "Failed to initiate call",
    };
  }
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
