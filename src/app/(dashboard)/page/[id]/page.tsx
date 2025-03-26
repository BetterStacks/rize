import Editor from "@/components/editor/editor";
import EditorContextProvider from "@/components/editor/editor-context";
import PageLayout from "@/components/layout/PageLayout";
import { auth } from "@/lib/auth";
import { getPageById, getProfileById } from "@/lib/server-actions";
import { Metadata } from "next";
import { FC } from "react";

type PageProps = {
  params: { id: string };
};
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const data = await getPageById(params.id);

  if (!data) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found",
      openGraph: {
        images: [],
      },
    };
  }

  return {
    title: data.title,
    openGraph: {
      images: [data.thumbnail as string],
    },
  };
}

const Page: FC<PageProps> = async ({ params }) => {
  const data = await getPageById(params.id as string);
  console.log({ data });
  const author = await getProfileById(data?.profileId as string);
  const session = await auth();
  const isMyPage = data?.profileId === session?.user?.profileId;
  return (
    <EditorContextProvider state={data}>
      <PageLayout isMyPage={isMyPage}>
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-3xl">
            {/* @ts-ignore */}
            <Editor author={author} />
          </div>
        </div>
      </PageLayout>
    </EditorContextProvider>
  );
};

export default Page;
