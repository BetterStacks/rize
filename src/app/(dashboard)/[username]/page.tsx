import UserProfile from "@/components/profile/user-profile";
import { getProfileByUsername } from "@/lib/server-actions";
import { Metadata } from "next";
import { FC } from "react";
import UserProfileLayout from "@/components/layout/UserProfileLayout";
import { auth } from "@/lib/auth";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = (await params).username;
  const user = await getProfileByUsername(username);
  if (user?.error && !user?.data) {
    return {
      title: "Undefined - Rise",
    };
  }
  return {
    title: `${user.data?.name} - Rise`,
  };
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;
  const session = await auth();
  if (!username) {
    throw new Error("Username not found");
  }

  const user = await getProfileByUsername(username);
  const isMine = user?.data?.username === session?.user?.username;

  return (
    <UserProfileLayout isMine={isMine}>
      <div className="w-full flex items-center justify-center">
        <UserProfile data={user?.data} isLoading={user?.isLoading} />
      </div>
    </UserProfileLayout>
  );
};

export default Page;
