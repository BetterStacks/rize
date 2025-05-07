"use client";
import { getProfileByUsername } from "@/actions/profile-actions";
import { useSections } from "@/lib/context";
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetProfileByUsername,
  TEducation,
  TExperience,
  TSection,
} from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Education from "../education/education";
import WorkExperience from "../experience/experience";
import Gallery from "../gallery/gallery";
import MansoryGallery from "../gallery/mansory-gallery";
import Projects from "../projects/projects";
import { Separator } from "../ui/separator";
import Writings from "../writings/writings";
import Profile from "./profile";

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
  projects: GetAllProjects[];
  education: TEducation[];
  workExperience: TExperience[];
};

const UserProfile = ({
  data,
  isMine,
  gallery,
  writings,
  projects,
  education,
  workExperience,
}: UserProfileProps) => {
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
      component: (
        <>
          <Gallery items={gallery} isMine={isMine} />
          {/* <MansoryGallery items={gallery} isMine={isMine} /> */}
        </>
      ),
      enabled: true,
    },
    {
      id: "writings",
      name: "Writings",
      component: <Writings writings={writings} isMine={isMine} />,
      enabled: true,
    },
    {
      id: "projects",
      name: "Projects",
      component: <Projects projects={projects} isMine={isMine} />,
      enabled: true,
    },
    {
      id: "education",
      name: "Education",
      component: <Education education={education} isMine={isMine} />,
      enabled: true,
    },
    {
      id: "work-experience",
      name: "Experience",
      component: (
        <WorkExperience workExperience={workExperience} isMine={isMine} />
      ),
      enabled: true,
    },
  ];

  useEffect(() => {
    setSections(sectionsList);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData} isLoading={isLoading} />
      <Separator className="w-full max-w-2xl" />
      {sections
        ?.filter((section) => section.enabled)
        .map((section) => (
          <React.Fragment key={section?.id}>
            {section.component}
            <Separator className="w-full max-w-2xl" />
          </React.Fragment>
        ))}
    </div>
  );
};

export default UserProfile;
