import { getUserPosts } from '@/actions/post-actions'
import { PROFILE_STALE_TIME } from '@/lib/profile-query'
import { GetExplorePosts } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { usePostsDialog } from './dialog-provider'
import PostCard from './explore/post-card'
import { EmptyLine, ProfileSection, SectionNewButton } from './profile/profile-section'

type Props = {
  posts: GetExplorePosts[];
  isMine: boolean;
};

const PostSection: FC<Props> = ({ posts, isMine }) => {
  const { username } = useParams<{ username: string }>()
  const setOpen = usePostsDialog()[1]
  const { data = [] } = useQuery({
    queryKey: ['get-user-posts', username],
    initialData: posts,
    queryFn: () => getUserPosts(username),
    refetchOnWindowFocus: false,
    staleTime: PROFILE_STALE_TIME,
  })

  if (!isMine && data.length === 0) return null

  return (
    <ProfileSection
      id="posts"
      title="Posts"
      actions={isMine ? <SectionNewButton onClick={() => setOpen(true)} what="post" /> : undefined}
    >
      {data.length === 0 ? (
        <EmptyLine text="No posts yet" actionLabel="Write a post" onAction={() => setOpen(true)} />
      ) : (
        <div className="w-full columns-1 gap-4 space-y-4 md:columns-2">
          {data.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard post={post} showHeader={false} />
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  )
}

export default PostSection
