"use client";
import { useSections } from "@/lib/context";
import { getProfileByUsername } from "@/actions/profile-actions";
import {
  GalleryItemProps,
  GetAllWritings,
  GetProfileByUsername,
} from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { ReactNode, Suspense, useEffect } from "react";
import Gallery from "../gallery/gallery";
import { Separator } from "../ui/separator";
import Writings from "../writings/writings";
import Profile from "./profile";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
};

type TSection = {
  id: string;
  name: string;
  component: ReactNode;
};

const Highlights = dynamic(() => import("../highlights"), {
  loading: () => (
    <div className="w-full flex mt-4  items-start justify-center">
      <div className="max-w-2xl w-full flex ">
        <div className="w-full h-full flex space-x-3 items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="w-[170px]  rounded-3xl border border-neutral-200 dark:border-dark-border"
              style={{ aspectRatio: 9 / 16 }}
            />
          ))}
        </div>
      </div>
    </div>
  ),
});

const UserProfile = ({ data, isMine, gallery, writings }: UserProfileProps) => {
  const params = useParams<{ username: string }>();
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["get-profile-by-username", params.username],
    initialData: data,
    queryFn: () => getProfileByUsername(params.username),
  });
  const { sections, setSections } = useSections();

  const sectionsList: TSection[] = [
    {
      id: "gallery",
      name: "Gallery",
      component: <Gallery items={gallery} isMine={isMine} />,
    },
    {
      id: "writings",
      name: "Writings",
      component: <Writings writings={writings} isMine={isMine} />,
    },
  ];

  useEffect(() => {
    setSections(sectionsList);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData} isLoading={isLoading} />
      <Separator className="w-full max-w-2xl" />
      <Highlights data={gallery} isMine={isMine} />
      {sections.map((section) => (
        <React.Fragment key={section?.id}>{section.component}</React.Fragment>
      ))}
    </div>
  );
};

export default UserProfile;
