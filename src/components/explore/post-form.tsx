"use client";
import { createPost } from "@/actions/post-actions";
import { TUploadFilesResponse } from "@/lib/types";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import TextArea from "react-textarea-autosize";
import { v4 } from "uuid";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { usePostsDialog } from "../dialog-provider";
import { Loader, Paperclip, Trash2 } from "lucide-react";
import { set } from "date-fns";
import { queryClient } from "@/lib/providers";

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    // disabled: isDisabled,
    // noClick: true,

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

      console.log({ resp });

      media = resp.map((file) => ({
        url: file?.url,
        height: file?.height,
        width: file?.width,
      }));
    }
    await createPost({ content, files: media || [] });

    // setContent("");
    // setFiles([]);
  };
  const { isPending, mutate } = useMutation({
    mutationFn: handlePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
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

  const percentage = useMemo(() => {
    return Math.round((content?.length / MAX_WORD_COUNT) * 100);
  }, [content?.length]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        // {...getRootProps()}
        onMouseEnter={() => setFocus(true)}
        onMouseLeave={() => setFocus(false)}
        className={cn(
          "flex flex-col dark:bg-dark-bg max-w-xs rounded-2xl sm:max-w-lg bg-white drop-shadow-2xl sm:rounded-2xl  w-full border border-neutral-300/60 dark:border-dark-border px-4 py-4 "
          //   focus && "h-fit"
        )}
      >
        <div
          className={cn(
            "size-10 bg-neutral-200 dark:bg-dark-border rounded-full mx-3 mt-4 aspect-square flex relative overflow-hidden",
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
        <div className="w-full px-4 mt-2 flex flex-1 flex-col">
          <TextArea
            disabled={isPending}
            className="appearance-none  bg-transparent text-neutral-600 dark:text-neutral-400 tracking-tight font-medium w-full  focus-visible:outline-none resize-none"
            value={content.substring(0, MAX_WORD_COUNT)}
            minRows={1}
            // onPaste={(e) => {
            //   const copiedText = e?.clipboardData?.getData("text");
            //   if (content?.length + copiedText?.length > MAX_WORD_COUNT) {
            //     toast.error("Max word count reached");
            //     const offset =
            //       content?.length + copiedText?.length - MAX_WORD_COUNT;
            //     console.log({ offset });
            //     setContent((prev) => prev?.slice(0, prev?.length - offset));
            //     return;
            //   }
            // }}
            onChange={(e) => {
              if (e?.target?.value?.length > MAX_WORD_COUNT) {
                toast.error("Max word count reached");
                // console.log(e?.target?.value);
                return;
              }
              setContent(e.target.value);
            }}
            placeholder={`What's on your mind, ${capitalizeFirstLetter(
              data?.name?.split(" ")[0] as string
            )}?`}
          />
          {/* <input {...getInputProps()} /> */}

          <div className="w-full flex flex-wrap gap-2 mt-4">
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
                <div className="size-24 relative rounded-lg overflow-hidden">
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

                {/* <div className="max-w-[80px] line-clamp-1">
                <span className="opacity-80 text-sm">{file?.file?.name}</span>
                </div>
                <Button
                // onClick={() => removeFile(file?.id)}
                variant={"outline"}
                size={"smallIcon"}
                className="size-6"
                // className="absolute top-2 z-10 right-2"
                >
                <X className="size-3" />
                </Button> */}
              </div>
            ))}
          </div>
          <div className="w-full mt-4 gap-x-2 flex items-center justify-between">
            {/* <div className="flex items-center justify-center gap-x-2">
              <div className="flex items-center justify-center gap-x-1">
                <ProgressCircle percentage={percentage} />
                <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
                  {content?.length} / {MAX_WORD_COUNT}
                </span>
              </div> */}
            <Button
              variant={"outline"}
              size={"sm"}
              {...getRootProps()}
              className=" rounded-lg"
            >
              <Paperclip strokeWidth={1.6} className="size-4  opacity-80" />
              <span className="text-sm">Add Media</span>
            </Button>
            {/* </div> */}
            <input {...getInputProps()} />
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
        </div>
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

export default PostForm;
