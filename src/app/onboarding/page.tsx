import AuthGuard from '@/components/auth/AuthGuard'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const session = await getServerSession()
  // Only redirect if user is fully onboarded (has username AND isOnboarded flag)
  if (session?.user?.username && session?.user?.isOnboarded) {
    redirect(`/${session?.user?.username}`)
  }

  // Allow access to onboarding if user is authenticated but missing profile
  return (
    <AuthGuard authOnly>
      <OnboardingFlow />
    </AuthGuard>
  )
}
