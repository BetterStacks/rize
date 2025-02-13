import UserProfile from "@/components/profile/user-profile";
import { auth } from "@/lib/auth";
import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import React, { FC } from "react";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const user = await auth();

  return {
    title: `${user?.user?.name} - Rise`,
  };
}

const Page: FC<Props> = async ({ params }) => {
  const username = (await params).username;
  const user = await auth();
  if (username !== user?.user?.username) {
    // throw new Error("You are not authorized to view this page");
    redirect("/login");
  }
  return (
    <div className="w-full flex items-center justify-center">
      <UserProfile />
    </div>
  );
};

export default Page;
