import { deleteProject } from "@/actions/project-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { GetAllProjects } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Dot,
  Edit2,
  Globe,
  Loader,
  Minus,
  MoreHorizontal,
  Tag,
  Tags,
  Trash2,
  ArrowBigUp,
  ArrowBigDown,
} from "lucide-react";
import { useVoteProject } from "@/hooks/useVoteProject";
import { useSession } from "@/lib/auth-client";
import { useAuthDialog } from "../dialog-provider";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import ProjectInteractions from "./ProjectInteractions";
import { useToggleProjectBookmark } from "@/hooks/useToggleProjectBookmark";
import { Share2 } from "lucide-react";

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

  const session = useSession();
  const [authOpen, setAuthOpen] = useAuthDialog();

  const mutation = useVoteProject({
    projectId: project.id,
    userVote: project.userVote ?? null,
  });

  const bookmarkMutation = useToggleProjectBookmark({
    projectId: project.id,
    isBookmarked: !!project.bookmarked,
  });

  const handleBookmarkClick = () => {
    bookmarkMutation.mutate();
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/project/${project.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const score = (project.upvoteCount || 0) - (project.downvoteCount || 0);

  return (
    <motion.div
      className={cn("flex w-full group relative transition-all items-center")}
    >
      {/* <ProjectInteractions
        upvoteCount={project.upvoteCount}
        downvoteCount={project.downvoteCount}
        userVote={project.userVote ?? null}
        handleVoteClick={(value) => mutation.mutate(value)}
        isBookmarked={!!project.bookmarked}
        handleBookmarkClick={handleBookmarkClick}
        handleShareClick={handleShareClick}
        compact
        className="flex-col mr-3"
      /> */}

      <Link href={`/project/${project.id}`} target="_blank" className="flex flex-1 items-center">
        <div className=" flex border-2 border-neutral-200 mr-4 dark:border-dark-border items-center justify-center relative overflow-hidden h-16  w-20 rounded-lg aspect-square">
          {project.logo ? (
            <Image
              fill
              style={{ objectFit: "cover" }}
              src={project.logo!}
              alt={project.name}
            />
          ) : (
            <Globe strokeWidth={1.5} className="size-4 opacity-80" />
          )}
        </div>
        <div className="flex w-full py-2 items-start justify-center flex-col">
          <h2 className="font-medium text-nowrap tracking-tight leading-tight flex items-center gap-1 group/link">
            {project.name}
          </h2>
          {project.tagline && (
            <p className="dark:text-gray-300 text-sm text-gray-700 line-clamp-1 mt-1 leading-tight">
              {project.tagline}
            </p>
          )}
          {project?.topics!?.length > 0 && <div className="flex items-center justify-start dark:text-gray-400 text-gray-700 gap-1 mt-1">
            <Tags className="mr-1 size-4" />
            {project?.topics!?.map((topic, index) => (
              <React.Fragment key={topic.id} >
                <span className="cursor-pointer hover:dark:text-main-yellow hover:text-yellow-500 hover:underline transition-all ease-in duration-75 underline-offset-2 text-sm">
                  {topic.name}
                </span>
                {project.topics!.length - 1 !== index && <span className="">•</span>}
              </React.Fragment>
            ))}
          </div>}

        </div>
      </Link>
      {
        isMine && (

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="absolute right-2 ">
              <Button variant={"outline"} size={"smallIcon"}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 dark:bg-dark-bg dark:border-dark-border border-neutral-200/80 rounded-xl">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEditProject(project.id);
              }}>
                <Edit2 className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="stroke-red-500 text-red-500" onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id);
              }}>
                <Trash2 className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    </motion.div >
  );
};

export default ProjectCard;
