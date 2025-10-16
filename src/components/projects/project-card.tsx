import { deleteProject } from "@/actions/project-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { GetAllProjects } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Dot,
  Edit2,
  Globe,
  Loader,
  Minus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

type ProjectCardProps = {
  project: GetAllProjects;
  isMine: boolean;
  onOpenProject: (project: GetAllProjects) => void;
  onEditProject: (project: string) => void;
};

const ProjectCard: FC<ProjectCardProps> = ({
  project,
  isMine,
  onOpenProject,
  onEditProject,
}) => {
  const { username } = useParams<{ username: string }>();
  // const isDesktop = useMediaQuery("(min-width: 1024px)");
  // const setOpen = useRightSidebar()[1];
  const [seeMore, setSeeMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!descRef.current) return;
    const el = descRef.current;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "16");
    const maxLines = 2;
    const maxHeight = lineHeight * maxLines;
    // use scrollHeight to determine if content exceeds two lines
    setIsOverflowing(el.scrollHeight > maxHeight + 1);
  }, [project.description]);

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
      onClick={() => onOpenProject(project)}
      className={cn("flex w-full group relative transition-all py-4 ")}
    >
      <div className="w-full inline-flex">
        {project.logo ? (
          <Image
            width={50}
            height={50}
            className="aspect-square border border-neutral-300/60 dark:border-dark-border  rounded-full size-10 bg-white dark:bg-dark-border"
            src={project.logo!}
            alt={project.name}
          />
        ) : (
          <div className="flex items-center justify-center aspect-square size-10 bg-neutral-200 dark:bg-dark-border rounded-full">
            <Globe strokeWidth={1.5} className="size-4 opacity-80" />
          </div>
        )}
        <div className="flex w-full ml-4 flex-col">
          <div className="flex items-center w-full justify-start ">
            {project.url ? (
              <Link href={project.url} target="_blank" className="flex">
                <h2 className="font-medium text-lg text-nowrap tracking-tight leading-tight w-full">
                  {project.name}
                </h2>
              </Link>
            ) : (
              <h2 className="font-medium text-lg flex tracking-tight leading-tight">
                {project.name}
              </h2>
            )}
            <div className="w-full flex items-center justify-start text-xs">
              <Dot className="size-4 leading-none text-neutral-700 font-medium  dark:text-neutral-400" />

              <span className=" text-neutral-700 font-medium  dark:text-neutral-400">
                {project?.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <Minus className=" text-neutral-700 font-medium size-3 mx-0.5 leading-none dark:text-neutral-400" />
              <span className=" text-neutral-700 font-medium  dark:text-neutral-400">
                {project?.endDate
                  ? new Date(project.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
          {project.tagline && (
            <span className="dark:text-neutral-200 mb-2 line-clamp-2 text-sm leading-tight">
              {project.tagline}
            </span>
          )}
          <div>
            <p
              ref={descRef}
              className={cn(
                "dark:text-neutral-400 text-sm leading-tight",
                !seeMore && "line-clamp-2"
              )}
            >
              {project.description}
            </p>
            {project.description && isOverflowing && (
              <div className="mt-2">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSeeMore((s) => !s);
                  }}
                >
                  {seeMore ? "See less" : "See more"}
                  {/* {seeMore ? (
                    <ChevronUp className="size-4 opacity-80" />
                  ) : (
                    <ChevronDown className="size-4 opacity-80" />
                  )} */}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMine && (
        <div className="space-x-2 absolute right-4 opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <Button
            variant={"outline"}
            className="rounded-full  text-sm"
            size={"smallIcon"}
            onClick={(e) => {
              e.stopPropagation();
              onEditProject(project.id);
              // setTab((prev) => ({
              //   id: prev?.id === project?.id ? null : project?.id,
              //   tab: "projects",
              // }));
              // if (!isDesktop) {
              //   setOpen(true);
              // }
            }}
          >
            <Edit2 className="size-4 opacity-80" />
          </Button>
          <Button
            variant={"outline"}
            className="rounded-full  text-sm"
            size={"smallIcon"}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(project.id);
            }}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 opacity-80 animate-spin" />
            ) : (
              <Trash2 className="size-4 opacity-80" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectCard;
