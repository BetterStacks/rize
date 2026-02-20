"use client";
import { getAllProjects } from "@/actions/project-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { GetAllProjects } from "@/lib/types";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import ProjectCard from "./project-card";
import ProjectDetailsDialog from "./ProjectDetailsDialog";
import ProjectDrawer from "./ProjectDrawer";

type ProjectsProps = {
  isMine: boolean;
  projects: GetAllProjects[];
};

const Projects = ({ isMine, projects }: ProjectsProps) => {
  const { username } = useParams<{ username: string }>();
  const setActiveTab = useActiveSidebarTab()[1];
  const { data, isFetching } = useQuery({
    queryKey: ["get-projects", username],
    initialData: projects,
    queryFn: () => getAllProjects(username),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });
  const [selectedProject, setSelectedProject] = useState<GetAllProjects | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openProject = (project: GetAllProjects) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div
      id="projects"
      className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
    >
      <ProjectDetailsDialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(false)}
        project={selectedProject}
      />
      <ProjectDrawer />
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-medium">Projects</h2>
        {isMine && (
          <Button
            variant={"outline"}
            className="  rounded-lg scale-90 text-sm"
            size={"sm"}
            onClick={() => {
              setActiveTab({ id: null, tab: "projects" });
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
              className="w-full h-[80px] rounded-xl"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyWritingState
            onCreateNew={() => setActiveTab({ id: null, tab: "projects" })}
          />
        ) : (
          data?.map((project, i) => {
            return (
              <ProjectCard
                onOpenProject={openProject}
                onEditProject={(project) => {
                  setActiveTab({ id: project, tab: "projects" });
                }}
                key={i}
                project={project}
                isMine={isMine}
              />
            );
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
  onCreateNew = () => { },
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
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20">
          <motion.div
            animate={{ rotate: isHovering ? 15 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="relative">
              <Brain
                className="size-6 text-yellow-500 dark:text-yellow-400"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        </div>
        <h3 className="mb-2 md:text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 opacity-80 text-sm md:text-base leading-tight px-6">
          {description}
        </p>
        <Button
          size="sm"
          className="gap-2 !bg-main-yellow text-black rounded-lg scale-90"
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
