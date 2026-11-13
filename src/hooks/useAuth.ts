"use client"

import { useSession as useBetterAuthSession } from '@/lib/auth-client'
import { getCurrentUserProfile } from '@/actions/profile-actions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

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
  letrazId?: string | null;
}

export interface EnrichedSession {
  user: EnrichedUser;
  session: {
    id: string;
    expiresAt: Date;
    userId: string;
  };
  authMethod?: 'google' | 'github' | 'linkedin' | 'email';
}

// Every component that calls useSession() used to enrich the session on its
// own (one getCurrentUserProfile server action each: Sidebar, Menu, BottomNav,
// RightSidebar...). One shared query does it once per signed-in user.
const ENRICHED_PROFILE_KEY = 'enriched-session-profile'

export function useSession() {
  const session = useBetterAuthSession()
  const queryClient = useQueryClient()
  const userId = session?.data?.user?.id

  const { data: profileData, isPending: isProfilePending } = useQuery({
    queryKey: [ENRICHED_PROFILE_KEY, userId],
    queryFn: async () => {
      try {
        return (await getCurrentUserProfile()) ?? null
      } catch (error) {
        console.error('Error enriching session:', error)
        return null
      }
    },
    enabled: !!userId,
    // Components mounting together share one request; a short stale time
    // keeps avatar/username edits showing up after navigating back.
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const enrichedSession = useMemo<EnrichedSession | null>(() => {
    if (!session?.data?.user || !profileData) return null
    return {
      user: {
        id: session.data.user.id,
        email: profileData.email || session.data.user.email,
        emailVerified: session.data.user.emailVerified,
        name: profileData.name || session.data.user.name,
        createdAt: session.data.user.createdAt,
        updatedAt: session.data.user.updatedAt,
        image: profileData.image || session.data.user.image,
        isOnboarded: profileData.isOnboarded,
        username: profileData.username || undefined,
        profileId: profileData.id || undefined,
        profileImage: profileData.profileImage || undefined,
        displayName: profileData.displayName || undefined,
        hasCompletedWalkthrough: profileData.hasCompletedWalkthrough || false,
        letrazId: profileData.letrazId || null,
      },
      session: session.data.session,
      authMethod: profileData.authMethod,
    }
  }, [session?.data, profileData])

  return {
    ...session,
    data: enrichedSession,
    // Consider the state where base session exists but enriched data not ready yet as loading
    isLoading: session.isPending || (!!userId && isProfilePending),
    // Add update method for compatibility with existing code
    update: () => {
      queryClient.invalidateQueries({ queryKey: [ENRICHED_PROFILE_KEY] })
      session.refetch()
    },
  }
}
