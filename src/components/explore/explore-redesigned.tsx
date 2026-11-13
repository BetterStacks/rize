"use client";

import { getPostViewerState } from "@/actions/post-actions";
import type { NewFace } from "@/lib/explore-data";
import type { GetExplorePosts } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import PostCard from "./post-card";
import ProfileCard from "./profile-card";

type ExploreProps = {
  /** Server-rendered, so the first screen shows real cards straight away. */
  profiles: NewFace[];
  posts: GetExplorePosts[];
};

const SectionHeader = ({
  id,
  title,
  description,
  href,
}: {
  id: string;
  title: string;
  description: string;
  href: string;
}) => (
  <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#E7E2D8] pb-3 dark:border-[#2E2923]">
    <div className="min-w-0">
      <h2 id={id} className="font-instrument text-2xl leading-tight text-[#1F1B16] md:text-3xl dark:text-[#F3EEE6]">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-[#5A5248] dark:text-[#B3A999]">
        {description}
      </p>
    </div>
    <Link
      href={href}
      className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-[#1F1B16] outline-none transition-colors hover:text-[#5A5248] focus-visible:ring-2 focus-visible:ring-main-yellow dark:text-[#F3EEE6] dark:hover:text-[#B3A999]"
    >
      See all
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  </div>
);

const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="rounded-xl border border-dashed border-[#E7E2D8] px-4 py-10 text-center text-sm text-[#5A5248] dark:border-[#2E2923] dark:text-[#B3A999]">
    {children}
  </p>
);

const ExploreRedesigned = ({ profiles, posts }: ExploreProps) => {
  const queryClient = useQueryClient();
  // Keyed by the server list so a fresh render replaces it. The vote and
  // bookmark hooks patch every ["explore-top-posts", ...] query optimistically.
  const queryKey = useMemo(
    () => ["explore-top-posts", posts.map((p) => p.id).join(",")],
    [posts],
  );

  // The list is cached for everyone, so the viewer's own votes, comments and
  // bookmarks are filled in after the cards show. Merging into the current
  // data keeps optimistic vote counts when the hooks invalidate this query.
  const { data: postsWithViewer = posts } = useQuery({
    queryKey,
    queryFn: async () => {
      const current =
        queryClient.getQueryData<GetExplorePosts[]>(queryKey) ?? posts;
      if (current.length === 0) return current;
      const state = await getPostViewerState(current.map((p) => p.id));
      return current.map((p) => ({ ...p, ...(state[p.id] ?? {}) }));
    },
    initialData: posts,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pb-10 pt-10 md:pb-14 md:pt-14">
        <h1 className="font-instrument text-4xl leading-[1.05] tracking-tight text-[#1F1B16] md:text-5xl dark:text-[#F3EEE6]">
          Explore
        </h1>
        <p className="mt-2 max-w-md text-base text-[#5A5248] dark:text-[#B3A999]">
          New people on Rize, and the posts getting the most votes.
        </p>
      </header>

      <section aria-labelledby="new-faces" className="mb-14">
        <SectionHeader
          id="new-faces"
          title="New faces"
          description="Just joined"
          href="/explore/profiles"
        />
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.username} profile={profile} />
            ))}
          </div>
        ) : (
          <EmptyState>No new profiles yet. Check back soon.</EmptyState>
        )}
      </section>

      <section aria-labelledby="popular-posts">
        <SectionHeader
          id="popular-posts"
          title="Popular posts"
          description="Most upvoted lately"
          href="/explore/posts"
        />
        {postsWithViewer.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {postsWithViewer.map((post) => (
              <div key={post.id} className="mb-4 break-inside-avoid">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>No posts yet. Yours could be the first.</EmptyState>
        )}
      </section>
    </div>
  );
};

export default ExploreRedesigned;
