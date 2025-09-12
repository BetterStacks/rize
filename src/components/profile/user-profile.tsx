'use client'
import { getProfileByUsername } from '@/actions/profile-actions'
import { useSections } from '@/lib/section-context'
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  GetProfileByUsername,
  TEducation,
  TExperience,
} from '@/lib/types'
import { capitalizeFirstLetter } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useMemo } from 'react'
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

type StoryElement = {
  id: string
  profileId: string
  type: 'mission' | 'value' | 'milestone' | 'dream' | 'superpower'
  title: string
  content: string
  order: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
  projects: GetAllProjects[];
  education: TEducation[];
  workExperience: TExperience[];
  posts: GetExplorePosts[];
  storyElements: StoryElement[];
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
  const params = useParams<{ username: string }>()
  const session = useSession()
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['get-profile-by-username', params.username],
    initialData: data,
    queryFn: () => getProfileByUsername(params.username),
  })
  const { sections } = useSections()

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
      enabled: isMine ? true : projects?.length > 0,
      hasData: projects?.length > 0,
      component: <Projects projects={projects} isMine={isMine} />,
    },
    education: {
      enabled: isMine ? true : education?.length > 0,
      hasData: education?.length > 0,
      component: <Education education={education} isMine={isMine} />,
    },
    experience: {
      enabled: isMine ? true : workExperience?.length > 0,
      hasData: workExperience?.length > 0,
      component: (
        <WorkExperience workExperience={workExperience} isMine={isMine} />
      ),
    },
  }

  const filteredSections = useMemo(() => {
    const updated = sections.filter(
      (section) => sectionMap[section.id as keyof typeof sectionMap]?.enabled
    )
    
    // For authenticated users, sort sections to show populated ones first
    if (isMine) {
      return updated.sort((a, b) => {
        const aSectionData = sectionMap[a.id as keyof typeof sectionMap]
        const bSectionData = sectionMap[b.id as keyof typeof sectionMap]
        
        const aHasData = aSectionData?.hasData || false
        const bHasData = bSectionData?.hasData || false
        
        // If both have data or both don't have data, maintain original order
        if (aHasData === bHasData) {
          return a.order - b.order
        }
        
        // Sections with data come first
        return bHasData ? 1 : -1
      })
    }
    
    // For public users, keep original filtering behavior
    return updated
  }, [sections, isMine, gallery, posts, writings, projects, education, workExperience])

  const areAllSectionsDisabled = filteredSections.every(
    (section) => !section.enabled
  )

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData} isLoading={isLoading} />
      <SocialLinks isMine={isMine} />

      {/* Story Elements Section */}
      {storyElements && storyElements.length > 0 && (
        <>
          <div className="w-full mt-8 mb-6 max-w-2xl">
            <StoryElementsDisplay elements={storyElements} />
          </div>
          <Separator className="w-full max-w-2xl" />
        </>
      )}

      <Separator className="w-full mt-6 max-w-2xl" />
      {areAllSectionsDisabled && !isLoading && (
        <>
          <div className="w-full border-2 py-6 px-4 border-dashed border-neutral-300/60 dark:border-dark-border rounded-2xl max-w-2xl p-4 flex flex-col md:flex-row items-center md:items-start justify-center mt-4">
            <p className=" md:w-1/2 text-neutral-600 dark:text-neutral-400">
              Oops ! It seems like{' '}
              {capitalizeFirstLetter(
                profileData?.displayName?.split(' ')[0] as string
              )}{' '}
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

      {!session?.data && <BottomBanner />}
    </div>
  )
}

export default UserProfile
