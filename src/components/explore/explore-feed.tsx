"use client";
import { getExploreFeed, type FeedSort } from "@/actions/post-actions";
import { getMyCustomFeeds } from "@/actions/custom-feed-actions";
import { FeedMode } from "@/app/(dashboard)/explore/posts/page";
import CustomFeedForm from "@/components/feeds/CustomFeedForm";
import { Button } from "@/components/ui/button";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Loader, Plus } from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import PostCard from "./post-card";
import { PostCardSkeleton, PostCardSkeletonWithImage } from "./skeletons";

// ── Types ─────────────────────────────────────────────────────────────────


// ── Main component ────────────────────────────────────────────────────────
const ExploreFeed = ({
  mode,
  selectedTopicIds,
  activeSort,
  feedFormOpen,
  setFeedFormOpen,
  setMode,
  initialData,
}: {
  selectedTopicIds: string[];
  activeSort: FeedSort;
  mode: FeedMode;
  feedFormOpen: boolean;
  setFeedFormOpen: (open: boolean) => void;
  setMode: (mode: FeedMode) => void;
  initialData?: any;
}) => {
  const { ref, inViewport: inView } = useInViewport();
  const reduceMotion = useReducedMotion();


  // Fetch current custom feed if active
  const isCustomMode = !["recent", "trending", "following", "custom"].includes(mode);
  const { data: customFeedsData } = useQuery({
    queryKey: ["my-custom-feeds"],
    queryFn: getMyCustomFeeds,
    enabled: isCustomMode,
  });

  const { currentCustomFeed, customTopicIds, customProfileIds } = useMemo(() => {
    const feed = customFeedsData?.find(f => f.id === mode);
    const tIds = feed?.topics?.map(t => t.topicId) ?? [];
    const pIds = feed?.profiles?.map(p => p.profileId) ?? [];
    return { currentCustomFeed: feed, customTopicIds: tIds, customProfileIds: pIds };
  }, [customFeedsData, mode]);

  const effectiveTopicIds = useMemo(() => {
    return isCustomMode ? customTopicIds : selectedTopicIds;
  }, [isCustomMode, customTopicIds, selectedTopicIds]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["explore-feed", activeSort, mode, effectiveTopicIds, customProfileIds],
      queryFn: ({ pageParam }) =>
        getExploreFeed(pageParam, activeSort, effectiveTopicIds, customProfileIds),
      initialPageParam: 0,
      getNextPageParam: (lastPage, __, lastPageParam) =>
        lastPage?.posts?.length === 0 ? undefined : lastPageParam + 1,
      getPreviousPageParam: (__, _, firstPageParam) =>
        firstPageParam <= 1 ? undefined : firstPageParam - 1,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];




  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      {/* ── Following: not built yet, so point at custom feeds ─────────── */}
      {mode === "following" && (
        <FeedNote
          title="Nothing here yet"
          text="Make a feed of the topics and people you care about."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeedFormOpen(true)}
              className="h-10 gap-1.5 px-4"
            >
              <Plus className="size-4" aria-hidden /> New feed
            </Button>
          }
        />
      )}

      <CustomFeedForm
        open={feedFormOpen}
        onOpenChange={setFeedFormOpen}
        initialData={initialData}
        onSaved={() => setMode("recent")}
      />

      {/* ── Posts ──────────────────────────────────────────────────────── */}
      {mode !== "following" && (
        <>
          <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {isLoading
              ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mb-4 break-inside-avoid">
                  {i % 3 === 0 ? <PostCardSkeletonWithImage /> : <PostCardSkeleton />}
                </div>
              ))
              : posts.map((post) => (
                <motion.div
                  key={`post-${post.id}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="mb-4 break-inside-avoid"
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
          </div>

          {posts.length === 0 && !isLoading && (
            <FeedNote
              title="No posts here"
              text={
                isCustomMode
                  ? "Nothing in this feed yet. Edit it to add more topics or people."
                  : "Try other topics, or check back later."
              }
            />
          )}

          <div ref={ref} className="h-10" />
          {isFetchingNextPage && (
            <div className="mb-10 flex items-center justify-center gap-2 text-sm text-ink-secondary" role="status">
              <Loader className="size-4 motion-safe:animate-spin" aria-hidden />
              Loading more
            </div>
          )}
          {!hasNextPage && !isLoading && posts.length > 0 && (
            <p className="mb-10 text-center text-sm text-ink-secondary">
              You&apos;re all caught up
            </p>
          )}
        </>
      )}
    </div>
  );
};

/** A calm empty state: serif line, one sentence, maybe one action. */
const FeedNote = ({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) => (
  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 py-20 text-center">
    <h2 className="font-instrument text-3xl leading-tight text-ink">{title}</h2>
    <p className="text-[15px] text-ink-secondary">{text}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default ExploreFeed;
