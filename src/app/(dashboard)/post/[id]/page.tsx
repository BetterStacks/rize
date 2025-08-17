import { getPostById, getPostComments } from '@/actions/post-actions'
import PostPage from '@/components/post-page'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
    <DashboardLayout 
      variant="post"
      contentMaxWidth="max-w-2xl"
      contentPadding="px-0"
    >
      <PostPage
        initialPostData={data}
        initialCommentsData={commments}
        id={id}
      />
    </DashboardLayout>
  )
}

export default Page
