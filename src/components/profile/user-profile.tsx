"use client";
import { useSections } from "@/lib/context";
import { useSession } from "next-auth/react";
import React from "react";
import Profile from "./profile";

const UserProfile = () => {
  const s = useSession();
  console.log({ data: s?.data });
  const { sections } = useSections();
  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile />
      {sections.map((section) => (
        <React.Fragment key={section?.id}>{section.component}</React.Fragment>
      ))}
    </div>
  );
};

export default UserProfile;
