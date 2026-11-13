"use client";
import { getPostComments } from "@/actions/post-actions";
import { useComment } from "@/hooks/useComment";
import { queryClient } from "@/lib/providers";
import { GetCommentWithProfile, TUploadFilesResponse } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";
import { uploadErrorMessage, uploadFiles } from "@/lib/prepare-upload";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ImagePlus,
  Link2,
  Loader,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import React, { FC, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Textarea from "react-textarea-autosize";
import { Result } from "url-metadata";
import { v4 } from "uuid";
import { useAuthDialog } from "./dialog-provider";
import { isoOf, PostMedia, shortTime } from "./explore/post-card";
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
    "newest",
  );
  const session = useSession();
  const { data: comments, isLoading } = useQuery({
    initialData: initialData,
    queryKey: ["get-post-comments", id, orderBy],
    queryFn: () => getPostComments(id, orderBy),
  });

  const { removeCommentMutation } = useComment({ postId: id, orderBy });
  const setAuthOpen = useAuthDialog()[1];

  const count = Number(commentCount) || comments?.length || 0;

  return (
    <section id="comments" aria-labelledby="comments-title" className="scroll-mt-24 pt-8">
      <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
        <h2 id="comments-title" className="font-instrument text-[28px] leading-none text-ink">
          Comments
          {count > 0 && (
            <span className="ml-2 font-inter text-sm tabular-nums text-ink-secondary">
              {count}
            </span>
          )}
        </h2>
        {(comments?.length ?? 0) > 1 && (
          <div className="flex items-center">
            <label htmlFor="comment-order" className="sr-only">
              Sort comments
            </label>
            <select
              id="comment-order"
              onChange={(e) => setOrderBy(e?.target.value as any)}
              value={orderBy}
              className="h-9 rounded-lg border border-hairline bg-surface px-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most liked</option>
            </select>
          </div>
        )}
      </div>

      {session?.data ? (
        <CommentForm orderBy={orderBy} id={id} />
      ) : (
        <p className="flex flex-wrap items-center gap-x-2 border-b border-hairline pb-5 pt-1 text-[15px] text-ink-secondary">
          <span>Join the conversation</span>
          <span aria-hidden>·</span>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="min-h-11 rounded-md font-medium text-ink underline decoration-brand decoration-2 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Sign in to comment
          </button>
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8" role="status">
          <Loader className="size-5 text-ink-secondary motion-safe:animate-spin" aria-hidden />
          <span className="sr-only">Loading comments</span>
        </div>
      ) : comments?.length === 0 ? (
        <p className="py-8 text-[15px] text-ink-secondary">
          No comments yet.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {comments?.map((comment, i) => (
            <li key={comment?.id ?? i}>
              <CommentCard
                comment={comment}
                handleDelete={removeCommentMutation.mutate}
                isDeleting={removeCommentMutation?.isPending}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
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

  const hasDraft = content?.length > 0 || !!file;
  const userName =
    session?.data?.user?.displayName || session?.data?.user?.name || "";

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex w-full items-start gap-3 border-b border-hairline pb-4 pt-1",
        isDragActive && "rounded-xl bg-subtle",
      )}
    >
      <input {...getInputProps()} className="hidden" />
      {session?.data && (
        <PostAvatar
          className="mt-1 hidden sm:inline-flex"
          size={32}
          avatar={
            session?.data?.user?.profileImage ||
            session?.data?.user?.image ||
            ""
          }
          name={userName}
        />
      )}
      <div className="min-w-0 flex-1">
        <label htmlFor="comment-input" className="sr-only">
          Write a comment
        </label>
        <Textarea
          id="comment-input"
          minRows={2}
          className="w-full resize-none rounded-xl border border-hairline bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-secondary transition-[border-color,box-shadow] duration-fast ease-calm focus:border-ink focus:outline-none focus:ring-4 focus:ring-brand/40"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder="Add a comment"
        />
        {link && !linkMetadata?.data?.metadata && (
          <div className="mt-3 w-full max-w-xs overflow-hidden rounded-xl border border-hairline" aria-hidden>
            <Skeleton className="h-[140px] rounded-none bg-subtle" />
            <div className="px-3 py-3">
              <Skeleton className="h-4 w-1/2 rounded-md bg-subtle" />
            </div>
          </div>
        )}
        {linkMetadata?.data?.metadata && (
          <PostLinkCard
            className="mx-0 mt-3"
            data={linkMetadata?.data?.metadata}
            hasRemove
            onRemove={() => {
              setLink(null);
              queryClient.setQueryData(["get-link-metadata"], null);
            }}
          />
        )}

        {file && (
          <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-hairline bg-subtle">
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remove attachment"
              className="touch-target absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-surface text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
            {file.type === "image" ? (
              <Image
                fill
                unoptimized
                src={file.url}
                alt="Attachment preview"
                className="object-contain"
              />
            ) : (
              <video
                src={file.url}
                controls
                className="size-full object-contain"
              />
            )}
          </div>
        )}
        <div
          className={cn(
            "mt-2 hidden w-full items-center justify-between",
            hasDraft && "flex",
          )}
        >
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="smallIcon"
              variant="ghost"
              aria-label="Add a photo or video"
              className="text-ink-secondary hover:text-ink"
              disabled={!!link || addCommentMutation?.isPending}
              onClick={openDropZone}
            >
              <ImagePlus className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              size="smallIcon"
              variant="ghost"
              aria-label="Add a link"
              className="text-ink-secondary hover:text-ink"
              disabled={!!link || !!file || addCommentMutation?.isPending}
              onClick={async () => {
                const url = prompt("Paste a link");
                if (!url) return;
                if (!isValidUrl(url)) {
                  toast.error("That link doesn't look right");
                  return;
                }

                setLink(url);
              }}
            >
              <Link2 className="size-4 -rotate-45" aria-hidden />
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            loading={isUploadingMedia}
            onClick={async () => {
              let media: TUploadFilesResponse | undefined = undefined;

              if (file) {
                setIsUploadingMedia(true);
                try {
                  const [resp] = await uploadFiles(
                    [file.file],
                    "fyp-stacks/posts",
                  );
                  media = {
                    url: resp?.url,
                    height: resp?.height,
                    width: resp?.width,
                  };
                } catch (err) {
                  toast.error(uploadErrorMessage(err));
                  return;
                } finally {
                  setIsUploadingMedia(false);
                }
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
                },
              );
            }}
            disabled={
              (content?.trim().length || 0) < 2 ||
              isUploadingMedia ||
              addCommentMutation.isPending
            }
          >
            Comment
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

  const name = comment?.displayName || comment?.username || "Someone";
  const media = comment?.media?.url ? comment.media : null;

  return (
    <div className="flex w-full items-start gap-3 py-4">
      <Link
        href={`/${comment?.username}`}
        tabIndex={-1}
        aria-hidden
        className="mt-0.5 shrink-0 rounded-full"
      >
        <PostAvatar size={32} avatar={comment?.profileImage} name={name} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[13px] leading-tight text-ink-secondary">
            <Link
              href={`/${comment?.username}`}
              className="truncate rounded-sm text-sm font-medium text-ink hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              {name}
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={isoOf(comment?.createdAt)}>
              {shortTime(comment?.createdAt)}
            </time>
          </p>
          {isMine && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="smallIcon"
                  variant="ghost"
                  aria-label="Comment options"
                  className="-mr-1.5 -mt-1.5 shrink-0 text-ink-secondary hover:text-ink"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() => handleDelete(comment?.id)}
                  disabled={isDeleting}
                  className="text-danger focus:text-danger"
                >
                  {isDeleting ? (
                    <Loader className="size-4 motion-safe:animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-4" aria-hidden />
                  )}
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {comment?.content && (
          <p className="mt-1.5 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink">
            {comment.content}
          </p>
        )}

        {media && (
          <PostMedia
            media={media}
            sizes="(min-width: 768px) 400px, 100vw"
            maxHeight={400}
            className="mt-3 max-w-md rounded-xl border border-hairline"
          />
        )}
        {comment?.data && (
          <PostLinkCard
            className="mx-0 w-full max-w-sm"
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
