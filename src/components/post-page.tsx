'use client'
import { getPostById, toggleLike } from '@/actions/post-actions'
import { queryClient } from '@/lib/providers'
import { GetCommentWithProfile, GetExplorePosts } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FC, useState } from 'react'
import Comments from './comments'
import { useAuthDialog } from './dialog-provider'
import {
  HeartIcon,
  MessageIcon,
  PostAvatar,
  PostLinkCard,
} from './explore/post-interactions'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { useToggleLikePost } from '@/hooks/useToggleLike'

type PostPageProps = {
  id: string;
  initialPostData: GetExplorePosts;
  initialCommentsData: GetCommentWithProfile[];
};

const PostPage: FC<PostPageProps> = ({
  initialPostData,
  initialCommentsData,
  id,
}) => {
  const session = useSession()
  const { data: post } = useQuery({
    initialData: initialPostData,
    queryKey: ['get-post-by-id', id],
    queryFn: () => getPostById(id),
  })
  const setOpen = useAuthDialog()[1]
  const mutation = useToggleLikePost({
    liked: Boolean(post.liked),
    postId: id,
  })

  const handleLikeClick = () => {
    mutation.mutate()
  }
  return (
    <div className="w-full">
      <Card className="w-full shadow-none bg-transparent dark:bg-transparent border-none">
        <CardHeader className="px-0  mt-4 z-50 top-0 dark:bg-dark-bg/80 pt-0 backdrop-blur-md bg-white/80 border-b border-neutral-200 dark:border-dark-border pb-4">
          <div className={cn('flex items-center justify-start px-4 mt-4')}>
            <PostAvatar
              avatar={post?.avatar as string}
              name={post?.name as string}
              className="size-10"
            />

            <div className={cn(' flex flex-col items-start ml-4')}>
              <Link href={`/${post?.username}`}>
                <h2
                  className={cn(
                    ' leading-tight text-black  ',
                    'dark:text-white'
                  )}
                >
                  {post.name}
                </h2>
              </Link>
              <div
                className={cn(
                  'flex items-center justify-start dark:text-neutral-400 text-sm font-light leading-snug text-neutral-600 '
                )}
              >
                <p className={cn('mr-1')}>@{post.username}</p>
              </div>
            </div>
          </div>{' '}
        </CardHeader>
        <CardContent className="px-0 mb-2 mt-4">
          {post?.content && (
            <p
              className={cn(
                'text-neutral-600 leading-snug mb-8 mt-4 px-4  ',
                'dark:text-neutral-300 '
              )}
            >
              {post?.content?.split('\n').map((line, i) => {
                return (
                  <span className={cn('')} key={i}>
                    {line} <br className="" />
                  </span>
                )
              })}
            </p>
          )}
          <div className="overflow-x-auto px-4 w-full flex items-center justify-center">
            {post.media && (
              <div
                className={cn(
                  'relative border  border-neutral-200 aspect-video  w-full rounded-2xl overflow-hidden ',
                  'dark:border-dark-border'
                )}
                style={{
                  objectFit: 'cover',
                  // aspectRatio: post?.media?.width / post?.media?.height,
                }}
              >
                {post?.media?.type === 'image' ? (
                  <>
                    <Image
                      fill
                      src={post?.media.url}
                      alt="Post media"
                      quality={100}
                      priority
                      style={{ objectFit: 'cover' }}
                      draggable={false}
                      className=" select-none "
                    />
                  </>
                ) : (
                  <>
                    <video
                      style={{ objectFit: 'cover' }}
                      className="w-full h-full select-none  "
                      src={post?.media?.url}
                      autoPlay
                      draggable={false}
                      loop
                      muted
                      controls={false}
                    />
                  </>
                )}
              </div>
            )}
          </div>
          {post?.link && <PostLinkCard {...post?.link} />}
          <div
            className={cn(
              'px-4 text-sm  text-neutral-500 dark:text-neutral-400 mt-2',
              (post?.media || post?.link) && 'mt-4 px-6'
            )}
          >
            <span className="mr-1.5">
              {new Date(post?.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
            {'•'}
            <span className="ml-1.5 ">
              {new Date(post?.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex border-y border-neutral-200 dark:border-dark-border flex-col p-0">
          <div className=" mb-4  flex justify-start w-full gap-x-2 px-4 pt-4">
            <div
              onClick={(e) => {
                e.stopPropagation()
                if (!session?.data) {
                  setOpen(true)
                  return
                }
                handleLikeClick()
              }}
              className=" flex  text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer  py-1.5 px-3 rounded-3xl items-center justify-center gap-x-2"
            >
              <HeartIcon
                strokeWidth={1.2}
                className={cn(
                  'size-6 ',
                  (post.liked as boolean)
                    ? 'stroke-red-600 fill-red-600'
                    : 'stroke-neutral-500 dark:stroke-neutral-400'
                )}
              />
              <span className="mr-1 text-neutral-500 dark:text-neutral-400">
                {Number(post.likeCount)}
              </span>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={cn(
                'flex text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer  py-1 px-3 rounded-3xl items-center justify-center gap-x-2'
              )}
            >
              <MessageIcon
                strokeWidth={1.2}
                className={cn(
                  'size-6 ',
                  post.commented
                    ? 'stroke-blue-600 fill-blue-600'
                    : 'stroke-neutral-500 dark:stroke-neutral-400'
                )}
              />
              <span className="mr-1 text-neutral-500 dark:text-neutral-400">
                {post?.commentCount}
              </span>
            </div>
          </div>
        </CardFooter>
        <Comments
          commentCount={post?.commentCount}
          commented={Boolean(post?.commented)}
          initialData={initialCommentsData}
          id={id}
        />
      </Card>
    </div>
  )
}

export default PostPage
