'use server'
import { getAllEducation } from '@/actions/education-actions'
import { getAllExperience } from '@/actions/experience-actions'
import { getGalleryItems } from '@/actions/gallery-actions'
import { getSections } from '@/actions/general-actions'
import { getAllPages } from '@/actions/page-actions'
import { getUserPosts } from '@/actions/post-actions'
import { getProfileByUsername } from '@/actions/profile-actions'
import { getAllProjects } from '@/actions/project-actions'
import UserProfileLayout from '@/components/layout/UserProfileLayout'
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
  const [
    gallery,
    writings,
    projects,
    education,
    workExperience,
    posts,
    sections,
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
      <UserProfileLayout isMine={isMine} className={cn('overflow-hidden')}>
        <div className="w-full flex items-center justify-center">
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
          />
        </div>
      </UserProfileLayout>
    </SectionContextProvider>
  )
}

export default ProfilePage
