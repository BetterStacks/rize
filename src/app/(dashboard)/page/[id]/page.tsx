import Editor from "@/components/editor/editor";
import { getPageById } from "@/lib/server-actions";
import { FC } from "react";

type PageProps = {
  params: { id: string };
};

const Page: FC<PageProps> = async ({ params }) => {
  const data = await getPageById(params.id as string);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <Editor data={data?.data!} />
      </div>
    </div>
  );
};

export default Page;
