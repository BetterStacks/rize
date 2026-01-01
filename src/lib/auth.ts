import { accounts, profile, sessions, users, verification } from "@/db/schema";
import { compareSync, hashSync } from "bcryptjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import db from "./db";
import { phoneNumber } from "better-auth/plugins";
import twilio from "twilio";


const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false,
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verification: verification,
    },
  }),
  plugins: [
    phoneNumber({

      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@phone.rize`
        },
      },
      verifyOTP: async ({ phoneNumber, code }) => {
        try {
          const response = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verificationChecks.create({
              to: phoneNumber,
              code,
            });
          const status = response?.status
          console.log(`[Twilio] OTP verified for ${phoneNumber}: Status:${status}`);
          return status === "approved"

        } catch (error: any) {
          console.error(`[Twilio] Error verifying OTP for ${phoneNumber}:`, {
            code: error.code,
            message: error.message,
          });
          return false
        }
      },
      sendOTP: async ({ phoneNumber, code }, ctx) => {
        try {
          await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!).verifications.create({
            to: phoneNumber,
            channel: "sms",
          })

          console.log(`[Twilio] OTP sent successfully to ${phoneNumber}`);
        } catch (error: any) {
          console.error(`[Twilio] Error sending OTP to ${phoneNumber}:`, {
            code: error.code,
            message: error.message,
            status: error.status,
          });

        }
      },
    }),
  ],
  telemetry: {
    enabled: false,
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return hashSync(password, 10); // Use bcrypt for hashing
      },
      verify: async ({ password, hash }) => {
        return compareSync(password, hash); // Use bcrypt for verification
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },

  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  // user: {
  //   additionalFields: {
  //     isOnboarded: {
  //       type: "boolean",
  //       defaultValue: false,
  //     },
  //   },
  // },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_BASE_URL!,
    process.env.BASE_URL!,
  ].filter(Boolean),
  secret: process.env.AUTH_SECRET!,

});


// Export the auth handlers for API routes
export const authHandler = auth.handler;
export const GET = authHandler;
export const POST = authHandler;

// Types are handled by our custom useSession hook in /hooks/useAuth.ts

// Define types for better type safety - use the Session type from better-auth
export type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type BetterAuthUser = NonNullable<BetterAuthSession>["user"];

// Enhanced session type with profile data
export type EnrichedSession = {
  user: BetterAuthUser & {
    isOnboarded?: boolean;
    username?: string;
    profileId?: string;
    profileImage?: string;
    displayName?: string;
    hasCompletedWalkthrough?: boolean;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
  };
};

// Export server-side session helper with enriched user data
export const getServerSession = async (): Promise<EnrichedSession | null> => {
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  // Enrich user data with profile information
  try {
    const userData = await db
      .select({
        isOnboarded: users.isOnboarded,
        username: profile.username,
        profileId: profile.id,
        profileImage: profile.profileImage,
        displayName: profile.displayName,
        hasCompletedWalkthrough: profile.hasCompletedWalkthrough,
      })
      .from(users)
      .leftJoin(profile, eq(profile.userId, users.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    const userInfo = userData[0] || {};

    return {
      ...session,
      user: {
        ...session.user,
        isOnboarded: userInfo.isOnboarded || false,
        username: userInfo.username || undefined,
        profileId: userInfo.profileId || undefined,
        profileImage: userInfo.profileImage || undefined,
        displayName: userInfo.displayName || undefined,
        hasCompletedWalkthrough: userInfo.hasCompletedWalkthrough || false,
      },
    };
  } catch (error) {
    console.error("Error enriching session:", error);
    // Return basic session if enrichment fails
    return {
      ...session,
      user: {
        ...session.user,
        isOnboarded: false,
        username: undefined,
        profileId: undefined,
        profileImage: undefined,
        displayName: undefined,
        hasCompletedWalkthrough: false,
      },
    };
  }
};

// Helper function to get profileId from session with proper error handling
export const getProfileIdFromSession = async (): Promise<string> => {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const profileId = session.user.profileId;
  if (!profileId) {
    throw new Error("Profile not found. Please complete onboarding first.");
  }

  return profileId;
};

// Legacy compatibility - alias for consistency
export type Session = EnrichedSession;

// Standardized authentication helpers for server actions
export const requireAuth = async (): Promise<EnrichedSession> => {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
};

export const requireProfile = async (): Promise<string> => {
  const session = await requireAuth();
  const profileId = session.user.profileId;
  if (!profileId) {
    throw new Error("Profile not found. Please complete onboarding first.");
  }
  return profileId;
};

// Helper that returns both session and profileId for convenience
export const requireAuthWithProfile = async (): Promise<{
  session: EnrichedSession;
  profileId: string;
  userId: string;
}> => {
  const session = await requireAuth();
  const profileId = session.user.profileId;
  if (!profileId) {
    throw new Error("Profile not found. Please complete onboarding first.");
  }
  return {
    session,
    profileId,
    userId: session.user.id,
  };
};
