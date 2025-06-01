"use client";
import { createPost } from "@/actions/post-actions";
import { queryClient } from "@/lib/providers";
import { TUploadFilesResponse } from "@/lib/types";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link2, Loader, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import TextArea from "react-textarea-autosize";
import { v4 } from "uuid";
import { usePostsDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { motion } from "framer-motion";

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};
const MAX_WORD_COUNT = 500;

const PostForm = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [content, setContent] = React.useState<string>("");
  const session = useSession();
  const [focus, setFocus] = useState(false);
  const [open, setOpen] = usePostsDialog();
  const [links, setLinks] = useState<string[]>([]);
  const data = session?.data?.user;
  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: v4(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
      file: file,
    }));
    setFiles((prev) => [...prev, ...(newFiles as MediaFile[])]);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openDropZone,
  } = useDropzone({
    onDrop,
    multiple: true,
    // disabled: isDisabled,
    noClick: true,
    noKeyboard: true,

    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
  });

  const handlePost = async () => {
    let media = [] as TUploadFilesResponse[];
    if (files?.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file?.file as File));
      formData.append("folder", "fyp-stacks/posts");

      const res = await axios.post("/api/upload/files", formData);
      if (res.status !== 200) throw new Error("Upload failed");
      const resp = res.data?.data as TUploadFilesResponse[];

      media = resp.map((file) => ({
        url: file?.url,
        height: file?.height,
        width: file?.width,
      }));
    }
    await createPost({
      content: content || undefined,
      files: media || [],
      links: links || [],
    });
  };
  const { isPending, mutate } = useMutation({
    mutationFn: handlePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      toast.success("Post created successfully");
      setContent("");
      setFiles([]);
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Error creating post");
      console.log(error);
    },
    mutationKey: ["create-post"],
  });

  useEffect(() => {
    if (open) {
      setContent("");
      setFiles([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        {...getRootProps()}
        onMouseEnter={() => setFocus(true)}
        onMouseLeave={() => setFocus(false)}
        className={cn(
          "flex flex-col dark:bg-dark-bg max-w-xs rounded-3xl sm:max-w-lg bg-white drop-shadow-2xl sm:rounded-3xl  w-full border border-neutral-300/60 dark:border-dark-border px-2 py-3  "
          //   focus && "h-fit"
        )}
      >
        <input {...getInputProps()} />
        <DialogHeader className="px-2">
          <DialogTitle className="hidden" aria-hidden="true">
            Create Post
          </DialogTitle>
          <div
            className={cn(
              "size-10 bg-neutral-200 dark:bg-dark-border rounded-full aspect-square flex relative overflow-hidden",
              session?.status === "loading" && "animate-pulse"
            )}
          >
            {data?.profileImage && (
              <Image
                src={data?.profileImage as string}
                fill
                style={{
                  objectFit: "cover",
                }}
                quality={100}
                priority
                alt={`${data?.name}`}
              />
            )}
          </div>
        </DialogHeader>
        <div className="w-full h-full px-4 mt-2 flex flex-1 flex-col">
          <TextArea
            disabled={isPending}
            className="appearance-none  bg-transparent text-neutral-600 dark:text-neutral-400 tracking-tight font-medium w-full  focus-visible:outline-none resize-none"
            value={content.substring(0, MAX_WORD_COUNT)}
            minRows={1}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            placeholder={`What's on your mind, ${capitalizeFirstLetter(
              data?.name?.split(" ")[0] as string
            )}?`}
          />

          <div className="w-full flex overflow-x-auto gap-2 mt-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border rounded-xl relative group p-1 "
              >
                <div
                  className="absolute -top-2 -right-2 opacity-0 z-30 group-hover:opacity-100 transition-all duration-200"
                  onClick={() => {
                    setFiles((prev) => prev.filter((f) => f.id !== file.id));
                  }}
                >
                  <Button
                    variant={"outline"}
                    size={"smallIcon"}
                    className="size-6"
                    // className="absolute top-2 z-10 right-2"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="size-40 relative rounded-lg overflow-hidden">
                  {file.type === "image" ? (
                    <Image
                      fill
                      src={file.url}
                      alt="Preview"
                      className="w-full aspect-square object-cover "
                    />
                  ) : (
                    <video
                      src={file.url}
                      className="w-full aspect-square object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="px-4 pb-2">
          <div className="w-full mt-4 gap-x-2 flex items-center justify-between">
            <div className="space-x-4">
              <button disabled={isPending} onClick={openDropZone}>
                <GalleryIcon
                  strokeWidth={1.2}
                  className="opacity-80 size-6 stroke-black dark:stroke-neutral-100"
                />
              </button>
              <button
                disabled={isPending}
                onClick={() => {
                  // const url = prompt("Enter a link:");
                  // if (url) {
                  //   setLinks((prev) => [...prev, url]);
                  // }
                }}
              >
                <Link2 strokeWidth={1.4} className="-rotate-45 opacity-80" />
              </button>
            </div>
            <div>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size={"sm"}
                className="ml-2"
                disabled={isPending}
                onClick={() => mutate()}
              >
                {isPending && (
                  <Loader
                    strokeWidth={1.6}
                    className="mr-2 animate-spin size-4 opacity-80"
                  />
                )}{" "}
                Publish
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  bgColor?: string;
  progressColor?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 25,
  strokeWidth = 4,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg
      width={size}
      className="relative"
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth - 1}
        fill="none"
        className="absolute -z-10 stroke-neutral-300 dark:stroke-neutral-600"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        // pathLength={offset}
        strokeDashoffset={offset}
        strokeDasharray={circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="absolute z-10 stroke-indigo-600"
      />
      {/* <circle
        className="absolute  "
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={"gray"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
      /> */}
    </svg>
  );
};

export const GalleryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={32}
    height={32}
    fill={"none"}
    {...props}
  >
    <path
      d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle
      cx="16.5"
      cy="7.5"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16 22C15.3805 19.7749 13.9345 17.7821 11.8765 16.3342C9.65761 14.7729 6.87163 13.9466 4.01569 14.0027C3.67658 14.0019 3.33776 14.0127 3 14.0351"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 18C14.7015 16.6733 16.5345 15.9928 18.3862 16.0001C19.4362 15.999 20.4812 16.2216 21.5 16.6617"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default PostForm;
