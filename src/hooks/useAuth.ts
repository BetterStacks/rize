import { useSession as useBetterAuthSession } from '@/lib/auth-client'

// Define our enriched user type
export interface EnrichedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  isOnboarded?: boolean;
  username?: string;
  profileId?: string;
  profileImage?: string;
  displayName?: string;
  hasCompletedWalkthrough?: boolean;
}

export interface EnrichedSession {
  user: EnrichedUser;
  session: {
    id: string;
    expiresAt: Date;
    userId: string;
  };
}

export function useSession() {
  const session = useBetterAuthSession()
  
  return {
    ...session,
    data: session.data as EnrichedSession | null,
    // Add update method for compatibility with existing code
    update: () => {
      // better-auth handles session updates automatically
      // but we can trigger a refetch if needed
      session.refetch()
    },
  }
}
