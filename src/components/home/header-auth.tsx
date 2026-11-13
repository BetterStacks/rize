'use client'

import { Button } from '@/components/ui/button'
import { CreativeAvatar } from '@/components/ui/creative-avatar'
import { useSession } from '@/hooks/useAuth'
import Link from 'next/link'

// Log in / Sign up for visitors, a link to their profile once signed in.
const HeaderAuth = () => {
  const session = useSession()
  const user = session?.data?.user

  if (session.isLoading) {
    return <div aria-hidden className="size-10 rounded-full bg-subtle" />
  }

  if (user) {
    return (
      <Link
        href={`/${user.username || 'profile'}`}
        aria-label="Your profile"
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
      >
        <CreativeAvatar
          src={user.profileImage || user.image || null}
          name={user.name || 'You'}
          size="sm"
          variant="auto"
          showHoverEffect={false}
        />
      </Link>
    )
  }

  return (
    <>
      <Button asChild variant="ghost">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/signup">Sign up</Link>
      </Button>
    </>
  )
}

export default HeaderAuth
