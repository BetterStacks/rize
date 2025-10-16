"use client";

import React from "react";
import { getProfiles } from "@/actions/profile-actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProfileCard from "./profile-card";
import { Button } from "../ui/button";
import { Loader, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileCardSkeleton } from "./skeletons";

const AllProfiles = () => {
  type ProfilesPage = { profiles: any[]; nextCursor: string | null };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["all-profiles"],
    // pageParam is the cursor (ISO date) for pagination
    queryFn: ({ pageParam }: { pageParam?: string | null }) =>
      getProfiles({ limit: 20, cursor: pageParam ?? null }),
    // initialPageParam required by the project's react-query typings
    initialPageParam: null,
    getNextPageParam: (lastPage: ProfilesPage) =>
      lastPage.nextCursor ?? undefined,
  });

  const profiles = data?.pages?.flatMap((p: ProfilesPage) => p.profiles) ?? [];

  // sentinel ref to trigger loading next page when it enters the viewport
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  //   console.log(profiles.map((p) => p.media
  return (
    <div className="w-full max-w-6xl px-6 mt-12 mb-16 mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">Explore profiles</h2>
        <p className="text-neutral-600 mt-1">
          Discover members of the community
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={`profile-skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <ProfileCardSkeleton />
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load profiles</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Users className="size-12 mx-auto mb-4 opacity-50" />
          <p>No profiles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile: any, idx: number) => (
              <ProfileCard key={profile.id ?? idx} profile={profile} />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            {/* Sentinel element - when visible, automatically fetch next page */}
            <div ref={sentinelRef} />
            <div className="mt-3">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              ) : !hasNextPage ? (
                <span className="text-sm text-neutral-500">
                  No more profiles
                </span>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllProfiles;
