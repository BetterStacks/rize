import { getProfileByUsername } from '@/actions/profile-actions'
import ProfilePage from '@/components/ProfilePage'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FC } from 'react'

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const isBlockedUsername = (username: string) =>
  username.includes('.') || username === 'favicon' || username.startsWith('_next')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = (await params).username

  // Block requests for static files that might slip through
  if (isBlockedUsername(username)) {
    return {
      title: 'Not Found - Rize',
      description: 'Page not found',
    }
  }

  return {
    title: `@${username} | Rize`,
    description: `Explore ${username}'s profile on Rize.`,
  }
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username

  // Block requests for static files that might slip through
  if (isBlockedUsername(username)) {
    return notFound()
  }

  const user = await getProfileByUsername(username)

  if (!user) {
    return notFound()
  }

  return <ProfilePage username={username} initialUser={user} />
}

export default Page
