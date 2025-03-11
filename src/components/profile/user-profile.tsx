"use client";
import { useSections } from "@/lib/context";
import { GetProfileByUsername } from "@/lib/types";
import React from "react";
import Profile from "./profile";
import { useSession } from "next-auth/react";

type UserProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
};

const UserProfile = ({ data, isLoading }: UserProfileProps) => {
  const { sections } = useSections();
  const session = useSession();
  console.log({ session });
  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile data={data} isLoading={isLoading} />
      {sections.map((section) => (
        <React.Fragment key={section?.id}>{section.component}</React.Fragment>
      ))}
    </div>
  );
};

export default UserProfile;
