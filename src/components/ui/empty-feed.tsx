import { cn } from "@/lib/utils";

// ── Stacked-cards illustration (mimics the reference design) ──────────────
const StackedCardsIllustration = () => (
    <div className="relative w-36 h-28 select-none">
        {/* Back card */}
        <div className="absolute top-0 left-0 w-[120px] h-[88px] rounded-xl bg-neutral-200/70 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700" />

        {/* Front card — gradient glow border */}
        <div
            className="absolute bottom-0 right-0 w-[120px] h-[88px] rounded-xl"
            style={{
                background:
                    "linear-gradient(135deg, #f5a623 0%, #d946ef 50%, #6366f1 100%)",
                padding: "1.5px",
            }}
        >
            <div className="w-full h-full rounded-[10px] bg-white dark:bg-neutral-800 flex flex-col gap-2 p-3 overflow-hidden">
                {/* Image placeholder */}
                <div className="w-full h-8 rounded-md bg-neutral-200/60 dark:bg-neutral-700/60" />
                {/* Text placeholders */}
                <div className="space-y-1.5">
                    <div className="w-4/5 h-2 rounded-full bg-neutral-300/50 dark:bg-neutral-700/50" />
                    <div className="w-3/5 h-2 rounded-full bg-neutral-300/40 dark:bg-neutral-700/40" />
                    <div className="w-2/5 h-2 rounded-full bg-neutral-300/30 dark:bg-neutral-700/30" />
                </div>
            </div>
        </div>

        {/* Glow blur behind front card */}
        <div
            className="absolute bottom-0 right-0 w-[120px] h-[88px] rounded-xl opacity-30 blur-xl -z-10"
            style={{
                background:
                    "linear-gradient(135deg, #f5a623 0%, #d946ef 50%, #6366f1 100%)",
            }}
        />
    </div>
);

interface EmptyFeedProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyFeed = ({
    title = "Nothing here yet",
    description = "Create a custom feed to follow topics and profiles you care about.",
    action,
    className,
}: EmptyFeedProps) => (
    <div
        className={cn(
            "flex flex-col items-center justify-center py-20 gap-5 text-center",
            className
        )}
    >
        <StackedCardsIllustration />
        <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                {title}
            </h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-[260px] leading-relaxed">
                {description}
            </p>
        </div>
        {action}
    </div>
);

export default EmptyFeed;
