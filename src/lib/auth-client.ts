import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// Client-side auth configuration - types are handled by the useAuth hook

// Use same-origin relative requests to avoid cookie domain mismatches across hosts
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession: useSessionRaw,
  getSession,
  updateUser,
  changeEmail,
  changePassword,
} = authClient;

// Server action that returns the enriched session (includes profile info)
import { getEnrichedSession } from "@/actions/auth-actions";
import { useQuery } from "@tanstack/react-query";

/**
 * useEnrichedSession
 * Combines the client-side better-auth session with the server-side
 * enriched session (profile info) so components can access the same
 * shape as getServerSession(). Returns { data, status } similar to useSession.
 */
export const useEnrichedSession = () => {
  const client = useSessionRaw();

  // fetch server-side enriched session once and merge
  const { data: enriched, isLoading } = useQuery({
    queryKey: ["enriched-session"],
    queryFn: () => getEnrichedSession(),
    enabled: !!client.data?.session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Merge: prefer enriched for additional fields
  const merged = client.data
    ? {
        ...client.data,
        user: { ...client.data.user, ...(enriched?.user || {}) },
      }
    : enriched || null;

  return {
    data: merged,
    isPending: client.isPending || isLoading,
    error: client.error,
    refetch: client.refetch,
  };
};

// Export a replacement useSession hook that returns enriched session shape
export const useSession = useEnrichedSession;

// Helper functions for social sign-in with onboarding redirect
export const signInWithGoogle = () =>
  signIn.social({
    provider: "google",
    callbackURL: "/onboarding",
  });
export const signInWithGithub = () =>
  signIn.social({
    provider: "github",
    callbackURL: "/onboarding",
  });
export const signInWithLinkedIn = () =>
  signIn.social({
    provider: "linkedin",
    callbackURL: "/onboarding",
  });

// Helper function for email/password sign-in
export const signInWithCredentials = async (
  email: string,
  password: string
) => {
  return signIn.email({
    email,
    password,
  });
};

export type Session = typeof authClient.$Infer.Session;
