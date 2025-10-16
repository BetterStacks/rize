"use client";

import Image from "next/image";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Link2,
  Dot,
  MoreHorizontalIcon,
  Bookmark,
  Loader,
  Trash2,
} from "lucide-react";
import { GetAllProjects } from "@/lib/types";
import { cleanUrl, cn } from "@/lib/utils";
import { EmptyGalleryState } from "../gallery/gallery-empty-state";
import { Separator } from "../ui/separator";
import { deleteProject } from "@/actions/project-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: GetAllProjects | null;
};

const ProjectDetailsDialog: FC<Props> = ({ open, onOpenChange, project }) => {
  const [index, setIndex] = useState(0);

  const formatDate = (d?: string | Date | null) => {
    if (!d) return null;
    try {
      const date = typeof d === "string" ? new Date(d) : d;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return null;
    }
  };

  if (!project) return null;

  const medias = project.attachments || [];

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(medias.length - 1, i + 1));
  // console.log(medias);

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
                  <Dot className="size-4 opacity-70 leading-none" />
                  <div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-500">
                      {formatDate(project.startDate) || "—"}
                      {project.endDate ? (
                        <> — {formatDate(project.endDate)}</>
                      ) : project.startDate ? (
                        <> — Present</>
                      ) : null}
                    </div>
                  </div>
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

        <DialogFooter className="mt-4">
          <div className="w-full flex justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
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
  const queryClient = useQueryClient();
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="z-[6]  transition-all duration-200 ease-in"
        >
          <Button
            size={"smallIcon"}
            className="rounded-full aspect-square "
            variant={"outline"}
          >
            <MoreHorizontalIcon
              className={cn(
                "text-neutral-500 size-4 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="shadow-md shadow-black/20 dark:shadow-black/20 rounded-xl dark:bg-dark-bg border dark:border-dark-border border-neutral-300/60 bg-white p-0">
          <DropdownMenuItem className="px-4 py-1.5 ">
            <Link2 className="opacity-80 -rotate-45 size-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border">
            <Bookmark className="opacity-80  size-4" />
            <span>Save</span>
          </DropdownMenuItem>
          {isMyProject && (
            <DropdownMenuItem
              onClick={() => handleDeleteProject(projectId)}
              className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border"
            >
              {isPending ? (
                <Loader className="opacity-80 size-4 animate-spin" />
              ) : (
                <Trash2 className="opacity-80 size-4" />
              )}
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProjectDetailsDialog;
