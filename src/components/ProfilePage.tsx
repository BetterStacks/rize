'use server'
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
import { auth } from '@/lib/auth'
import SectionContextProvider from '@/lib/section-context'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import UserProfile from './profile/user-profile'
import Walkthrough from './walkthrough'

type Props = {
  username: string;
};

const ProfilePage: FC<Props> = async ({ username }) => {
  const session = await auth()
  const user = await getProfileByUsername(username)
  
  if (!user) {
    // Profile not found - show 404 or create profile if it's the user's own profile
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The profile "@{username}" doesn't exist or hasn't been set up yet.
          </p>
          {session?.user?.username === username && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              It looks like this is your profile. Please complete your onboarding to set it up.
            </p>
          )}
        </div>
      </div>
    )
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
        className={cn('overflow-hidden')}
        profile={{
          displayName: user?.displayName || user?.username || 'User',
          username: user?.username || '',
          bio: user?.bio || '',
          profileImage: user?.profileImage || '',
          location: user?.location,
          experience: workExperience?.map(exp => ({
            title: exp.title,
            company: exp.company,
            currentlyWorking: exp.currentlyWorking
          })) || [],
          projects: projects?.map(proj => ({
            name: proj.name,
            description: proj.description
          })) || []
        }}
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
  )
}

export default ProfilePage
