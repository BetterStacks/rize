import { useTogglePostBookmark } from "@/hooks/useTogglePostBookmark";
import { useVotePost } from "@/hooks/useVotePost";
import { GetExplorePosts, TPostMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { canOptimize, usableImageSrc } from "../profile/person-avatar";
import PostInteractions, {
  PostAvatar,
  PostCardContainer,
  PostCardOptions,
  PostLinkCard,
} from "./post-interactions";

type PostCardProps = {
  post: GetExplorePosts;
  className?: string;
  mediaContainerClassName?: string;
  addDarkStyles?: boolean;
  /** Kept for callers; the author line always shows. */
  showHeader?: boolean;
};

// Other screens (writing cards) still read moment's relative time with
// these short labels, so the override stays here.
moment.updateLocale("en", {
  relativeTime: {
    past: "%s",
    s: "%dsec",
    ss: "%dsec",
    m: "%d min",
    mm: "%d min",
    h: "%d hr ago",
    hh: "%d hr ago",
    d: "%dd",
    dd: "%dd",
    w: "%d week",
    ww: "%d weeks",
    M: "%d mon",
    MM: "%d mon",
    y: "%dyr",
    yy: "%dyr",
  },
});

/** "now", "12m", "3h", "5d", then "Mar 4" (and the year once it's not this one). */
export const shortTime = (value: Date | string) => {
  const date = new Date(value);
  const diff = Math.max(0, Date.now() - date.getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

/** Avatar, name, "@handle · time" and the options menu. */
export const PostAuthorLine: FC<{
  post: GetExplorePosts;
  /** Link the time to the post (off on the post page itself). */
  linkTime?: boolean;
  avatarSize?: number;
  onDeleted?: () => void;
}> = ({ post, linkTime = true, avatarSize = 36, onDeleted }) => {
  const name = post.name || post.username || "Someone";
  const time = shortTime(post.createdAt);
  return (
    <div className="flex items-start gap-3">
      <Link
        href={`/${post.username}`}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
        tabIndex={-1}
        aria-hidden
      >
        <PostAvatar avatar={post.avatar as string} name={name} size={avatarSize} />
      </Link>
      <div className="min-w-0 flex-1 leading-tight">
        <Link
          href={`/${post.username}`}
          onClick={(e) => e.stopPropagation()}
          className="block truncate text-sm font-medium text-ink hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
        >
          {name}
        </Link>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[13px] text-ink-secondary">
          <span className="truncate">@{post.username}</span>
          <span aria-hidden>·</span>
          {linkTime ? (
            <Link
              href={`/post/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 hover:text-ink hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
            >
              <time dateTime={new Date(post.createdAt).toISOString()}>{time}</time>
              <span className="sr-only">, open post</span>
            </Link>
          ) : (
            <time className="shrink-0" dateTime={new Date(post.createdAt).toISOString()}>
              {time}
            </time>
          )}
        </p>
      </div>
      <PostCardOptions
        postId={post.id}
        profileId={post.profileId as string}
        onDeleted={onDeleted}
      />
    </div>
  );
};

/**
 * A post's one image or video. Keeps the shape it was uploaded with (capped
 * so tall photos don't take over a column) and disappears if it can't load.
 */
export const PostMedia: FC<{
  media: TPostMedia;
  sizes: string;
  className?: string;
  maxHeight?: number;
  controls?: boolean;
}> = ({ media, sizes, className, maxHeight = 520, controls = true }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const src = usableImageSrc(media?.url);
  if (!src) return null;
  const ratio =
    media.width && media.height ? `${media.width} / ${media.height}` : "4 / 3";

  if (media.type === "video") {
    if (videoFailed) return null;
    return (
      <div
        className={cn("relative w-full overflow-hidden bg-subtle", className)}
        style={{ aspectRatio: ratio, maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          className="size-full select-none object-cover"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          controls={controls}
          draggable={false}
          onError={() => setVideoFailed(true)}
        />
      </div>
    );
  }

  if (imageFailed) return null;
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-subtle", className)}
      style={{ aspectRatio: ratio, maxHeight }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        unoptimized={!canOptimize(src)}
        draggable={false}
        className="select-none object-cover"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
};

const PostCard: FC<PostCardProps> = ({ post, className, mediaContainerClassName }) => {
  const router = useRouter();

  const mutation = useVotePost({
    userVote: post.userVote ?? null,
    postId: post.id,
  });

  const bookmarkMutation = useTogglePostBookmark({
    postId: post.id,
    isBookmarked: !!post.bookmarked,
  });

  const handleShareClick = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Post by ${post.name}`, url });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  const media = post?.media as TPostMedia | undefined;

  return (
    <PostCardContainer
      handlePostClick={() => router.push(`/post/${post?.id}`)}
      className={cn("group", className)}
    >
      <div className="px-4 pt-4">
        <PostAuthorLine post={post} />
      </div>

      {post?.content && (
        <div
          className={cn(
            "prose prose-sm max-w-none px-4 pt-3 text-[15px] leading-relaxed text-ink dark:prose-invert",
            "prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0 prose-a:text-ink prose-a:underline-offset-4",
            "line-clamp-[10] break-words",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content ?? "") }}
        />
      )}

      {media?.url && (
        <div className="px-4 pt-3">
          <PostMedia
            media={media}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className={cn("rounded-lg border border-hairline", mediaContainerClassName)}
          />
        </div>
      )}

      {post?.link && <PostLinkCard {...post.link} />}

      <PostInteractions
        className="mt-2"
        upvoteCount={Number(post.upvoteCount)}
        downvoteCount={Number(post.downvoteCount)}
        userVote={post?.userVote ?? null}
        handleVoteClick={(value) => mutation.mutate(value)}
        commentCount={Number(post?.commentCount)}
        hasCommented={Boolean(post?.commented)}
        handleCommentClick={() => router.push(`/post/${post?.id}`)}
        isBookmarked={!!post.bookmarked}
        handleBookmarkClick={() => bookmarkMutation.mutate()}
        handleShareClick={handleShareClick}
      />
    </PostCardContainer>
  );
};

export default PostCard;
