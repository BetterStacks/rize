"use client";
import { getAllEducation } from "@/actions/education-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { TEducation } from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpenText, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import EducationCard from "./education-card";

type EducationProps = {
  isMine: boolean;
  education: TEducation[];
};

const Education = ({ isMine, education }: EducationProps) => {
  const { username } = useParams<{ username: string }>();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];
  const { data, isFetching } = useQuery({
    queryKey: ["get-education", username],
    initialData: education,
    queryFn: () => getAllEducation(username),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const setActiveTab = useActiveSidebarTab()[1];

  return (
    <div
      id="projects"
      className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
    >
      <div className="w-full max-w-2xl mb-2 flex items-center justify-between">
        <h2 className="text-xl font-medium mb-2 md:mb-4">Education</h2>
        {isMine && (
          <Button
            variant={"outline"}
            className="  rounded-lg scale-90 text-sm"
            size={"sm"}
            onClick={() => {
              setActiveTab({ id: null, tab: "education" });

              if (!isDesktop) {
                setOpen(true);
              }
            }}
          >
            <Plus className="opacity-80 mr-2 size-4" />
            New Education
          </Button>
        )}
      </div>
      <div className="w-full flex flex-col max-w-2xl gap-y-5 ">
        {isFetching ? (
          [...Array.from({ length: 4 })].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[140px] mt-3 rounded-xl animate-pulse bg-neutral-200 dark:bg-dark-border"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyWritingState
            onCreateNew={() => {
              setActiveTab({ id: null, tab: "education" });
              if (!isDesktop) {
                setOpen(true);
              }
            }}
          />
        ) : (
          data?.map((education, i) => {
            return (
              <EducationCard key={i} education={education} isMine={isMine} />
            );
          })
        )}
      </div>
    </div>
  );
};

interface EmptyEducationStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCreateNew?: () => void;
}

export function EmptyWritingState({
  title = "Share about your Education ",
  description = "Your ideas deserve to be shared. Create your first piece and let your words flow.",
  ctaText = "Add Education",
  onCreateNew = () => {},
}: EmptyEducationStateProps) {
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
              <BookOpenText
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

export default Education;
