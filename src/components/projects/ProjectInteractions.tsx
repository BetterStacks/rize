import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
    ArrowBigDown,
    ArrowBigUp,
    Bookmark,
    Share,
} from "lucide-react";
import { FC } from "react";
import { useAuthDialog } from "../dialog-provider";

type ProjectInteractionsProps = {
    upvoteCount: number;
    downvoteCount: number;
    userVote: number | null;
    handleVoteClick: (value: number) => void;
    isBookmarked?: boolean;
    handleBookmarkClick?: () => void;
    handleShareClick?: () => void;
    className?: string;
    compact?: boolean;
};

const action = cn(
    "touch-target inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-sm",
    "text-ink-secondary transition-colors duration-fast ease-calm hover:bg-subtle hover:text-ink",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
);

/** Votes, save and share for a project, in the same quiet style as posts. */
const ProjectInteractions: FC<ProjectInteractionsProps> = ({
    userVote,
    upvoteCount,
    downvoteCount,
    handleVoteClick,
    isBookmarked,
    handleBookmarkClick,
    handleShareClick,
    className,
    compact = false,
}) => {
    const setOpen = useAuthDialog()[1];
    const session = useSession();

    const score = upvoteCount - downvoteCount;

    const handleAction = (e: React.MouseEvent, run: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        if (!session?.data) {
            setOpen(true);
            return;
        }
        run();
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-1", className)}>
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={(e) => handleAction(e, () => handleVoteClick(1))}
                    aria-label="Upvote"
                    aria-pressed={userVote === 1}
                    className={cn(action, "w-9 px-0", userVote === 1 && "text-ink")}
                >
                    <ArrowBigUp className={cn("size-5", userVote === 1 && "fill-current")} aria-hidden />
                </button>
                <span
                    className={cn(
                        "min-w-6 text-center text-sm tabular-nums",
                        userVote ? "font-medium text-ink" : "text-ink-secondary",
                    )}
                    aria-label={`Score ${score}`}
                >
                    {score}
                </span>
                <button
                    type="button"
                    onClick={(e) => handleAction(e, () => handleVoteClick(-1))}
                    aria-label="Downvote"
                    aria-pressed={userVote === -1}
                    className={cn(action, "w-9 px-0", userVote === -1 && "text-ink")}
                >
                    <ArrowBigDown className={cn("size-5", userVote === -1 && "fill-current")} aria-hidden />
                </button>
            </div>

            <button
                type="button"
                onClick={(e) => handleAction(e, () => handleBookmarkClick?.())}
                aria-label={compact ? (isBookmarked ? "Saved" : "Save") : undefined}
                aria-pressed={!!isBookmarked}
                className={cn(action, isBookmarked && "text-ink")}
            >
                <Bookmark className={cn("size-4", isBookmarked && "fill-current")} aria-hidden />
                {!compact && <span>{isBookmarked ? "Saved" : "Save"}</span>}
            </button>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShareClick?.();
                }}
                aria-label={compact ? "Share" : undefined}
                className={action}
            >
                <Share className="size-4" aria-hidden />
                {!compact && <span>Share</span>}
            </button>
        </div>
    );
};

export default ProjectInteractions;
