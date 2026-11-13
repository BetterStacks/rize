"use client";
import { getAllCertificates } from "@/actions/certificate-actions";
import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getProfileByUsername } from "@/actions/profile-actions";
import { getAllProjects } from "@/actions/project-actions";
import { getSocialLinks } from '@/actions/social-links-actions';
import { getStoryElementsByUsername } from "@/actions/story-actions";
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useEnrichedSession } from "@/lib/auth-client";
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context';
import { PROFILE_STALE_TIME } from "@/lib/profile-query";
import { useSections } from "@/lib/section-context";
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  GetProfileByUsername,
  TCertificate,
  TEducation,
  TExperience,
  TSocialLink,
  TStoryElement,
} from '@/lib/types';
import { cn } from "@/lib/utils";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import BottomBanner from '../bottom-banner';
import CertificatesList from "../certificates/certificates-list";
import Education from '../education/education';
import WorkExperience, { sortExperience } from '../experience/experience';
import Gallery from '../gallery/gallery';
import PostSection from '../posts-section';
import Projects from '../projects/projects';
import Writings from '../writings/writings';
import Profile from './profile';
import { hairline, inkSecondary } from "./profile-section";
import { ProfileCompletionWidget } from './ProfileCompletionWidget';
import ProfileDrawer from './ProfileDrawer';
import SocialLinks from './social-links';

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
  certificates: TCertificate[];
  socialLinks?: TSocialLink[];
};

// Everything here was loaded on the server and seeded into React Query, so
// these queries read the cache; they refetch only when a mutation invalidates
// their key (or the data is over a minute old).
const cached = { staleTime: PROFILE_STALE_TIME, refetchOnWindowFocus: false } as const;

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
  certificates,
  socialLinks: initialSocialLinks = [],
}: UserProfileProps) => {
  const params = useParams<{ username: string }>();
  const session = useEnrichedSession();
  const [, setActiveSidebarTab] = useActiveSidebarTab();
  const setRightSidebarOpen = useRightSidebar()[1];
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { data: profileData } = useQuery({
    queryKey: ['get-profile', params.username],
    queryFn: () => getProfileByUsername(params.username),
    initialData: data,
    enabled: !!params.username,
    ...cached,
  })

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['get-social-links', params.username],
    queryFn: () => getSocialLinks(params.username),
    initialData: initialSocialLinks,
    enabled: !!params.username,
    ...cached,
  });

  const { sections } = useSections();

  // Profile completion tracking (same key, so earlier dismissals stick)
  const [isWidgetDismissed, setIsWidgetDismissed] = useLocalStorage<boolean>({
    key: 'profile-completion-dismissed',
    defaultValue: false,
  })

  const { data: educationData } = useQuery({
    queryKey: ['get-education', params.username],
    queryFn: () => getAllEducation(params.username),
    initialData: education,
    enabled: !!params.username,
    ...cached,
  });

  const { data: experienceData } = useQuery({
    queryKey: ['get-all-experience', params.username],
    queryFn: () => getAllExperience(params.username),
    initialData: workExperience,
    enabled: !!params.username,
    ...cached,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['get-projects', params.username],
    queryFn: () => getAllProjects(params.username),
    initialData: projects,
    enabled: !!params.username,
    ...cached,
  });

  const { data: storyElementsData } = useQuery({
    queryKey: ['get-story-elements', params.username],
    queryFn: () => getStoryElementsByUsername(params.username),
    initialData: { success: true, data: storyElements },
    enabled: !!params.username,
    ...cached,
  });

  const { data: certificatesData } = useQuery({
    queryKey: ['get-certificates', params.username],
    queryFn: () => getAllCertificates(params.username),
    initialData: certificates,
    enabled: !!params.username,
    ...cached,
  });

  const profile = profileData || data;

  const { tasks, hasBasicInfo } = useProfileCompletion({
    profile,
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
      // On phones the right sidebar is a sheet: open it too.
      if (!isDesktop) setRightSidebarOpen(true)
    }
  })

  // One line under the name: the current (or latest) role.
  const tagline = useMemo(() => {
    const latest = sortExperience(experienceData || workExperience)[0];
    if (!latest?.title) return null;
    const isCurrent = latest.currentlyWorking || !latest.endDate;
    if (!isCurrent) return null;
    return latest.company ? `${latest.title} at ${latest.company}` : latest.title;
  }, [experienceData, workExperience]);

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
    certificates: {
      enabled: isMine ? true : (certificatesData?.length ?? 0) > 0,
      hasData: (certificatesData?.length ?? 0) > 0,
      component: <CertificatesList certificates={certificatesData || certificates} isMine={isMine} />,
    },
  };

  const filteredSections = useMemo(() => {
    const updated = sections.filter(
      (section) => sectionMap[section.id as keyof typeof sectionMap]?.enabled
    );

    // For the owner, populated sections come first, empty ones after.
    if (isMine) {
      return [...updated].sort((a, b) => {
        const aHasData = sectionMap[a.id as keyof typeof sectionMap]?.hasData || false;
        const bHasData = sectionMap[b.id as keyof typeof sectionMap]?.hasData || false;
        if (aHasData === bHasData) {
          return a.order - b.order;
        }
        return bHasData ? 1 : -1;
      });
    }

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
    certificatesData,
  ]);

  const areAllSectionsDisabled = filteredSections.every(
    (section) => !section.enabled
  );

  const firstName = (profile?.displayName || profile?.name || '').split(' ')[0];

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col items-stretch px-1 pb-32 pt-6 sm:pt-10">
      <Profile
        isMine={isMine}
        data={profile}
        username={profile?.username || params.username}
        tagline={tagline}
      >
        <SocialLinks isMine={isMine} initialLinks={initialSocialLinks} />
        {isMine && !isWidgetDismissed && (
          <ProfileCompletionWidget
            tasks={tasks}
            onDismiss={() => setIsWidgetDismissed(true)}
            hasBasicInfo={hasBasicInfo}
          />
        )}
      </Profile>
      {isMine && <ProfileDrawer />}

      {areAllSectionsDisabled && (
        <p className={cn('border-t py-8 text-[15px]', hairline, inkSecondary)}>
          {firstName ? `${firstName} hasn’t added anything here yet.` : 'Nothing here yet.'}
        </p>
      )}

      {filteredSections.map((section) => (
        <div key={section.id} className="w-full">
          {sectionMap[section.id as keyof typeof sectionMap]?.component}
        </div>
      ))}

      {!session?.data && !session?.isPending && <BottomBanner className="mt-8" />}
    </div>
  );
};

export default UserProfile;
