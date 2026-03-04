import { getAllCertificates } from "@/actions/certificate-actions";
import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getGalleryItems } from "@/actions/gallery-actions";
import { getSections } from "@/actions/general-actions";
import { getAllPages } from "@/actions/page-actions";
import { getUserPosts } from "@/actions/post-actions";
import { getProfileByUsername } from "@/actions/profile-actions";
import { getAllProjects } from "@/actions/project-actions";
import { getStoryElementsByUsername } from "@/actions/story-actions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RightSidebar from "@/components/sidebar/RightSidebar";
import { getServerSession } from "@/lib/auth";
import { isUsernameReserved } from "@/lib/reserved-usernames";
import SectionContextProvider from "@/lib/section-context";
import { TStoryElement } from "@/lib/types";
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
  initialUser?: Awaited<ReturnType<typeof getProfileByUsername>> | null;
};

const ProfilePage: FC<Props> = async ({ username, initialUser = null }) => {
  // Check if username is reserved - if so, show 404
  if (isUsernameReserved(username)) {
    notFound();
  }

  const [session, fetchedUser] = await Promise.all([
    getServerSession(),
    initialUser ? Promise.resolve(initialUser) : getProfileByUsername(username),
  ]);
  const user = fetchedUser;

  if (!user) {
    return <ProfileNotFound username={username} />;
  }
  const [
    gallery,
    writings,
    projects,
    education,
    workExperience,
    posts,
    sections,
    storyElements,
    certificates,
  ] = await Promise.all([
    getGalleryItems(username),
    getAllPages(username).then((pages) =>
      pages.map((page) => ({
        ...page,
        avatar: page.thumbnail || "", // Provide a default or derived avatar value
      }))
    ),
    getAllProjects(username),
    getAllEducation(username),
    getAllExperience(username),
    getUserPosts(username),
    getSections(username),
    getStoryElementsByUsername(username),
    getAllCertificates(username),
  ]);

  const isMine = user?.username === session?.user?.username;
  const shouldStartWalkthrough =
    isMine && !session?.user?.hasCompletedWalkthrough;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const hasSkipped = session?.session?.token
    ? cookieStore.get(`phone_skipped_${session.session.token}`)
    : null;

  const shouldShowPhoneModal =
    isMine && session?.user && !hasSkipped
    && !session.user.phoneNumberVerified && !session.user.onboardingCallId


  return (
    <ScrollFixWrapper>
      <ViewTracker username={username} />

      {shouldShowPhoneModal && (
        <PhoneCollectionModal
          isOpen={true}
          userName={session?.user?.displayName || "there"}
        />
      )}

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
        <DashboardLayout variant="profile" isMine={isMine}
          leftSidebarSlot={session ? { content: <Sidebar className='border-none w-full' />, size: 5, minSize: 5, maxSize: 5 } : undefined}
          rightSidebarSlot={isMine ? {
            content: <RightSidebar className="w-full" />,
            size: 25,
            maxSize: 25,
            minSize: 25,

          } : undefined}>
          {/* {shouldStartWalkthrough && <Walkthrough />} */}
          <UserProfile
            isMine={isMine}
            data={user}
            gallery={gallery}
            writings={writings}
            projects={projects}
            education={education}
            workExperience={workExperience}
            posts={posts}
            storyElements={
              (storyElements?.success ? storyElements.data || [] : []) as TStoryElement[]
            }
            certificates={certificates}
          />
        </DashboardLayout>
      </SectionContextProvider>
    </ScrollFixWrapper>
  );
};

export default ProfilePage;
