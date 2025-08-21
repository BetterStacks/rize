import Editor from '@/components/editor/editor'
import EditorContextProvider from '@/components/editor/editor-context'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getServerSession } from '@/lib/auth'
import { getProfileById } from '@/actions/profile-actions'
import { Metadata } from 'next'
import { FC } from 'react'
import { getPageById } from '@/actions/page-actions'

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const data = await getPageById((await params).id)

  if (!data) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found',
      openGraph: {
        images: [],
      },
    }
  }

  return {
    title: data.title,
    openGraph: {
      images: [data.thumbnail as string],
    },
  }
}

const Page: FC<PageProps> = async ({ params }) => {
  const data = await getPageById((await params)?.id as string)
  const author = await getProfileById(data?.profileId as string)
  const session = await getServerSession()
  const isMyPage = data?.profileId === session?.user?.profileId
  
  return (
    <EditorContextProvider state={data}>
      <DashboardLayout 
        variant="writing"
        isMine={isMyPage}
        contentMaxWidth="max-w-4xl"
        contentPadding="px-6"
      >
        {/* @ts-expect-error */}
        <Editor author={author} />
      </DashboardLayout>
    </EditorContextProvider>
  )
}

export default Page
