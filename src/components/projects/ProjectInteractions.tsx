import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
    ArrowBigDown,
    ArrowBigUp,
    Bookmark,
    Share2,
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
    const [open, setOpen] = useAuthDialog();
    const session = useSession();

    const score = upvoteCount - downvoteCount;

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        if (!session?.data) {
            setOpen(true);
            return;
        }
        action();
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {/* Voting Section */}
            <div className="flex border dark:border-dark-border border-neutral-300/80 rounded-3xl p-1 items-center bg-neutral-50/50 dark:bg-dark-bg/50">
                <div
                    onClick={(e) => handleAction(e, () => handleVoteClick(1))}
                    className={cn(
                        "p-1 rounded-full transition-colors hover:bg-orange-500/10 group",
                        userVote === 1 && "bg-orange-500/10"
                    )}
                >
                    <ArrowBigUp
                        className={cn(
                            compact ? "size-5" : "size-6",
                            "transition-colors",
                            userVote === 1
                                ? "fill-orange-600 stroke-orange-600"
                                : "stroke-neutral-500 dark:stroke-neutral-400 group-hover:stroke-orange-500"
                        )}
                    />
                </div>

                <span className={cn(
                    "text-sm font-bold min-w-[1.2rem] text-center transition-colors",
                    userVote === 1 && "text-orange-600",
                    userVote === -1 && "text-blue-600",
                    !userVote && "text-neutral-600 dark:text-neutral-300"
                )}>
                    {score}
                </span>

                <div
                    onClick={(e) => handleAction(e, () => handleVoteClick(-1))}
                    className={cn(
                        "p-1 rounded-full transition-colors hover:bg-blue-500/10 group",
                        userVote === -1 && "bg-blue-500/10"
                    )}
                >
                    <ArrowBigDown
                        className={cn(
                            compact ? "size-5" : "size-6",
                            "transition-colors",
                            userVote === -1
                                ? "fill-blue-600 stroke-blue-600"
                                : "stroke-neutral-500 dark:stroke-neutral-400 group-hover:stroke-blue-500"
                        )}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div
                onClick={(e) => handleAction(e, () => handleBookmarkClick?.())}
                className={cn(
                    "flex border dark:border-dark-border text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer border-neutral-300/80 rounded-3xl items-center justify-center gap-x-2 transition-all bg-neutral-50/50 dark:bg-dark-bg/50",
                    compact ? "py-1.5 px-3" : "py-2 px-4",
                    isBookmarked && "bg-yellow-400/10"
                )}
            >
                <Bookmark
                    className={cn(
                        compact ? "size-4" : "size-5",
                        isBookmarked
                            ? "fill-yellow-500 stroke-yellow-500"
                            : "stroke-neutral-500 dark:stroke-neutral-400"
                    )}
                />
                {!compact && (
                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                        {isBookmarked ? "Saved" : "Save"}
                    </span>
                )}
            </div>

            {/* Share Button */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShareClick?.();
                }}
                className={cn(
                    "flex border dark:border-dark-border text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer border-neutral-300/80 rounded-3xl items-center justify-center gap-x-2 transition-all bg-neutral-50/50 dark:bg-dark-bg/50",
                    compact ? "py-1.5 px-3" : "py-2 px-4"
                )}
            >
                <Share2
                    className={cn(compact ? "size-4" : "size-5", "stroke-neutral-500 dark:stroke-neutral-400")}
                />
                {!compact && (
                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                        Share
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProjectInteractions;
