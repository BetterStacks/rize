import { useSession as useBetterAuthSession } from '@/lib/auth-client'
import { getCurrentUserProfile } from '@/actions/profile-actions'
import { useEffect, useState } from 'react'

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
  const [enrichedSession, setEnrichedSession] = useState<EnrichedSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function enrichSession() {
      if (session?.data?.user && !enrichedSession) {
        setIsLoading(true)
        try {
          const profileData = await getCurrentUserProfile()
          
          if (profileData) {
            setEnrichedSession({
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
              },
              session: session.data.session,
            })
          }
        } catch (error) {
          console.error('Error enriching session:', error)
        } finally {
          setIsLoading(false)
        }
      } else if (!session?.data?.user) {
        setEnrichedSession(null)
      }
    }

    enrichSession()
  }, [session?.data?.user?.id, enrichedSession])

  return {
    ...session,
    data: enrichedSession,
    isLoading: session.isPending || isLoading,
    // Add update method for compatibility with existing code
    update: () => {
      setEnrichedSession(null) // Reset to trigger re-fetch
      session.refetch()
    },
  }
}
