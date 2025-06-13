import { getProfileByUsername } from "@/actions/profile-actions";
import ProfilePage from "@/components/ProfilePage";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = (await params).username;
  const user = await getProfileByUsername(username);
  return {
    title: `${user?.displayName || "User"} - Rize`,
    description: ` ${user?.bio}`,
  };
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;

  // if (!username) {
  //   return notFound();
  // }

  return <ProfilePage username={username} />;
};

export default Page;
