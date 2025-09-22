import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface OnboardingPageProps {
  searchParams: { resumeId?: string }
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await getServerSession()
  // If unauthenticated, redirect on the server to avoid client-side loops
  if (!session) {
    redirect('/login')
  }
  // Only redirect if user is fully onboarded (has username AND isOnboarded flag)
  if (session?.user?.username && session?.user?.isOnboarded) {
    redirect(`/${session?.user?.username}`)
  }

  // Allow access to onboarding if user is authenticated but missing profile
  return <OnboardingFlow resumeId={searchParams.resumeId} />
}
