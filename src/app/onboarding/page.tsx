"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async (data: any) => {
    // Save onboarding data to your backend
    try {
      // await saveUserProfile(data);
      router.push("/"); // Redirect to main feed
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  return (
    <AuthGuard guestOnly>
      <OnboardingFlow onComplete={handleComplete} />
    </AuthGuard>
  );
}
