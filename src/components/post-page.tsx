"use client";
import { getPostById } from "@/actions/post-actions";
import { useTogglePostBookmark } from "@/hooks/useTogglePostBookmark";
import { useVotePost } from "@/hooks/useVotePost";
import { useSession } from "@/lib/auth-client";
import { GetCommentWithProfile, GetExplorePosts } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import toast from "react-hot-toast";
import Comments from "./comments";
import { useAuthDialog } from "./dialog-provider";
import PostInteractions, {
  PostAvatar,
  PostCardOptions,
  PostLinkCard,
} from "./explore/post-interactions";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

type PostPageProps = {
  id: string;
  initialPostData: GetExplorePosts;
  initialCommentsData: GetCommentWithProfile[];
};

const PostPage: FC<PostPageProps> = ({
  initialPostData,
  initialCommentsData,
  id,
}) => {
  const session = useSession();
  const { data: post } = useQuery({
    initialData: initialPostData,
    queryKey: ["get-post-by-id", id],
    queryFn: () => getPostById(id),
  });
  const setOpen = useAuthDialog()[1];
  const mutation = useVotePost({
    userVote: post.userVote ?? null,
    postId: id,
  });

  const bookmarkMutation = useTogglePostBookmark({
    postId: id,
    isBookmarked: !!post.bookmarked,
  });

  const handleVoteClick = (value: number) => {
    mutation.mutate(value);
  };

  const handleBookmarkClick = () => {
    bookmarkMutation.mutate();
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.name}`,
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

  const score = (post.upvoteCount || 0) - (post.downvoteCount || 0);
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="w-full shadow-none bg-transparent dark:bg-transparent border-none">
        <CardHeader className="px-0  mt-4 z-50 top-0 dark:bg-dark-bg/80 pt-0 backdrop-blur-md bg-white/80 border-b border-neutral-200 dark:border-dark-border pb-4">
          <div className={cn("flex items-center justify-between px-4 mt-4")}>
            <div className="w-full flex items-center justify-start">
              <PostAvatar
                avatar={post?.avatar as string}
                name={post?.name as string}
                className="size-10"
              />

              <div className={cn(" flex flex-col items-start ml-4")}>
                <Link href={`/${post?.username}`}>
                  <h2
                    className={cn(
                      " leading-tight text-black  ",
                      "dark:text-white",
                    )}
                  >
                    {post.name}
                  </h2>
                </Link>
                <div
                  className={cn(
                    "flex items-center justify-start dark:text-neutral-400 text-sm font-light leading-snug text-neutral-600 ",
                  )}
                >
                  <p className={cn("mr-1")}>@{post.username}</p>
                </div>
              </div>
            </div>{" "}
            <PostCardOptions
              postId={post.id}
              profileId={post.profileId as string}
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 mb-2 mt-4">
          {post?.content && (
            <div
              className={cn(
                "text-neutral-600 leading-snug mb-8 mt-4 px-4  ",
                "dark:text-neutral-300  prose dark:prose-invert dark:prose-gray-300",
              )}
              dangerouslySetInnerHTML={{ __html: post?.content ?? "" }}
            />
          )}
          <div className="overflow-x-auto px-4 w-full flex items-center justify-center">
            {post.media && (
              <div
                className={cn(
                  "relative border  border-neutral-200 aspect-video  w-full rounded-2xl overflow-hidden ",
                  "dark:border-dark-border",
                )}
                style={{
                  objectFit: "cover",
                  // aspectRatio: post?.media?.width / post?.media?.height,
                }}
              >
                {post?.media?.type === "image" ? (
                  <>
                    <Image
                      fill
                      src={post?.media.url}
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
                      src={post?.media?.url}
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
          {post?.link && <PostLinkCard {...post?.link} />}
          <div
            className={cn(
              "px-4 text-sm  text-neutral-500 dark:text-neutral-400 mt-2",
              (post?.media || post?.link) && "mt-4 px-6",
            )}
          >
            <span className="mr-1.5">
              {new Date(post?.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            {"•"}
            <span className="ml-1.5 ">
              {new Date(post?.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex border-y border-neutral-200 dark:border-dark-border flex-col p-0">
          <PostInteractions
            className="border-none mt-0 py-4"
            upvoteCount={Number(post.upvoteCount)}
            downvoteCount={Number(post.downvoteCount)}
            userVote={post.userVote ?? null}
            handleVoteClick={handleVoteClick}
            commentCount={Number(post.commentCount)}
            hasCommented={Boolean(post.commented)}
            handleCommentClick={() => {}}
            isBookmarked={!!post.bookmarked}
            handleBookmarkClick={handleBookmarkClick}
            handleShareClick={handleShareClick}
          />
        </CardFooter>
        <Comments
          commentCount={post?.commentCount}
          commented={Boolean(post?.commented)}
          initialData={initialCommentsData}
          id={id}
        />
      </Card>
    </div>
  );
};

export default PostPage;
