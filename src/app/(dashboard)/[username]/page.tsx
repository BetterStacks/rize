import { getAllEducation } from "@/actions/education-actions";
import { getAllExperience } from "@/actions/experience-actions";
import { getGalleryItems } from "@/actions/gallery-actions";
import { getSections } from "@/actions/general-actions";
import { getAllPages } from "@/actions/page-actions";
import { getUserPosts } from "@/actions/post-actions";
import { getProfileByUsername } from "@/actions/profile-actions";
import { getAllProjects } from "@/actions/project-actions";
import UserProfile from "@/components/profile/user-profile";
import ProfilePage from "@/components/ProfilePage";
import { auth } from "@/lib/auth";
import SectionContextProvider from "@/lib/section-context";
import { classifyText } from "@/lib/utils";
import { Metadata } from "next";
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

  if (!username) {
    throw new Error("Username not found");
  }

  return <ProfilePage username={username} />;
};

export default Page;
