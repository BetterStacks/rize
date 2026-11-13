import DashboardLayout from "@/components/layout/DashboardLayout";
import RightSidebar from "@/components/sidebar/RightSidebar";
import { loadProfilePage } from "@/lib/profile-page-data";
import { isUsernameReserved } from "@/lib/reserved-usernames";
import SectionContextProvider from "@/lib/section-context";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";
import ViewTracker from "./analytics/ViewTracker";
import PhoneCollectionModal from "./onboarding/phone-collection-modal";
import ProfileNotFound from "./profile-not-found";
import UserProfile from "./profile/user-profile";
import ScrollFixWrapper from "./scroll-fix-wrapper";
import Sidebar from "./sidebar/Sidebar";

type Props = {
  username: string;
};

const ProfilePage: FC<Props> = async ({ username }) => {
  // Check if username is reserved - if so, show 404
  if (isUsernameReserved(username)) {
    notFound();
  }

  // One cached loader: the session, then a single parallel batch of queries.
  const data = await loadProfilePage(username);

  if (!data) {
    return <ProfileNotFound username={username} />;
  }

  const {
    session,
    isMine,
    user,
    gallery,
    writings,
    projects,
    education,
    workExperience,
    posts,
    sections,
    storyElements,
    certificates,
    socialLinks,
    hasCallSuggestions,
  } = data;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  // "Later" on the call setup dialog, remembered per user (see skipOnboarding).
  // The session-token key is the old format, still honoured until it expires.
  const hasSkipped =
    (session?.user?.id && cookieStore.get(`phone_skipped_${session.user.id}`)) ||
    (session?.session?.token && cookieStore.get(`phone_skipped_${session.session.token}`));

  const shouldShowPhoneModal =
    isMine &&
    session?.user &&
    !hasSkipped &&
    !session.user.phoneNumberVerified &&
    !session.user.onboardingCallId;

  // Seed the client cache with what the server already loaded, under the
  // same keys the sections use, so nothing is fetched again after hydration.
  // Hydration only overwrites cached data that is older than this.
  const queryClient = new QueryClient();
  const seed: Array<[string, unknown]> = [
    ["get-profile", user],
    ["get-social-links", socialLinks],
    ["get-gallery-items", gallery],
    ["get-user-posts", posts],
    ["get-writings", writings],
    ["get-projects", projects],
    ["get-education", education],
    ["get-all-experience", workExperience],
    ["get-certificates", certificates],
    ["get-story-elements", { success: true, data: storyElements }],
    ["get-profile-sections", sections],
  ];
  for (const [key, value] of seed) {
    queryClient.setQueryData([key, username], value);
  }

  return (
    <ScrollFixWrapper>
      <ViewTracker username={username} />

      {shouldShowPhoneModal && (
        <PhoneCollectionModal
          isOpen={true}
          userName={session?.user?.displayName || "there"}
        />
      )}

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SectionContextProvider
          isMine={isMine}
          gallery={gallery}
          writings={writings}
          projects={projects}
          education={education}
          workExperience={workExperience}
          posts={posts}
          certificates={certificates}
          profileSections={sections}
        >
          <DashboardLayout
            variant="profile"
            isMine={isMine}
            leftSidebarSlot={
              session
                ? {
                  content: <Sidebar className="border-none w-full" />,
                  size: 5,
                  minSize: 5,
                  maxSize: 5,
                }
                : undefined
            }
            rightSidebarSlot={
              isMine
                ? {
                  content: <RightSidebar className="w-full" />,
                  size: 25,
                  maxSize: 25,
                  minSize: 25,
                }
                : undefined
            }
          >
            {hasCallSuggestions && (
              <div className="mx-auto w-full max-w-2xl px-4 pt-4 text-sm">
                <Link
                  href="/settings/voice"
                  className="text-[#5A5248] underline underline-offset-4 hover:text-[#1F1B16] dark:text-[#B3A999] dark:hover:text-[#F3EEE6]"
                >
                  Review what we heard on your call
                </Link>
              </div>
            )}
            <UserProfile
              isMine={isMine}
              data={user}
              gallery={gallery}
              writings={writings}
              projects={projects}
              education={education}
              workExperience={workExperience}
              posts={posts}
              storyElements={storyElements}
              certificates={certificates}
            />
          </DashboardLayout>
        </SectionContextProvider>
      </HydrationBoundary>
    </ScrollFixWrapper>
  );
};

export default ProfilePage;
