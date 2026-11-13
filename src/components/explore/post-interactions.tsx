import { deletePost } from "@/actions/post-actions";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Result } from "url-metadata";
import { useAuthDialog } from "../dialog-provider";
import PersonAvatar, { usableImageSrc } from "../profile/person-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/** One quiet icon action in the interaction row. */
const actionClass = cn(
  "touch-target inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[13px] tabular-nums",
  "text-ink-secondary transition-colors duration-fast ease-calm hover:bg-subtle hover:text-ink",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
);

type PostInteractionsProps = {
  className?: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: number | null;
  handleVoteClick: (value: number) => void;
  commentCount: number;
  hasCommented?: boolean;
  handleCommentClick?: () => void;
  isBookmarked?: boolean;
  handleBookmarkClick?: () => void;
  handleShareClick?: () => void;
};

/** Votes, comments, save and copy link: a quiet row under a post. */
const PostInteractions: FC<PostInteractionsProps> = ({
  userVote,
  upvoteCount,
  downvoteCount,
  commentCount,
  handleCommentClick,
  hasCommented,
  handleVoteClick,
  isBookmarked,
  handleBookmarkClick,
  handleShareClick,
  className,
}) => {
  const setOpen = useAuthDialog()[1];
  const session = useSession();

  const [localVote, setLocalVote] = useState(userVote);
  const [localScore, setLocalScore] = useState(upvoteCount - downvoteCount);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);

  useEffect(() => {
    setLocalVote(userVote);
    setLocalScore(upvoteCount - downvoteCount);
    setLocalIsBookmarked(isBookmarked);
  }, [userVote, upvoteCount, downvoteCount, isBookmarked]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    if (!session?.data) {
      setOpen(true);
      return;
    }
    action();
  };

  const onVote = (e: React.MouseEvent, val: number) => {
    handleAction(e, () => {
      const isRemove = localVote === val;
      const delta = isRemove ? -val : val - (localVote || 0);
      setLocalVote(isRemove ? null : val);
      setLocalScore((s) => s + delta);
      handleVoteClick(val);
    });
  };

  const onBookmark = (e: React.MouseEvent) => {
    handleAction(e, () => {
      setLocalIsBookmarked(!localIsBookmarked);
      handleBookmarkClick?.();
    });
  };

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 px-3 pb-3 pt-1",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <button
            type="button"
            onClick={(e) => onVote(e, 1)}
            aria-label="Upvote"
            aria-pressed={localVote === 1}
            className={cn(actionClass, localVote === 1 && "text-ink")}
          >
            <ArrowBigUp
              className={cn("size-[18px]", localVote === 1 && "fill-current")}
              aria-hidden
            />
          </button>
          <span
            className={cn(
              "min-w-5 text-center text-[13px] tabular-nums",
              localVote !== null ? "font-medium text-ink" : "text-ink-secondary",
            )}
            aria-label={`Score ${localScore}`}
          >
            {localScore}
          </span>
          <button
            type="button"
            onClick={(e) => onVote(e, -1)}
            aria-label="Downvote"
            aria-pressed={localVote === -1}
            className={cn(actionClass, localVote === -1 && "text-ink")}
          >
            <ArrowBigDown
              className={cn("size-[18px]", localVote === -1 && "fill-current")}
              aria-hidden
            />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCommentClick?.();
          }}
          aria-label={`${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}
          className={cn(actionClass, "px-2", hasCommented && "text-ink")}
        >
          <MessageSquare
            className={cn("size-4", hasCommented && "fill-current")}
            aria-hidden
          />
          <span>{commentCount}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onBookmark}
          aria-label={localIsBookmarked ? "Saved" : "Save"}
          aria-pressed={!!localIsBookmarked}
          className={cn(actionClass, localIsBookmarked && "text-ink")}
        >
          <Bookmark
            className={cn("size-4", localIsBookmarked && "fill-current")}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShareClick?.();
          }}
          aria-label="Copy link"
          className={actionClass}
        >
          <Link2 className="size-4 -rotate-45" aria-hidden />
        </button>
      </div>
    </div>
  );
};

type PostaAvatarProps = {
  avatar: string;
  name: string;
  className?: string;
  size?: number;
};

export const PostAvatar: FC<PostaAvatarProps> = ({
  avatar,
  name,
  className,
  size = 36,
}) => {
  // Photo, or initials on a soft yellow tint if there's none or it fails.
  return <PersonAvatar src={avatar} name={name} size={size} className={className} />;
};

type PostCardOptionsProps = {
  profileId: string;
  postId: string;
  /** Called after the post is deleted (e.g. to leave the post page). */
  onDeleted?: () => void;
};

/** The "…" menu on a post: copy link for everyone, delete for the author. */
export const PostCardOptions: FC<PostCardOptionsProps> = ({
  postId,
  profileId,
  onDeleted,
}) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const isMine =
    (session?.data?.user as { profileId?: string } | undefined)?.profileId ===
    profileId;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted");
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
      onDeleted?.();
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("Couldn't delete the post. Try again.");
    },
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`,
      );
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="smallIcon"
            variant="ghost"
            aria-label="Post options"
            className="text-ink-secondary hover:text-ink"
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44" align="end">
          <DropdownMenuItem onSelect={copyLink}>
            <Link2 className="size-4 -rotate-45" aria-hidden />
            <span>Copy link</span>
          </DropdownMenuItem>
          {isMine && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setConfirmOpen(true)}
                className="text-danger focus:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isMine && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be removed from your profile and the feed, along with
                its comments. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  mutate(postId);
                }}
              >
                {isPending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

type PostCardContainerProps = {
  children: React.ReactNode;
  className?: string;
  addDarkStyles?: boolean;
  handlePostClick: () => void;
};

/** A post, writing or project in a list: hairline card on surface. */
export const PostCardContainer: FC<PostCardContainerProps> = ({
  children,
  className,
  handlePostClick,
}) => {
  return (
    <div
      onClick={handlePostClick}
      className={cn(
        "first:mt-0 mt-4 w-full cursor-pointer overflow-hidden break-inside-avoid rounded-xl border",
        "border-hairline bg-surface transition-colors duration-fast ease-calm hover:border-ink/20",
        className,
      )}
    >
      {children}
    </div>
  );
};

type PostLinkCardProps = {
  data?: Result;
  url?: string;
  onRemove?: () => void;
  hasRemove?: boolean;
  className?: string;
};

const LinkPreviewImage = ({ src }: { src?: string }) => {
  const usable = usableImageSrc(src);
  const [failed, setFailed] = useState(false);
  if (!usable || failed) return null;
  return (
    <div className="relative aspect-[1.91/1] w-full border-b border-hairline bg-subtle">
      {/* eslint-disable-next-line @next/next/no-img-element -- og:image can be any host */}
      <img
        src={usable}
        alt=""
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
        className="absolute inset-0 size-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** A link preview: og:image when it loads, the title, and the site. */
export const PostLinkCard: FC<PostLinkCardProps> = ({
  data,
  url,
  onRemove,
  hasRemove,
  className,
}) => {
  const displayUrl = data?.url || url;
  if (!displayUrl) return null;
  const title = (data?.title as string | undefined) || displayUrl;

  return (
    <div
      className={cn(
        !hasRemove && "mx-4",
        hasRemove && "max-w-xs",
        "relative mt-3 overflow-hidden rounded-xl border border-hairline bg-surface transition-colors duration-fast ease-calm hover:border-ink/20",
        className,
      )}
    >
      {hasRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove link"
          className="touch-target absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-surface text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
      {/* og:image comes from any site: load it directly, and drop the
          image area entirely if it fails, rather than showing alt text. */}
      <LinkPreviewImage src={data?.["og:image"] as string | undefined} />
      <Link
        href={displayUrl}
        onClick={(e) => e.stopPropagation()}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
      >
        <span className="line-clamp-2 text-sm font-medium text-ink">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-ink-secondary">
          {hostOf(displayUrl)}
        </span>
      </Link>
    </div>
  );
};

export default PostInteractions;
