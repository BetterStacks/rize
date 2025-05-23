"use client";
import { getAllProjects } from "@/actions/project-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { GetAllProjects } from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import ProjectCard from "./project-card";

type ProjectsProps = {
  isMine: boolean;
  projects: GetAllProjects[];
};

const Projects = ({ isMine, projects }: ProjectsProps) => {
  const { username } = useParams<{ username: string }>();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];
  const { data, isFetching } = useQuery({
    queryKey: ["get-projects", username],
    initialData: projects,
    queryFn: () => getAllProjects(username),
    // refetchOnWindowFocus: false,
    refetchOnMount: false,
    // staleTime: Infinity,
  });

  const setActiveTab = useActiveSidebarTab()[1];

  return (
    <div
      id="projects"
      className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
    >
      <div className="w-full max-w-2xl mb-2 flex items-center justify-between">
        <h2 className="text-xl font-medium mb-2 md:mb-4">Projects</h2>
        {isMine && (
          <Button
            variant={"outline"}
            className="  rounded-lg scale-90 text-sm"
            size={"sm"}
            onClick={() => {
              setActiveTab({ id: null, tab: "projects" });
              if (!isDesktop) {
                setOpen(true);
              }
            }}
          >
            <Plus className="opacity-80 mr-2 size-4" />
            New Project
          </Button>
        )}
      </div>
      <div className="w-full grid grid-cols-1  max-w-2xl gap-4 ">
        {isFetching ? (
          [...Array.from({ length: 4 })].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[80px]  rounded-xl animate-pulse bg-neutral-200 dark:bg-dark-border"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyWritingState
            onCreateNew={() => setActiveTab({ id: null, tab: "projects" })}
          />
        ) : (
          data?.map((project, i) => {
            return <ProjectCard key={i} project={project} isMine={isMine} />;
          })
        )}
      </div>
    </div>
  );
};

interface EmptyProjectStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCreateNew?: () => void;
}

export function EmptyWritingState({
  title = "Start Sharing your Projects Journey",
  description = "Your ideas deserve to be shared. Create your first piece and let your words flow.",
  ctaText = "Add New Project",
  onCreateNew = () => {},
}: EmptyProjectStateProps) {
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
              <Brain
                className="size-6 text-violet-500 dark:text-violet-400"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        </div>
        <h3 className="mb-2 text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 opacity-80 leading-tight px-6">{description}</p>
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

export default Projects;
