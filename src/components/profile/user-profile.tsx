"use client";
import { getProfileByUsername } from "@/actions/profile-actions";
import { useSections } from "@/lib/section-context";
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  GetProfileByUsername,
  TEducation,
  TExperience,
  TStoryElement,
} from '@/lib/types'
import { capitalizeFirstLetter } from '@/lib/utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import Education from '../education/education'
import WorkExperience from '../experience/experience'
import Gallery from '../gallery/gallery'
import PostSection from '../posts-section'
import Projects from '../projects/projects'
import { Separator } from '../ui/separator'
import Writings from '../writings/writings'
import Profile from './profile'
import SocialLinks from './social-links'
import BottomBanner from '../bottom-banner'
import { StoryElementsDisplay } from '../story/story-elements-display'
import { useSession } from '@/hooks/useAuth'
import ResumeRoaster from './ResumeRoaster'
import { ProfileCompletionWidget } from './ProfileCompletionWidget'
import { useProfileCompletion } from '@/hooks/useProfileCompletion'
import { getSocialLinks } from '@/actions/social-links-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { usePanel } from "@/lib/panel-context";
import { useEnrichedSession } from "@/lib/auth-client";
import { getGalleryItems } from "@/actions/gallery-actions";
import { getAllPages } from "@/actions/page-actions";
import { getAllProjects } from "@/actions/project-actions";
import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getUserPosts } from "@/actions/post-actions";
import { getStoryElementsByUsername } from "@/actions/story-actions";
import { getSections } from "@/actions/general-actions";
import { profileSections } from "@/db/schema";
import { useLocalStorage } from "@mantine/hooks";
import { useAIPromptDialog } from "@/components/dialog-provider";
import { useEffect } from "react";

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
  projects: GetAllProjects[];
  education: TEducation[];
  workExperience: TExperience[];
  posts: GetExplorePosts[];
  storyElements: TStoryElement[];
};

