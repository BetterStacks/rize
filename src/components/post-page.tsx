"use client";
import { getPostById } from "@/actions/post-actions";
import { useTogglePostBookmark } from "@/hooks/useTogglePostBookmark";
import { useVotePost } from "@/hooks/useVotePost";
import { sanitizeHtml } from "@/lib/sanitize";
import { GetCommentWithProfile, GetExplorePosts } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC } from "react";
import toast from "react-hot-toast";
import Comments from "./comments";
import { isoOf, PostAuthorLine, PostMedia } from "./explore/post-card";
import PostInteractions, { PostLinkCard } from "./explore/post-interactions";

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
  const router = useRouter();
  const { data: post } = useQuery({
    initialData: initialPostData,
    queryKey: ["get-post-by-id", id],
    queryFn: () => getPostById(id),
  });
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
      toast.success("Link copied");
    }
  };

  const media = post?.media?.url ? post.media : null;
  const created = new Date(post?.createdAt);

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6 md:pt-10">
      <Link
        href="/explore/posts"
        className="-ml-2 mb-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Posts
      </Link>

      <PostAuthorLine
        post={post}
        linkTime={false}
        avatarSize={44}
        onDeleted={() => router.push("/explore/posts")}
      />

      {post?.content && (
        <div
          className={cn(
            "prose mt-5 max-w-none break-words text-[17px] leading-relaxed text-ink dark:prose-invert",
            "prose-p:my-3 first:prose-p:mt-0 prose-a:text-ink prose-a:underline-offset-4",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post?.content ?? "") }}
        />
      )}

      {media && (
        <PostMedia
          media={media}
          sizes="(min-width: 768px) 640px, 100vw"
          maxHeight={720}
          className="mt-5 rounded-xl border border-hairline"
        />
      )}

      {post?.link && <PostLinkCard {...post.link} className="mx-0 mt-5" />}

      <p className="mt-5 text-[13px] text-ink-secondary">
        <time dateTime={isoOf(post?.createdAt)}>
          {created.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
          <span aria-hidden> · </span>
          {created.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </p>

      <div className="mt-4 border-y border-hairline py-1">
        <PostInteractions
          className="px-0 pb-0 pt-0 [&>div:first-child]:-ml-1.5 [&>div:last-child]:-mr-1.5"
          upvoteCount={Number(post.upvoteCount)}
          downvoteCount={Number(post.downvoteCount)}
          userVote={post.userVote ?? null}
          handleVoteClick={handleVoteClick}
          commentCount={Number(post.commentCount)}
          hasCommented={Boolean(post.commented)}
          handleCommentClick={() =>
            document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          isBookmarked={!!post.bookmarked}
          handleBookmarkClick={handleBookmarkClick}
          handleShareClick={handleShareClick}
        />
      </div>

      <Comments
        commentCount={post?.commentCount}
        commented={Boolean(post?.commented)}
        initialData={initialCommentsData}
        id={id}
      />
    </article>
  );
};

export default PostPage;
