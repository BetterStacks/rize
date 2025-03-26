"use client";
import { useSections } from "@/lib/context";
import { GetProfileByUsername } from "@/lib/types";
import React, { ReactNode, useEffect } from "react";
import Profile from "./profile";
import { useSession } from "next-auth/react";
import Writings from "../writings/writings";
import Gallery from "../gallery/gallery";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUsername } from "@/lib/server-actions";
import { useParams, usePathname } from "next/navigation";
import { Separator } from "../ui/separator";

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
};

type TSection = {
  id: string;
  name: string;
  component: ReactNode;
};

const UserProfile = ({ data, isMine }: UserProfileProps) => {
  const params = useParams<{ username: string }>();
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["get-profile-by-username", params.username],
    initialData: data,
    queryFn: () => getProfileByUsername(params.username),
  });
  const { sections, setSections } = useSections();
  const session = useSession();
  const sectionsList: TSection[] = [
    { id: "gallery", name: "Gallery", component: <Gallery /> },
    {
      id: "writings",
      name: "Writings",
      component: <Writings isMine={isMine} />,
    },
  ];

  useEffect(() => {
    setSections(sectionsList);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData} isLoading={isLoading} />
      <Separator className="w-full max-w-2xl" />
      {sections.map((section) => (
        <React.Fragment key={section?.id}>{section.component}</React.Fragment>
      ))}
    </div>
  );
};

export default UserProfile;