const UserProfile = ({
  data,
  isMine,
  gallery,
  writings,
  projects,
  education,
  workExperience,
  posts,
  storyElements,
}: UserProfileProps) => {
  const params = useParams<{ username: string }>();
  const session = useEnrichedSession();
  const [, setActiveSidebarTab] = useActiveSidebarTab();
  const { toggleRightPanel, rightPanelRef } = usePanel()


  const { data: profileData, isLoading } = useQuery({
    queryKey: ['get-profile', params.username],
    queryFn: () => getProfileByUsername(params.username),
    enabled: !!params.username,
  })

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['get-social-links', params.username],
    queryFn: () => getSocialLinks(params.username),
    enabled: !!params.username,
  });

  const { sections } = useSections();

  // Profile completion tracking
  const [isWidgetDismissed, setIsWidgetDismissed] = useLocalStorage<boolean>({
    key: 'profile-completion-dismissed',
    defaultValue: false,
  })


  const { data: educationData } = useQuery({
    queryKey: ['get-education', params.username],
    queryFn: () => getAllEducation(params.username),
    initialData: education,
    enabled: !!params.username,
  });

  const { data: experienceData } = useQuery({
    queryKey: ['get-all-experience', params.username],
    queryFn: () => getAllExperience(params.username),
    initialData: workExperience,
    enabled: !!params.username,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['get-projects', params.username],
    queryFn: () => getAllProjects(params.username),
    initialData: projects,
    enabled: !!params.username,
  });

  const { data: storyElementsData } = useQuery({
    queryKey: ['get-story-elements', params.username],
    queryFn: () => getStoryElementsByUsername(params.username),
    initialData: { success: true, data: storyElements },
    enabled: !!params.username,
  });

  const { tasks, isComplete, hasBasicInfo } = useProfileCompletion({
    profile: profileData || data,
    gallery,
    writings,
    projects: projectsData || projects,
    education: educationData || education,
    workExperience: experienceData || workExperience,
    posts,
    storyElements: (storyElementsData?.success ? storyElementsData.data : storyElements) as TStoryElement[],
    socialLinks,
    onOpenChat: () => {
      setActiveSidebarTab({ id: null, tab: 'chat' })
      if (rightPanelRef?.current?.isCollapsed()) {
        toggleRightPanel()
      }
    }
  })

  const [isAIPromptDismissed] = useLocalStorage<boolean>({
    key: 'ai-prompt-dismissed',
    defaultValue: false,
  })

  const [, setIsAIPromptDialogOpen] = useAIPromptDialog()

  useEffect(() => {
    if (isMine && !isComplete && !isAIPromptDismissed && !isLoading) {
      const timer = setTimeout(() => {
        setIsAIPromptDialogOpen(true)
      }, 2000) // Show after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [isMine, isComplete, isAIPromptDismissed, isLoading, setIsAIPromptDialogOpen])

  const handleDismissWidget = () => {
    setIsWidgetDismissed(true)
  }

  const sectionMap = {
    gallery: {
      enabled: isMine ? true : gallery?.length > 0,
      hasData: gallery?.length > 0,
      component: <Gallery items={gallery} isMine={isMine} />,
    },
    posts: {
      enabled: isMine ? true : posts?.length > 0,
      hasData: posts?.length > 0,
      component: <PostSection posts={posts} isMine={isMine} />,
    },
    writings: {
      enabled: isMine ? true : writings?.length > 0,
      hasData: writings?.length > 0,
      component: <Writings writings={writings} isMine={isMine} />,
    },
    projects: {
      enabled: isMine ? true : (projectsData?.length ?? 0) > 0,
      hasData: (projectsData?.length ?? 0) > 0,
      component: <Projects projects={projectsData || projects} isMine={isMine} />,
    },
    education: {
      enabled: isMine ? true : (educationData?.length ?? 0) > 0,
      hasData: (educationData?.length ?? 0) > 0,
      component: <Education education={educationData || education} isMine={isMine} />,
    },
    experience: {
      enabled: isMine ? true : (experienceData?.length ?? 0) > 0,
      hasData: (experienceData?.length ?? 0) > 0,
      component: (
        <WorkExperience workExperience={experienceData || workExperience} isMine={isMine} />
      ),
    },
  };

  const filteredSections = useMemo(() => {
    const updated = sections.filter(
      (section) => sectionMap[section.id as keyof typeof sectionMap]?.enabled
    );

    // For authenticated users, sort sections to show populated ones first
    if (isMine) {
      return updated.sort((a, b) => {
        const aSectionData = sectionMap[a.id as keyof typeof sectionMap];
        const bSectionData = sectionMap[b.id as keyof typeof sectionMap];

        const aHasData = aSectionData?.hasData || false;
        const bHasData = bSectionData?.hasData || false;

        // If both have data or both don't have data, maintain original order
        if (aHasData === bHasData) {
          return a.order - b.order;
        }

        // Sections with data come first
        return bHasData ? 1 : -1;
      });
    }

    // For public users, keep original filtering behavior
    return updated;
  }, [
    sections,
    isMine,
    gallery,
    posts,
    writings,
    projectsData,
    educationData,
    experienceData,
  ]);

  const areAllSectionsDisabled = filteredSections.every(
    (section) => !section.enabled
  );

  return (
    <div className="w-full flex relative flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData!} isLoading={isLoading} username={profileData?.username || params.username} />
      <SocialLinks isMine={isMine} />

      {isMine && (
        <div className='w-full max-w-2xl'>
          <ResumeRoaster />
        </div>
      )}

      {/* Story Elements Section */}
      {/* {storyElements && storyElements.length > 0 && (
        <>
          <div className="w-full mt-8 mb-6 max-w-2xl">
            <StoryElementsDisplay elements={storyElements} />
          </div>
          <Separator className="w-full max-w-2xl" />
        </>
      )} */}

      <Separator className="w-full mt-6 max-w-2xl" />
      {areAllSectionsDisabled && !isLoading && (
        <>
          <div className="w-full border-2 py-6 px-4 border-dashed border-neutral-300/60 dark:border-dark-border rounded-2xl max-w-2xl p-4 flex flex-col md:flex-row items-center md:items-start justify-center mt-4">
            <p className=" md:w-1/2 text-neutral-600 dark:text-neutral-400">
              Oops ! It seems like{" "}
              {capitalizeFirstLetter(
                profileData?.displayName?.split(" ")[0] as string
              )}{" "}
              hasn't added any content yet. 🍃
            </p>
          </div>
        </>
      )}
      {filteredSections
        ?.filter((section) => section.enabled)
        .map((section) => (
          <React.Fragment key={section?.id}>
            {section.component}
            <Separator className="w-full max-w-2xl" />
          </React.Fragment>
        ))}

      {!session?.data && !session?.isPending && <BottomBanner />}

      {/* Profile Completion Widget - Only show for own profile */}
      {isMine && !isWidgetDismissed && (
        <ProfileCompletionWidget
          tasks={tasks}
          onDismiss={handleDismissWidget}
          hasBasicInfo={hasBasicInfo}
        />
      )}
    </div>
  );
};

export default UserProfile;
