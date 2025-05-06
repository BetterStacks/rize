import { deleteProject } from "@/actions/project-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { GetAllProjects } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Edit2, Loader, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FC } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { useMediaQuery } from "@mantine/hooks";

type ProjectCardProps = {
  project: GetAllProjects;
  isMine: boolean;
};

const ProjectCard: FC<ProjectCardProps> = ({ project, isMine }) => {
  const [tab, setTab] = useActiveSidebarTab();
  const { username } = useParams<{ username: string }>();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];

  const { mutate: handleDeleteProject, isPending } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-projects", username] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });
  return (
    <motion.div
      onClick={() => {
        setTab((prev) => ({
          id: prev?.id === project?.id ? null : project?.id,
          tab: "projects",
        }));
        if (!isDesktop) {
          setOpen(true);
        }
      }}
      className={cn(
        "flex w-full bg-neutral-100 group relative dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border px-4 py-4 ",
        tab?.id === project?.id &&
          "dark:bg-indigo-400/10 border-2 border-dashed bg-indigo-400/15 border-indigo-400/30 dark:border-indigo-400/20"
      )}
    >
      <div className="w-full inline-flex">
        <Image
          width={50}
          height={50}
          className="aspect-square border border-neutral-300/60 dark:border-dark-border  rounded-full size-10 bg-white dark:bg-dark-border"
          src={project.logo!}
          alt={project.name}
        />
        <div className="flex ml-4 flex-col">
          <div className="flex items-center justify-start ">
            <Link href={project.url!} target="_blank">
              <h2 className="font-medium tracking-tight leading-tight">
                {project.name}
              </h2>
            </Link>
          </div>
          <p className="opacity-80 text-sm leading-tight">
            {project.description}
          </p>
        </div>
      </div>
      {isMine && (
        <div className="space-x-2 absolute right-4 opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <Button
            variant={"outline"}
            className="rounded-lg  text-sm"
            size={"smallIcon"}
            onClick={() => {
              setTab((prev) => ({
                id: prev?.id === project?.id ? null : project?.id,
                tab: "projects",
              }));
            }}
          >
            <Edit2 className="size-4 opacity-80" />
          </Button>
          <Button
            variant={"outline"}
            className="rounded-lg  text-sm"
            size={"smallIcon"}
            onClick={() => handleDeleteProject(project.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 opacity-80 animate-spin" />
            ) : (
              <Trash className="size-4 opacity-80" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectCard;
