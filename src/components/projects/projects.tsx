"use client";
import { getAllProjects } from "@/actions/project-actions";
import { useActiveSidebarTab } from "@/lib/context";
import { PROFILE_STALE_TIME } from "@/lib/profile-query";
import { GetAllProjects } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EmptyLine, ProfileSection, SectionNewButton } from "../profile/profile-section";
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
  const { data = [] } = useQuery({
    queryKey: ["get-projects", username],
    initialData: projects,
    queryFn: () => getAllProjects(username),
    staleTime: PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const [selectedProject, setSelectedProject] = useState<GetAllProjects | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openProject = (project: GetAllProjects) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const openForm = () => setActiveTab({ id: null, tab: "projects" });

  if (!isMine && data.length === 0) return null;

  return (
    <ProfileSection
      id="projects"
      title="Projects"
      actions={isMine ? <SectionNewButton onClick={openForm} what="project" /> : undefined}
    >
      <ProjectDetailsDialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(false)}
        project={selectedProject}
      />
      <ProjectDrawer />
      {data.length === 0 ? (
        <EmptyLine text="No projects yet" actionLabel="Add a project" onAction={openForm} />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((project) => (
            <ProjectCard
              onOpenProject={openProject}
              onEditProject={(project) => {
                setActiveTab({ id: project, tab: "projects" });
              }}
              key={project.id}
              project={project}
              isMine={isMine}
            />
          ))}
        </div>
      )}
    </ProfileSection>
  );
};

export default Projects;
