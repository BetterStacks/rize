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
import SafeImage from "../profile/safe-image";
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
      className={cn("flex w-full group relative items-center gap-2")}
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

      <Link
        href={`/project/${project.id}`}
        target="_blank"
        className="flex min-w-0 flex-1 items-center gap-4 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-yellow"
      >
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E2D8] bg-[#FCFBF8] dark:border-[#2E2923] dark:bg-[#1C1916]">
          <SafeImage
            src={project.logo}
            sizes="56px"
            fallback={<Globe strokeWidth={1.5} className="size-4 text-[#5A5248] dark:text-[#B3A999]" aria-hidden />}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <h3 className="w-full truncate text-[15px] font-medium leading-snug text-[#1F1B16] dark:text-[#F3EEE6]">
            {project.name}
          </h3>
          {project.tagline && (
            <p className="w-full truncate text-[15px] leading-snug text-[#5A5248] dark:text-[#B3A999]">
              {project.tagline}
            </p>
          )}
          {(project?.topics?.length ?? 0) > 0 && (
            <p className="mt-1 w-full truncate text-sm text-[#5A5248] dark:text-[#B3A999]">
              {project?.topics?.map((topic) => topic.name).join(" · ")}
            </p>
          )}
        </div>
      </Link>
      {
        isMine && (

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Options for ${project.name}`}
                className="size-11 shrink-0 rounded-lg text-[#5A5248] dark:text-[#B3A999] sm:size-9"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEditProject(project.id);
              }}>
                <Edit2 className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={(e) => {
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
