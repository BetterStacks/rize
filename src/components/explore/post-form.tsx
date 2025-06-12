"use client";
import { createPost } from "@/actions/post-actions";
import { queryClient } from "@/lib/providers";
import { TUploadFilesResponse } from "@/lib/types";
import { capitalizeFirstLetter, cn, isValidUrl } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link2, Loader, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import TextArea from "react-textarea-autosize";
import { Result } from "url-metadata";
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
import { PostLinkCard } from "./post-interactions";
import { Skeleton } from "../ui/skeleton";

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};
const MAX_WORD_COUNT = 500;

const PostForm = () => {
  const [file, setFile] = useState<MediaFile | undefined>();
  const [content, setContent] = React.useState<string>("");
  const session = useSession();
  const [open, setOpen] = usePostsDialog();
  const [link, setLink] = useState<string | null>();
  const data = session?.data?.user;

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: v4(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
      file: file,
    }));
    setFile(newFiles[0] as MediaFile);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openDropZone,
  } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
  });

  const handlePost = async () => {
    let media: TUploadFilesResponse | undefined = undefined;

    if (file) {
      const formData = new FormData();
      formData.append("files", file?.file as File);
      formData.append("folder", "fyp-stacks/posts");

      const res = await axios.post("/api/upload/files", formData);
      if (res.status !== 200) throw new Error("Upload failed");
      const [resp] = res.data?.data as TUploadFilesResponse[];
      media = {
        url: resp?.url,
        height: resp?.height,
        width: resp?.width,
      };
    }
    await createPost({
      content: content || undefined,
      file: media || undefined,
      link: link || undefined,
    });
  };
  const { isPending, mutate } = useMutation({
    mutationFn: handlePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      toast.success("Post created successfully");
      setContent("");
      setFile(undefined);
      setLink(undefined);
      setOpen(false);
      queryClient.setQueryData(["get-link-metadata"], null);
    },
    onError: (error) => {
      toast.error("Error creating post");
      console.log(error);
    },
    mutationKey: ["create-post"],
  });

  const { data: linkMetadata } = useQuery({
    queryKey: ["get-link-metadata"],
    enabled: !!link,
    queryFn: async () => {
      const data = await axios("/api/url", {
        params: {
          url: link,
        },
      });
      return data;
    },
  });

  useEffect(() => {
    if (open) {
      setContent("");
      setFile(undefined);
      setLink(undefined);
      queryClient.setQueryData(["get-link-metadata"], null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        {...getRootProps()}
        className={cn(
          "flex flex-col overflow-hidden dark:bg-dark-bg max-w-xs rounded-3xl sm:max-w-lg bg-white drop-shadow-2xl sm:rounded-3xl  w-full border border-neutral-300/60 dark:border-dark-border px-2 py-3  ",
          isDragActive && "border-dashed border-indigo-600/60 bg-indigo-500/40"
          //   focus && "h-fit"
        )}
      >
        <DialogHeader className="px-2">
          <DialogTitle className="hidden" aria-hidden="true">
            Create Post
          </DialogTitle>
        </DialogHeader>
        <input {...getInputProps()} />
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
          {link && !linkMetadata?.data?.metadata && (
            <div className="max-w-xs w-full mt-4 rounded-2xl relative overflow-hidden  border border-neutral-300/80 dark:border-dark-border">
              <Skeleton className="h-[180px] bg-neutral-200/80 rounded-b-none dark:bg-dark-border " />
              <div className="h-[40px] pb-6 mt-4 flex flex-col items-start justify-center px-4">
                <Skeleton className="bg-neutral-200 dark:bg-dark-border h-4 w-1/2 rounded-lg" />
              </div>
            </div>
          )}
          {linkMetadata?.data?.metadata && (
            <PostLinkCard
              data={linkMetadata?.data?.metadata}
              hasRemove
              onRemove={() => {
                setLink(null);
                queryClient.setQueryData(["get-link-metadata"], null);
              }}
            />
          )}

          <div className="w-full flex overflow-x-auto gap-2 mt-4">
            {file && (
              <div
                key={file.id}
                className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border rounded-xl relative group p-1 "
              >
                <div
                  className="absolute top-2 right-2 opacity-0 z-30 group-hover:opacity-100 transition-all duration-200"
                  onClick={() => {
                    setFile(undefined);
                  }}
                >
                  <button
                    onClick={() => {
                      setLink(null);
                      queryClient.setQueryData(["get-link-metadata"], null);
                    }}
                    className="border border-neutral-200 dark:bg-dark-bg bg-white dark:border-dark-border rounded-full p-2"
                  >
                    <X className="size-4 opacity-80  " />
                  </button>
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
            )}
          </div>
        </div>
        <DialogFooter className="px-4 pb-2">
          <div className="w-full mt-4 gap-x-2 flex items-center justify-between">
            <div className="flex items-center justify-center gap-x-2">
              <div
                className={cn(
                  "size-7 bg-neutral-200 dark:bg-dark-border mr-2 rounded-full aspect-square flex relative overflow-hidden",
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
              <Button
                size={"icon"}
                className="rounded-full"
                variant={"ghost"}
                disabled={!!link || isPending}
                onClick={openDropZone}
              >
                <GalleryIcon
                  strokeWidth={1.2}
                  className="opacity-80 size-6  stroke-black dark:stroke-neutral-100"
                />
              </Button>

              <Button
                size={"icon"}
                className="rounded-full"
                variant={"ghost"}
                disabled={!!link || !!file || isPending}
                onClick={async () => {
                  const url = prompt("Enter a link:");
                  if (!url) return;
                  if (!isValidUrl(url)) {
                    toast.error("Invalid URL");
                    return;
                  }
                  console.log(url);

                  setLink(url);
                }}
              >
                <Link2 strokeWidth={1.4} className="-rotate-45 opacity-80" />
              </Button>
            </div>
            <div>
              <Button
                size={"sm"}
                variant={"ghost"}
                className=" px-4 rounded-full"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size={"sm"}
                className="ml-2 px-4 rounded-full"
                disabled={isPending}
                variant={"outline"}
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

{
  /* <div className={cn("relative", "")}>
  <AnimatePresence initial={false} mode="popLayout" custom={direction}>
  <motion.div
      variants={{
        enter: (direction) => ({
          x: direction > 0 ? 364 : -364,
          opacity: 0,
          height: bounds.height > 0 ? bounds.height : "auto",
          position: "initial",
          }),
          center: {
            zIndex: 1,
          x: 0,
          opacity: 1,
          height: bounds.height > 0 ? bounds.height : "auto",
        },
        exit: (direction) => ({
          zIndex: 0,
          x: direction < 0 ? 364 : -364,
          opacity: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }),
      }}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <input {...getInputProps()} />
      <div ref={ref} className="px-4 py-4">
        {tabs[activeIndex]}
        </div>
    </motion.div>
  </AnimatePresence>
</div> */
}

// const tabs = [
//   <div>
//     <TextArea
//       disabled={isPending}
//       className="appearance-none  bg-transparent text-neutral-600 dark:text-neutral-400 tracking-tight font-medium w-full  focus-visible:outline-none resize-none"
//       value={content.substring(0, MAX_WORD_COUNT)}
//       minRows={4}
//       maxRows={10}
//       onChange={(e) => {
//         setContent(e.target.value);
//       }}
//       placeholder={`What's on your mind, ${capitalizeFirstLetter(
//         data?.name?.split(" ")[0] as string
//       )}?`}
//     />
//   </div>,
//   <div className="h-[180px]">Links</div>,
//   <div className="h-[300px]">
//     <div className="w-full flex overflow-x-auto gap-2 mt-4">
//       {files.map((file) => (
//         <div
//           key={file.id}
//           className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border rounded-xl relative group p-1 "
//         >
//           <div
//             className="absolute top-2 right-2 opacity-0 z-30 group-hover:opacity-100 transition-all duration-200"
//             onClick={() => {
//               setFiles((prev) => prev.filter((f) => f.id !== file.id));
//             }}
//           >
//             <button className="p-2 rounded-full bg-white">
//               <X className="size-4" />
//             </button>
//           </div>
//           <div className="size-56 relative rounded-lg overflow-hidden">
//             {file.type === "image" ? (
//               <Image
//                 fill
//                 src={file.url}
//                 alt="Preview"
//                 className="w-full aspect-square object-cover "
//               />
//             ) : (
//               <video
//                 src={file.url}
//                 className="w-full aspect-square object-cover"
//               />
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>,
// ];

// const [activeIndex, setActiveIndex] = useState(0);
// const [direction, setDirection] = useState(1);
// const [ref, bounds] = useMeasure();

// const handleSetActiveIndex = (newIndex: number) => {
//   setDirection(newIndex > activeIndex ? 1 : -1);
//   setActiveIndex(newIndex);
// };
