import { getPostById, getPostComments } from '@/actions/post-actions'
// import Comments from '@/components/comments'
// import ExploreFeed from '@/components/explore/explore-feed'
import PostPage from '@/components/post-page'
// import RecentlyJoined from '@/components/recently-joined'
import Sidebar from '@/components/sidebar/Sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { FC } from 'react'

type PageProps = {
  params: Promise<{ id: string }>;
};

const Page: FC<PageProps> = async ({ params }) => {
  const id = (await params)?.id as string
  const [data, commments] = await Promise.all([
    getPostById(id),
    getPostComments(id, 'newest'),
  ])
  return (
    <div className="w-full flex h-screen  overflow-hidden  items-center  justify-center">
      <div className="max-w-sm w-full hidden xl:flex  items-center justify-end">
        <Sidebar className="border-none w-full " />
      </div>
      <div className="max-w-2xl  w-full border-x border-neutral-300/60 dark:border-dark-border">
        <ScrollArea className="h-screen overflow-y-auto w-full ">
          <div className="flex flex-col w-full items-center justify-start ">
            <PostPage
              initialPostData={data}
              initialCommentsData={commments}
              id={id}
            />
          </div>
        </ScrollArea>
      </div>
      <div className="max-w-sm w-full hidden xl:flex  "></div>
    </div>
  )
}

export default Page
