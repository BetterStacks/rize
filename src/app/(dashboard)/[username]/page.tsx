import { loadProfilePage } from "@/lib/profile-page-data";
import ProfilePage from "@/components/ProfilePage";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FC } from "react";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const isBlockedUsername = (username: string) =>
  username.includes(".") ||
  username === "favicon" ||
  username.startsWith("_next");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = (await params).username;

  // Block requests for static files that might slip through
  if (isBlockedUsername(username)) {
    return {
      title: "Not Found - Rize",
      description: "Page not found",
    };
  }

  // Shares the page's cached load, so metadata adds no queries.
  const user = (await loadProfilePage(username))?.user;

  // Missing and unclaimed profiles get the same metadata.
  if (!user) {
    return {
      title: "Not Found - Rize",
      description: "Page not found",
    };
  }

  const titleName = user.displayName?.trim() || username;

  return {
    title: `${titleName} | Rize`,
    description: `Explore ${username}'s profile on Rize.`,
  };
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;

  // Block requests for static files that might slip through
  if (isBlockedUsername(username)) {
    return notFound();
  }

  return <ProfilePage username={username} />;
};

export default Page;
