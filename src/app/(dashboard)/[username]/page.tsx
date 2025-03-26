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

  return {
    title: `${user?.name} - Rise`,
  };
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;
  const session = await auth();
  if (!username) {
    throw new Error("Username not found");
  }

  const user = await getProfileByUsername(username);

  const isMine = user?.username === session?.user?.username;

  return (
    <UserProfileLayout isMine={isMine}>
      <div className="w-full flex items-center justify-center">
        <UserProfile isMine={isMine} data={user} />
      </div>
    </UserProfileLayout>
  );
};

export default Page;
