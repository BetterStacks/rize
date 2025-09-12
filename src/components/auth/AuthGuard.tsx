'use client'

import { useSession } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type AuthGuardProps = {
  children: React.ReactNode;
  authOnly?: boolean;
  guestOnly?: boolean;
};

export default function AuthGuard({
  children,
  authOnly,
  guestOnly,
}: AuthGuardProps) {
  const { data: session, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (guestOnly && session) {
      // Check if user is onboarded
      const isOnboarded = session.user?.isOnboarded
      const username = session.user?.username
      
      if (!isOnboarded) {
        router.push('/onboarding')
        return
      }
      
      if (username) {
        router.push(`/${username}`)
      } else {
        // Fallback to settings if username not available
        router.push('/settings')
      }
      return
    }

    if (authOnly && !session) {
      router.push('/login')
      return
    }
  }, [isLoading, session, authOnly, guestOnly, router])

  // Avoid rendering children while session state is loading to prevent flicker/loops
  if (isLoading) return null

  if ((!authOnly && !guestOnly) || (authOnly && session) || (guestOnly && !session)) {
    return <>{children}</>
  }

  return null
}
