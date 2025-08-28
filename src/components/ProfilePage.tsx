import { getAllEducation } from '@/actions/education-actions'
import { getAllExperience } from '@/actions/experience-actions'
import { getGalleryItems } from '@/actions/gallery-actions'
import { getSections } from '@/actions/general-actions'
import { getAllPages } from '@/actions/page-actions'
import { getUserPosts } from '@/actions/post-actions'
import { getProfileByUsername } from '@/actions/profile-actions'
import { getAllProjects } from '@/actions/project-actions'
import { getStoryElementsByUsername } from '@/actions/story-actions'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getServerSession } from '@/lib/auth'
import SectionContextProvider from '@/lib/section-context'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import UserProfile from './profile/user-profile'
import Walkthrough from './walkthrough'
import ScrollFixWrapper from './scroll-fix-wrapper'
import ProfileNotFound from './profile-not-found'
import ViewTracker from './analytics/ViewTracker'

type Props = {
  username: string;
};

const ProfilePage: FC<Props> = async ({ username }) => {
  const session = await getServerSession()
  const user = await getProfileByUsername(username)
  
  if (!user) {
    return <ProfileNotFound username={username} />
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
        avatar: page.thumbnail || '', // Provide a default or derived avatar value
      }))
    ),
    getAllProjects(username),
    getAllEducation(username),
    getAllExperience(username),
    getUserPosts(username),
    getSections(username),
    getStoryElementsByUsername(username),
  ])

  const isMine = user?.username === session?.user?.username
  const shouldStartWalkthrough =
    isMine && !session?.user?.hasCompletedWalkthrough

  return (
    <ScrollFixWrapper>
      <ViewTracker username={username} />
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
        <DashboardLayout 
          variant="profile" 
          isMine={isMine}
        >
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
            storyElements={(storyElements?.success ? storyElements.data || [] : []) as any[]}
          />
        </DashboardLayout>
      </SectionContextProvider>
    </ScrollFixWrapper>
  )
}

export default ProfilePage
