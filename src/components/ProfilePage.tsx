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
import { getServerSession } from "@/lib/auth";
import SectionContextProvider from "@/lib/section-context";
import { cn } from "@/lib/utils";
import { isUsernameReserved } from "@/lib/reserved-usernames";
import { notFound } from "next/navigation";
import { FC } from "react";
import UserProfile from "./profile/user-profile";
import Walkthrough from "./walkthrough";
import ScrollFixWrapper from "./scroll-fix-wrapper";
import ProfileNotFound from "./profile-not-found";
import ViewTracker from "./analytics/ViewTracker";
import PhoneCollectionModal from "./onboarding/phone-collection-modal";
import { TStoryElement } from "@/lib/types";

type Props = {
  username: string;
};

const ProfilePage: FC<Props> = async ({ username }) => {
  // Check if username is reserved - if so, show 404
  if (isUsernameReserved(username)) {
    notFound();
  }

  const session = await getServerSession();
  // console.log(session);
  const user = await getProfileByUsername(username);

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
          userName={session?.user?.name || "there"}
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
        profileSections={sections}
      >
        <DashboardLayout variant="profile" isMine={isMine}>
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
          />
        </DashboardLayout>
      </SectionContextProvider>
    </ScrollFixWrapper>
  );
};

export default ProfilePage;
