"use client";
import { getAllExperience } from "@/actions/experience-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { PROFILE_STALE_TIME } from "@/lib/profile-query";
import { TExperience } from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { EmptyLine, ProfileSection, SectionNewButton } from "../profile/profile-section";
import ExperienceCard from "./experience-card";
import WorkExperienceDrawer from "./experience-drawer";

type WorkExperienceProps = {
  isMine: boolean;
  workExperience: TExperience[];
};

const time = (d?: Date | string | null) => (d ? new Date(d).getTime() : 0);

/** Current roles first, then most recent start date. */
export const sortExperience = (items: TExperience[]) =>
  [...items].sort((a, b) => {
    const aCurrent = a.currentlyWorking || !a.endDate ? 1 : 0;
    const bCurrent = b.currentlyWorking || !b.endDate ? 1 : 0;
    if (aCurrent !== bCurrent) return bCurrent - aCurrent;
    return time(b.startDate) - time(a.startDate);
  });

const WorkExperience = ({ isMine, workExperience }: WorkExperienceProps) => {
  const { username } = useParams<{ username: string }>();
  const setOpen = useRightSidebar()[1];
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { data = [] } = useQuery({
    queryKey: ["get-all-experience", username],
    initialData: workExperience,
    queryFn: () => getAllExperience(username),
    staleTime: PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const sorted = useMemo(() => sortExperience(data), [data]);

  const setActiveTab = useActiveSidebarTab()[1];

  const openForm = () => {
    setActiveTab({ id: null, tab: "experience" });
    if (!isDesktop) {
      setOpen(true);
    }
  };

  if (!isMine && data.length === 0) return null;

  return (
    <ProfileSection
      id="work-experience"
      title="Experience"
      actions={isMine ? <SectionNewButton onClick={openForm} what="experience" /> : undefined}
    >
      <WorkExperienceDrawer />
      {sorted.length === 0 ? (
        <EmptyLine text="No experience yet" actionLabel="Add a role" onAction={openForm} />
      ) : (
        <ol className="flex flex-col">
          {sorted.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} isMine={isMine} />
          ))}
        </ol>
      )}
    </ProfileSection>
  );
};

export default WorkExperience;
