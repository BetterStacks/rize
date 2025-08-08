'use client'

import { useSession } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (guestOnly && session) {
      if (!session?.user?.isOnboarded) {
        router.push('/onboarding')
        return
      }
      router.push(`/${session?.user?.username}`)
      return
    }

    if (authOnly && !session) {
      router.push('/login')
      return
    }
  }, [status, session, authOnly, guestOnly, router])

  if (
    (!authOnly && !guestOnly) ||
    (authOnly && session) ||
    (guestOnly && !session)
  ) {
    return <>{children}</>
  }

  return null
}
