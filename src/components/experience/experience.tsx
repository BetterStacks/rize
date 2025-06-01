"use client";
import {
  deleteExperience,
  getAllExperience,
} from "@/actions/experience-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { TExperience } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CalendarIcon,
  Edit2,
  Loader,
  Plus,
  Trash,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import ExperienceCard from "./experience-card";
import { useMediaQuery } from "@mantine/hooks";

type WorkExperienceProps = {
  isMine: boolean;
  workExperience: TExperience[];
};

const WorkExperience = ({ isMine, workExperience }: WorkExperienceProps) => {
  const { username } = useParams<{ username: string }>();
  const setOpen = useRightSidebar()[1];
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { data, isFetching } = useQuery({
    queryKey: ["get-all-experience", username],
    initialData: workExperience,
    queryFn: () => getAllExperience(username),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const setActiveTab = useActiveSidebarTab()[1];

  return (
    <div
      id="projects"
      className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
    >
      <div className="max-w-2xl mb-4 w-full flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-medium">Work Experience</h2>
        {isMine && (
          <Button
            variant={"outline"}
            className="  rounded-lg scale-90 text-sm"
            size={"sm"}
            onClick={() => {
              setActiveTab({ id: null, tab: "experience" });
              if (!isDesktop) {
                setOpen(true);
              }
            }}
          >
            <Plus className="opacity-80 mr-2 size-4" />
            Add Experience
          </Button>
        )}
      </div>
      <div className="w-full flex flex-col max-w-2xl gap-y-5 relative">
        {isFetching ? (
          [...Array.from({ length: 4 })].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[100px] mt-3 rounded-xl animate-pulse bg-neutral-200 dark:bg-dark-border"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyWritingState
            onCreateNew={() => {
              setActiveTab({ id: null, tab: "experience" });
              if (!isDesktop) {
                setOpen(true);
              }
            }}
          />
        ) : (
          data?.map((experience, i) => {
            return (
              <ExperienceCard key={i} experience={experience} isMine={isMine} />
            );
          })
        )}
      </div>
    </div>
  );
};

interface EmptyWorkExperienceStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCreateNew?: () => void;
}

export function EmptyWritingState({
  title = "Share your Work Experience ",
  description = "Your ideas deserve to be shared. Create your first piece and let your words flow.",
  ctaText = "Add Experience",
  onCreateNew = () => {},
}: EmptyWorkExperienceStateProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="flex h-full min-h-[400px] border-2 border-neutral-300/60 dark:border-dark-border/80 rounded-3xl border-dashed w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20">
          <motion.div
            animate={{ rotate: isHovering ? 15 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="relative">
              <BriefcaseBusiness
                className="size-6 text-violet-500 dark:text-violet-400"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        </div>
        <h3 className="mb-2 md:text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 text-sm md:text-base opacity-80 leading-tight px-6">
          {description}
        </p>
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-700 dark:hover:to-indigo-700 rounded-lg scale-90"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          {ctaText}
        </Button>
      </motion.div>
    </div>
  );
}

export default WorkExperience;
