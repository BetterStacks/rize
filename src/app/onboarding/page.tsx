import AuthGuard from "@/components/auth/AuthGuard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();
  if (session?.user?.username) {
    redirect(`/${session?.user?.username}`);
  }

  return (
    <AuthGuard authOnly>
      <OnboardingFlow />
    </AuthGuard>
  );
}
