"use client";
import { getExploreFeed, type FeedSort } from "@/actions/post-actions";
import { getMyCustomFeeds } from "@/actions/custom-feed-actions";
import { FeedMode } from "@/app/(dashboard)/explore/posts/page";
import CustomFeedForm from "@/components/feeds/CustomFeedForm";
import { EmptyFeed } from "@/components/ui/empty-feed";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
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
    <div className="w-full relative overflow-x-hidden min-h-screen">
      <div className="w-full h-20 bg-gradient-to-t from-neutral-50/60 via-neutral-50/40 dark:from-dark-bg dark:via-dark-bg/60 to-transparent fixed bottom-0 z-10 pointer-events-none" />

      {/* ── Following empty state ────────────────────────────────────────── */}
      {mode === "following" && (
        <EmptyFeed
          title="Nothing here yet"
          description="Create a custom feed to follow topics and profiles you care about."
          action={
            <button
              onClick={() => setFeedFormOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-dark-border rounded-full px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Plus className="size-3.5" /> Create feed
            </button>
          }
        />
      )}

      <CustomFeedForm
        open={feedFormOpen}
        onOpenChange={setFeedFormOpen}
        initialData={initialData}
        onSaved={() => setMode("recent")}
      />

      {/* ── Posts grid ──────────────────────────────────────────────────── */}
      {mode !== "following" && (
        <>
          <div className="w-full">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 px-4 mt-6 mb-16">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="break-inside-avoid mb-4">
                    {i % 3 === 0 ? <PostCardSkeletonWithImage /> : <PostCardSkeleton />}
                  </div>
                ))
                : posts.map((post, i) => (
                  <motion.div
                    key={`post-${post.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.01 }}
                    className="break-inside-avoid mb-4"
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
            </div>
          </div>

          {posts.length === 0 && !isLoading && (
            <EmptyFeed
              title="No posts found"
              description="Try selecting different topics or check back later."
            />
          )}

          <div ref={ref} className="h-10" />
          {isFetchingNextPage && (
            <div className="flex justify-center mb-10">
              <Loader strokeWidth={1.4} className="size-5 opacity-60 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreFeed;
