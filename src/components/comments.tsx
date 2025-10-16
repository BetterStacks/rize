"use client";
import { getPostComments } from "@/actions/post-actions";
import { useComment } from "@/hooks/useComment";
import { queryClient } from "@/lib/providers";
import { GetCommentWithProfile, TUploadFilesResponse } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Bookmark,
  Link2,
  Loader,
  MoreHorizontalIcon,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "@/hooks/useAuth";
import Image from "next/image";
import React, { FC, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Textarea from "react-textarea-autosize";
import { Result } from "url-metadata";
import { v4 } from "uuid";
import { GalleryIcon } from "./explore/post-form";
import { PostAvatar, PostLinkCard } from "./explore/post-interactions";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

type CommentsProps = {
  id: string;
  initialData: GetCommentWithProfile[];
  commentCount: number;
  commented: boolean;
};

const Comments: FC<CommentsProps> = ({
  id,
  initialData,
  commentCount,
  commented,
}) => {
  const [orderBy, setOrderBy] = useState<"newest" | "oldest" | "popular">(
    "newest"
  );
  const session = useSession();
  const { data: comments, isLoading } = useQuery({
    initialData: initialData,
    queryKey: ["get-post-comments", id, orderBy],
    queryFn: () => getPostComments(id, orderBy),
  });

  const { removeCommentMutation } = useComment({ postId: id, orderBy });

  return (
    <div className=" mb-10">
      {session?.data && <CommentForm orderBy={orderBy} id={id} />}
      <div className="space-y-4 ">
        {isLoading ? (
          <div className="mt-6 flex flex-col items-center justify-center">
            <Loader className="size-6 animate-spin text-neutral-500 dark:text-neutral-400" />
          </div>
        ) : comments?.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center">
            <span className="dark:text-neutral-400 text-neutral-600">
              0 Comments Found
            </span>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4 flex items-center justify-between">
              <span className="dark:text-neutral-400 text-neutral-600">
                {commentCount} Comments
              </span>
              <div>
                <select
                  onChange={(e) => setOrderBy(e?.target.value as any)}
                  value={orderBy}
                  className="dark:bg-dark-bg bg-white dark:border-dark-border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 focus-visible:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular Liked</option>
                </select>
              </div>
            </div>
            {comments?.map((comment, i) => {
              return (
                <CommentCard
                  key={i}
                  comment={comment}
                  handleDelete={removeCommentMutation.mutate}
                  isDeleting={removeCommentMutation?.isPending}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};

type TCommentForm = {
  id: string;
  orderBy: "newest" | "oldest" | "popular";
};

const CommentForm: FC<TCommentForm> = ({ id, orderBy }) => {
  const session = useSession();
  const [link, setLink] = useState<string | null>();
  const [content, setContent] = React.useState<string>("");
  const [file, setFile] = React.useState<MediaFile | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

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
  const { addCommentMutation } = useComment({
    postId: id,
    orderBy: orderBy,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "pt-4 pb-6 border-b border-neutral-300 dark:border-dark-border px-6 group flex items-center justify-center w-full",
        isDragActive && "bg-blue-400/20"
      )}
    >
      <input {...getInputProps()} className="hidden" />
      {isDesktop && session?.data && (
        <div className="mr-4 self-start flex-shrink-0">
          <PostAvatar
            className="size-8"
            avatar={
              session?.data?.user?.profileImage ||
              session?.data?.user?.image ||
              ""
            }
            name={
              session?.data?.user?.displayName ||
              session?.data?.user?.name ||
              ""
            }
          />
        </div>
      )}
      <div className="flex-1  ">
        <Textarea
          autoFocus
          className={cn(
            "appearance-none  px-2 text-sm md:text-base w-full bg-transparent text-neutral-600 dark:text-neutral-200 tracking-tight font-medium focus-visible:outline-none shadow-none resize-none border-none",
            (content?.length > 0 || file) && "mb-4"
          )}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder={"What's on your mind?"}
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
            className="mt-4"
            data={linkMetadata?.data?.metadata}
            hasRemove
            onRemove={() => {
              setLink(null);
              queryClient.setQueryData(["get-link-metadata"], null);
            }}
          />
        )}

        {file && (
          <div className="w-full flex gap-2 mt-4 ">
            <div
              key={file.id}
              className="aspect-video max-w-xs flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border rounded-xl relative group overflow-hidden "
            >
              <div
                className="absolute top-2 right-2 opacity-0 z-30 group-hover:opacity-100 transition-all duration-200"
                onClick={() => {
                  setFile(null);
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
              <div className="aspect-video w-full relative rounded-lg overflow-hidden">
                {file.type === "image" ? (
                  <Image
                    height={400}
                    width={400}
                    priority
                    src={file.url}
                    alt="Preview"
                    className="w-full aspect-video  object-contain"
                  />
                ) : (
                  <video
                    src={file.url}
                    controls
                    autoPlay={true}
                    className="w-full object-top aspect-video "
                  />
                )}
              </div>
            </div>
          </div>
        )}
        <div
          className={cn(
            "hidden items-center mt-4 justify-between w-full",
            (content?.length > 0 || file) && "flex"
          )}
        >
          <div className="space-x-2 ">
            <Button
              size={"icon"}
              className="rounded-full"
              variant={"ghost"}
              disabled={!!link || addCommentMutation?.isPending}
              onClick={openDropZone}
            >
              <GalleryIcon
                strokeWidth={1.2}
                className="opacity-80 size-6  stroke-black dark:stroke-neutral-100"
              />
            </Button>

            <Button
              disabled={!!link || !!file || addCommentMutation?.isPending}
              onClick={async () => {
                const url = prompt("Enter a link:");
                if (!url) return;
                if (!isValidUrl(url)) {
                  toast.error("Invalid URL");
                  return;
                }

                setLink(url);
              }}
              size={"icon"}
              className="rounded-full"
              variant={"ghost"}
            >
              <Link2 strokeWidth={1.4} className="-rotate-45 opacity-80" />
            </Button>
          </div>
          <Button
            className="rounded-3xl px-6"
            variant={"outline"}
            size={"sm"}
            onClick={async () => {
              let media: TUploadFilesResponse | undefined = undefined;

              if (file) {
                setIsUploadingMedia(true);
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
                setIsUploadingMedia(false);
              }
              // capture current form values so we can restore them if posting fails
              const prevValues = { content, file, link };

              // Optimistically clear the form while the comment is being posted
              setContent("");
              setFile(null);
              setLink(null);
              queryClient.setQueryData(["get-link-metadata"], null);

              addCommentMutation.mutate(
                {
                  content: content.trim(),
                  media: media,
                  ...(link && {
                    url: link,
                    data: linkMetadata?.data?.metadata,
                  }),
                },
                {
                  onSuccess: async () => {
                    setContent("");
                    setFile(null);
                    setLink(null);
                    queryClient.setQueryData(["get-link-metadata"], null);
                    await queryClient.invalidateQueries({
                      queryKey: ["get-post-comments", id, orderBy],
                    });
                  },
                  onError: (_err) => {
                    // restore previous form values if creating the comment failed
                    setContent(prevValues.content);
                    setFile(prevValues.file);
                    setLink(prevValues.link);
                    toast.error(_err?.message || "Failed to post comment");
                  },
                }
              );
            }}
            disabled={
              (content?.trim().length || 0) < 2 ||
              isUploadingMedia ||
              addCommentMutation.isPending
            }
          >
            {isUploadingMedia && (
              <Loader className="size-4 opacity-80 animate-spin mr-2" />
            )}
            <span className="">Comment</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

type CommentCardProps = {
  comment: GetCommentWithProfile;
  handleDelete: (id: string) => void;
  isDeleting: boolean;
};

const CommentCard: FC<CommentCardProps> = ({
  comment,
  handleDelete,
  isDeleting,
}) => {
  const session = useSession();
  const isMine =
    (session?.data?.user as any)?.profileId === (comment?.profileId as string);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div
      className={cn(
        "w-full border-t first:border-none border-neutral-300 dark:border-dark-border px-2 md:px-6 py-4 flex  items-center justify-start"
      )}
    >
      {/* {isDesktop && ( */}
      <div className="pt-0.5 self-start flex-shrink-0">
        <PostAvatar
          className="size-8"
          avatar={comment?.profileImage}
          name={comment?.displayName}
        />
      </div>

      <div className={cn("w-full flex flex-col items-start ml-4")}>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center justify-start gap-1 md:gap-2">
            <h3 className="tracking-tight  text-sm md:text-base">
              {comment?.displayName}
            </h3>
            <span className="text-neutral-500 dark:text-neutral-400">
              {"•"}
            </span>

            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {new Date(comment?.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="z-[6]  transition-all duration-200 ease-in"
            >
              <Button
                size={"smallIcon"}
                className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0  aspect-square "
                variant={"ghost"}
              >
                <MoreHorizontalIcon
                  className={cn(
                    "text-neutral-500 size-4 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-2xl shadow-black/40 dark:shadow-black rounded-xl dark:bg-dark-bg border dark:border-dark-border border-neutral-300/60 bg-white p-0">
              <DropdownMenuItem className="px-4 py-1.5 ">
                <Link2 className="opacity-80 -rotate-45 size-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border">
                <Bookmark className="opacity-80  size-4" />
                <span>Save</span>
              </DropdownMenuItem>
              {isMine && (
                <DropdownMenuItem
                  onClick={() => handleDelete(comment?.id)}
                  className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border"
                >
                  {isDeleting ? (
                    <Loader className="opacity-80 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="opacity-80 size-4" />
                  )}
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="dark:text-neutral-300/80 md:text-base text-sm mt-2 text-neutral-600">
          {comment?.content?.split("\n").map((line, i) => {
            return (
              <span className={cn("")} key={i}>
                {line} <br className="" />
              </span>
            );
          })}
        </span>

        <div className="mt-4 w-full flex items-center justify-start">
          {comment?.media && (
            <div
              className={cn(
                "relative border  border-neutral-300/80 aspect-video  w-full rounded-xl overflow-hidden ",
                "dark:border-dark-border"
              )}
              style={{
                objectFit: "cover",
              }}
            >
              {comment?.media?.type === "image" ? (
                <>
                  <Image
                    fill
                    src={comment?.media.url}
                    alt="Post media"
                    quality={100}
                    priority
                    style={{ objectFit: "cover" }}
                    draggable={false}
                    className=" select-none "
                  />
                </>
              ) : (
                <>
                  <video
                    style={{ objectFit: "cover" }}
                    className="w-full h-full select-none  "
                    src={comment?.media?.url}
                    autoPlay
                    draggable={false}
                    loop
                    muted
                    controls={false}
                  />
                </>
              )}
            </div>
          )}
        </div>
        {comment?.data && (
          <PostLinkCard
            className="mx-0 w-full max-w-sm "
            data={comment?.data as Result}
          />
        )}
      </div>
    </div>
  );
};

export default Comments;
// const mutation = useMutation({
//   mutationFn: (payload: TAddNewComment) => addComment({ ...payload }),
//   onMutate: async () => {
//     setCommented((prev) => !prev);
//     setCommentCount((prev) => Number(prev) + 1);
//   },
//   onSuccess: async () => {
//     setContent("");
//     setFile(null);
//     setLink(null);
//     queryClient.setQueryData(["get-link-metadata"], null);

// await queryClient.invalidateQueries({
//   queryKey: ["get-post-comments", id],
// });

//     await queryClient.setQueryData(["explore-feed"], (oldData: any) => {
//       const newPages = oldData.pages.map((page: any) => {
//         return {
//           ...page,
//           posts: page.posts.map((post: any) => {
//             if (post.id === id) {
//               return {
//                 ...post,
//                 commentCount: Number(post.commentCount) + 1,
//                 commented: true,
//               };
//             }
//             return post;
//           }),
//         };
//       });
//       return { ...oldData, pages: newPages };
//     });
//     toast.success("Comment added successfully!");
//   },
//   onError: (error) => {
//     toast.error(error.message || "Failed to add comment");
//     setCommented((prev) => !prev);
//     setCommentCount((prev) => prev - 1);
//   },
// });
