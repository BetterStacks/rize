"use client";

import React from "react";
import { getProfiles } from "@/actions/profile-actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProfileCard from "./profile-card";
import { Button } from "../ui/button";
import { Loader, Users } from "lucide-react";
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
    <div className="mx-auto mb-16 w-full max-w-6xl px-4 pt-10 sm:px-6 md:pt-14">
      <div className="mb-6 border-b border-[#E7E2D8] pb-4 dark:border-[#2E2923]">
        <h1 className="font-instrument text-4xl leading-tight text-[#1F1B16] dark:text-[#F3EEE6]">
          Everyone on Rize
        </h1>
        <p className="mt-1 text-sm text-[#5A5248] dark:text-[#B3A999]">
          Newest first
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProfileCardSkeleton key={`profile-skeleton-${i}`} />
          ))}
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-[#5A5248] dark:text-[#B3A999]">Couldn&apos;t load profiles. Try refreshing.</p>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Users className="size-12 mx-auto mb-4 opacity-50" />
          <p>No profiles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
                <span className="text-sm text-[#5A5248] dark:text-[#B3A999]">
                  That&apos;s everyone for now
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
