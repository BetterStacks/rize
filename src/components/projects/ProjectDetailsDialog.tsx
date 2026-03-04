"use client";

import { deleteProject } from "@/actions/project-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { GetAllProjects } from "@/lib/types";
import { cleanUrl, cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader,
  MoreHorizontalIcon,
  Trash2,
  ArrowBigUp,
  ArrowBigDown,
} from "lucide-react";
import { useVoteProject } from "@/hooks/useVoteProject";
import { useAuthDialog } from "../dialog-provider";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { useActiveSidebarTab } from "@/lib/context";
import { toggleProjectBookmark } from "@/actions/project-actions";
import { Share2, Edit2 } from "lucide-react";
import { EmptyGalleryState } from "../gallery/gallery-empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { queryClient } from "@/lib/providers";
import ProjectInteractions from "./ProjectInteractions";
import { useToggleProjectBookmark } from "@/hooks/useToggleProjectBookmark";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: GetAllProjects | null;
};

const ProjectDetailsDialog: FC<Props> = ({ open, onOpenChange, project }) => {
  const [index, setIndex] = useState(0);
  const [authOpen, setAuthOpen] = useAuthDialog();
  const session = useSession();

  const mutation = useVoteProject({
    projectId: project?.id ?? "",
    userVote: project?.userVote ?? null,
  });

  const bookmarkMutation = useToggleProjectBookmark({
    projectId: project?.id ?? "",
    isBookmarked: !!project?.bookmarked,
  });

  const handleVoteClick = (value: number) => {
    mutation.mutate(value);
  };

  const handleBookmarkClick = () => {
    bookmarkMutation.mutate();
  };

  const handleShareClick = async () => {
    if (!project) return;
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

  const score = project ? (project.upvoteCount || 0) - (project.downvoteCount || 0) : 0;

  if (!project) return null;

  const medias = project.attachments || [];
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(medias.length - 1, i + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl sm:rounded-2xl py-8 dark:bg-dark-bg w-full">
        <div className="flex items-start justify-between gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-start">
              {project.logo ? (
                <div className="relative size-16 aspect-square rounded-full overflow-hidden">
                  <Image src={project.logo} alt={project.name} fill />
                </div>
              ) : null}
              <div
                className={cn(
                  " flex flex-col items-start justify-start",
                  project?.logo && "ml-4"
                )}
              >
                <div className="flex items-center justify-start">
                  <span className="text-lg">{project.name}</span>
                </div>
                {project.url && (
                  <span className="mt-2 px-2 py-1 rounded-full bg-neutral-200 dark:bg-dark-border w-fit flex items-center justify-start">
                    {" "}
                    <Link2 className="size-3 opacity-80 -rotate-45 mr-1" />
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs opacity-60 dark:opacity-80 "
                    >
                      {cleanUrl(project.url)}
                    </a>
                  </span>
                )}
              </div>
            </DialogTitle>

            {/* </div>
            )} */}
            <DialogDescription>
              <p className="mt-6">{project.description}</p>
            </DialogDescription>
          </DialogHeader>

          {/* <DialogClose asChild>
            <Button size="icon" variant="ghost">
              <X />
            </Button>
          </DialogClose> */}
          <ProjectDialogOptions
            projectId={project.id}
            profileId={project.profileId as string}
          />
        </div>

        {medias.length > 0 ? (
          <div className="mt-4 relative">
            <div className="aspect-video relative border border-neutral-200 dark:border-dark-border w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
              {medias[index].type === "video" ? (
                <video
                  src={medias[index].url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <Image
                  src={medias[index].url}
                  alt={`media-${index}`}
                  fill
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            {medias.length > 1 && (
              <>
                {" "}
                <div className="absolute  inset-y-0 left-0 flex items-center">
                  <button
                    onClick={prev}
                    disabled={index === 0}
                    className="p-2 bg-neutral-50 border  transition-all border-neutral-200 dark:bg-neutral-800 dark:border-dark-border rounded-full flex items-center justify-center ml-2"
                  >
                    <ChevronLeft className="size-4 opacity-90" />
                  </button>
                </div>
                <div className="absolute inset-y-0  right-0 flex items-center">
                  <button
                    onClick={next}
                    disabled={index === medias.length - 1}
                    className="p-2 bg-neutral-50 border transition-all border-neutral-200 dark:bg-neutral-800 dark:border-dark-border rounded-full flex items-center justify-center mr-2"
                  >
                    <ChevronRight className="size-4 opacity-90" />
                  </button>
                </div>
              </>
            )}
            {medias.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-2">
                {medias.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setIndex(i)}
                    className={`h-2 w-8 rounded-full ${i === index ? "bg-neutral-800" : "bg-neutral-300"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyGalleryState
            ctaText="Upload Media"
            title="Add Images & Videos"
            description="Add images & videos of your projects"
            className="h-[180px] rounded-md"
          />
        )}

        <DialogFooter className="mt-8 flex items-center justify-between sm:justify-between w-full">
          <ProjectInteractions
            upvoteCount={project.upvoteCount}
            downvoteCount={project.downvoteCount}
            userVote={project.userVote ?? null}
            handleVoteClick={handleVoteClick}
            isBookmarked={!!project.bookmarked}
            handleBookmarkClick={handleBookmarkClick}
            handleShareClick={handleShareClick}
          />
          <Button variant="secondary" className="rounded-xl px-6" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type ProjectCardOptionsProps = {
  projectId: string;
  profileId: string;
};

export const ProjectDialogOptions: FC<ProjectCardOptionsProps> = ({
  projectId,
  profileId,
}) => {
  const { username } = useParams<{ username: string }>();
  const session = useSession();
  const isMyProject = profileId === session?.data?.user?.profileId;
  const setActiveTab = useActiveSidebarTab()[1];
  const { mutate: handleDeleteProject, isPending: isDeleting } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-projects", username] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const { mutate: handleToggleBookmark } = useMutation({
    mutationFn: (bookmark: boolean) => toggleProjectBookmark(projectId, bookmark),
    onSuccess: () => {
      toast.success("Project saved to collection");
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/project/${projectId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this project",
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="z-[6] transition-all duration-200 ease-in"
        >
          <Button
            size={"smallIcon"}
            className="rounded-full aspect-square "
            variant={"ghost"}
          >
            <MoreHorizontalIcon
              className={cn(
                "text-neutral-500 size-4 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mt-2 w-44 dark:bg-dark-bg dark:border-dark-border border-neutral-200/80 rounded-xl">
          <DropdownMenuItem
            onClick={() => {
              const url = `${window.location.origin}/project/${projectId}`;
              navigator.clipboard.writeText(url);
              toast.success("Link copied to clipboard");
            }}
          >
            <Link2 className=" -rotate-45 size-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>

          <DropdownMenuItem

            onClick={handleShare}
          >
            <Share2 className=" size-4" />
            <span>Share</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem
            onClick={() => handleToggleBookmark(true)}
          >
            <Bookmark className="  size-4" />
            <span>Save to Collection</span>
          </DropdownMenuItem> */}

          {isMyProject && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setActiveTab({ id: projectId, tab: "projects" });
                }}
              >
                <Edit2 className=" size-4" />
                <span>Edit Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProject(projectId)}
                className=" text-red-500 hover:text-red-500"
              >
                {isDeleting ? (
                  <Loader className=" size-4 animate-spin" />
                ) : (
                  <Trash2 className=" size-4" />
                )}
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProjectDetailsDialog;
