"use client";

import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  authOnly?: boolean; // Requires authentication
  guestOnly?: boolean; // Only for non-authenticated users (like login page)
};

export default function AuthGuard({
  children,
  authOnly,
  guestOnly,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Redirect authenticated users away from guest-only pages
    if (guestOnly && session) {
      if (session?.user?.isOnboarded) {
        router.push("/onboarding");
        return;
      }
      router.push(`/${session?.user?.username}`);
      return;
    }

    // Redirect non-authenticated users away from protected pages
    if (authOnly && !session) {
      router.push("/login");
      return;
    }
  }, [status, session, authOnly, guestOnly, router]);

  // Show loading spinner while checking auth status
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Only render children if authentication requirements are met
  if (
    (!authOnly && !guestOnly) || // Public pages
    (authOnly && session) || // Protected pages with valid session
    (guestOnly && !session) // Guest-only pages without session
  ) {
    return <>{children}</>;
  }

  return null;
}
