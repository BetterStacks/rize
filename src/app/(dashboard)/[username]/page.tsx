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
  
  // Block requests for static files that might slip through
  if (username.includes('.') || username === 'favicon' || username.startsWith('_next')) {
    return {
      title: "Not Found - Rize",
      description: "Page not found",
    };
  }
  
  try {
    const user = await getProfileByUsername(username);
    return {
      title: `${user?.displayName || "User"} - Rize`,
      description: ` ${user?.bio}`,
    };
  } catch (error) {
    return {
      title: "Profile Not Found - Rize",
      description: "This profile could not be found",
    };
  }
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;

  // Block requests for static files that might slip through
  if (username.includes('.') || username === 'favicon' || username.startsWith('_next')) {
    return notFound();
  }

  return <ProfilePage username={username} />;
};

export default Page;
