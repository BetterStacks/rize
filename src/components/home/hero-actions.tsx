'use client'

import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useAuth'
import Link from 'next/link'

// Visitors start at sign-up; signed-in people go straight to their calls.
const HeroActions = () => {
  const session = useSession()
  const signedIn = !!session?.data?.user

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button asChild variant="brand" size="lg" className="w-full sm:w-auto">
        {signedIn ? (
          <Link href="/settings/voice">Open your journal</Link>
        ) : (
          <Link href="/signup">Get your first call</Link>
        )}
      </Button>
      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
        <a href="#how-it-works">How it works</a>
      </Button>
    </div>
  )
}

export default HeroActions
