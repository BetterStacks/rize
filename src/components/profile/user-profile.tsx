"use client";
import { getProfileByUsername } from "@/actions/profile-actions";
import { useSections } from "@/lib/section-context";
import {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  GetProfileByUsername,
  TEducation,
  TExperience,
} from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import Education from "../education/education";
import WorkExperience from "../experience/experience";
import Gallery from "../gallery/gallery";
import PostSection from "../posts-section";
import Projects from "../projects/projects";
import { Separator } from "../ui/separator";
import Writings from "../writings/writings";
import Profile, { defaultBio } from "./profile";
import SocialLinks from "./social-links";

type UserProfileProps = {
  data: GetProfileByUsername;
  isMine: boolean;
  gallery: GalleryItemProps[];
  writings: GetAllWritings[];
  projects: GetAllProjects[];
  education: TEducation[];
  workExperience: TExperience[];
  posts: GetExplorePosts[];
};

const UserProfile = ({
  data,
  isMine,
  gallery,
  writings,
  projects,
  education,
  workExperience,
  posts,
}: UserProfileProps) => {
  const session = useSession();
  const params = useParams<{ username: string }>();
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["get-profile-by-username", params.username],
    initialData: data,
    queryFn: () => getProfileByUsername(params.username),
  });
  const { sections } = useSections();

  const sectionMap = {
    gallery: {
      enabled: isMine ? true : gallery?.length > 0,
      component: <Gallery items={gallery} isMine={isMine} />,
    },
    posts: {
      enabled: isMine ? true : posts?.length > 0,
      component: <PostSection posts={posts} isMine={isMine} />,
    },
    writings: {
      enabled: isMine ? true : writings?.length > 0,
      component: <Writings writings={writings} isMine={isMine} />,
    },
    projects: {
      enabled: isMine ? true : projects?.length > 0,
      component: <Projects projects={projects} isMine={isMine} />,
    },
    education: {
      enabled: isMine ? true : education?.length > 0,
      component: <Education education={education} isMine={isMine} />,
    },
    experience: {
      enabled: isMine ? true : workExperience?.length > 0,
      component: (
        <WorkExperience workExperience={workExperience} isMine={isMine} />
      ),
    },
  };

  const filteredSections = useMemo(() => {
    const updated = sections.filter(
      (section) => sectionMap[section.id as keyof typeof sectionMap]?.enabled
    );
    return updated;
  }, [sections]);
  console.log({ updatedSections: filteredSections });
  const areAllSectionsDisabled = filteredSections.every(
    (section) => !section.enabled
  );

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <Profile isMine={isMine} data={profileData} isLoading={isLoading} />
      <SocialLinks isMine={isMine} />

      <Separator className="w-full mt-6 max-w-2xl" />
      {areAllSectionsDisabled && !isLoading && (
        <>
          <div className="w-full max-w-2xl p-4 flex flex-col md:flex-row items-center md:items-start justify-center mt-4">
            <p className="text-sm w-1/2 text-neutral-500 dark:text-neutral-400">
              Oops ! It seems like{" "}
              {capitalizeFirstLetter(
                profileData?.displayName?.split(" ")[0] as string
              )}{" "}
              hasn't added any content yet.
            </p>
            <Image
              src={"/empty-cat.gif"}
              className="p-4"
              alt="empty"
              width={300}
              height={300}
            />
          </div>
          <Separator className="w-full max-w-2xl" />
        </>
      )}
      {filteredSections
        ?.filter((section) => section.enabled)
        .map((section) => (
          <React.Fragment key={section?.id}>
            {section.component}
            <Separator className="w-full max-w-2xl" />
          </React.Fragment>
        ))}

      {/* {session?.status === "unauthenticated" && <BottomBanner />} */}
    </div>
  );
};

export default UserProfile;
