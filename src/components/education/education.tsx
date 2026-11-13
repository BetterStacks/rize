"use client";
import { getAllEducation } from "@/actions/education-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { PROFILE_STALE_TIME } from "@/lib/profile-query";
import { TEducation } from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { EmptyLine, ProfileSection, SectionNewButton } from "../profile/profile-section";
import EducationCard from "./education-card";
import EducationDrawer from "./education-drawer";

type EducationProps = {
  isMine: boolean;
  education: TEducation[];
};

const Education = ({ isMine, education }: EducationProps) => {
  const { username } = useParams<{ username: string }>();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];
  const { data = [] } = useQuery({
    queryKey: ["get-education", username],
    initialData: education,
    queryFn: () => getAllEducation(username),
    staleTime: PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const setActiveTab = useActiveSidebarTab()[1];

  const openForm = () => {
    setActiveTab({ id: null, tab: "education" });
    if (!isDesktop) {
      setOpen(true);
    }
  };

  if (!isMine && data.length === 0) return null;

  return (
    <ProfileSection
      id="education"
      title="Education"
      actions={isMine ? <SectionNewButton onClick={openForm} what="education" /> : undefined}
    >
      <EducationDrawer />
      {data.length === 0 ? (
        <EmptyLine text="No education yet" actionLabel="Add education" onAction={openForm} />
      ) : (
        <ol className="flex flex-col">
          {data.map((item) => (
            <EducationCard key={item.id} education={item} isMine={isMine} />
          ))}
        </ol>
      )}
    </ProfileSection>
  );
};

export default Education;
