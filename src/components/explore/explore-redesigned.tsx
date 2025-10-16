"use client";

import { getExploreFeed } from "@/actions/post-actions";
import { getRecentlyJoinedProfiles } from "@/actions/profile-actions";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import PostCard from "./post-card";
import ProfileCard from "./profile-card";
import {
  PostCardSkeleton,
  PostCardSkeletonWithImage,
  ProfileCardSkeleton,
} from "./skeletons";

const ExploreRedesigned = () => {
  // Posts query - get all posts then sort by likes
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["explore-top-posts"],
    queryFn: async () => {
      try {
        // Get multiple pages of posts to have a good selection
        const pages = await Promise.all([
          getExploreFeed(0),
          getExploreFeed(1),
          getExploreFeed(2),
          getExploreFeed(3),
        ]);

        const allPosts = pages.flatMap((page) => page.posts || []);
        // Sort by likes and get top 20
        return allPosts
          .sort((a, b) => Number(b.likeCount) - Number(a.likeCount))
          .slice(0, 20);
      } catch (error) {
        console.error("Error fetching top posts:", error);
        return [];
      }
    },
  });

  // Profiles query
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ["explore-profiles"],
    queryFn: () => getRecentlyJoinedProfiles(8), // Get 8 profiles for a nice grid
  });

  const topPosts = postsData ?? [];
  const profiles = profilesData ?? [];

  return (
    <div className="flex items-center justify-center flex-col w-full min-h-screen">
      {/* Page Header */}
      <div className="w-full max-w-4xl px-6 mt-12 mb-16 text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl text-neutral-900 dark:text-white mb-4 tracking-tight leading-tight">
            <span
              className="font-instrument tracking-wide inline-block"
              style={{ transform: "skewX(-5deg)", display: "inline-block" }}
            >
              Stories worth sharing,
            </span>{" "}
            <br />
            <span>people worth knowing</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl tracking-tight mx-auto leading-relaxed">
            Dive into fresh perspectives from new community members and discover
            the conversations everyone's talking about
          </p>
        </motion.div>
      </div>

      {/* People Section */}
      <div className="w-full max-w-6xl px-6 mb-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-instrument text-neutral-900 dark:text-white mb-1">
              New faces
            </h2>
            <div className="flex items-center justify-between ">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl font-light tracking-tight">
                People who just joined the community
              </p>
              <Link href={"/explore/profiles"}>
                <Button variant={"outline"}>View All</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profilesLoading
              ? // Show skeleton loaders
                Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`profile-skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProfileCardSkeleton />
                  </motion.div>
                ))
              : // Show actual profiles
                profiles.map((profile, i) => (
                  <motion.div
                    key={`profile-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  >
                    <ProfileCard profile={profile} />
                  </motion.div>
                ))}
          </div>

          {profiles.length === 0 && !profilesLoading && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <Users className="size-12 mx-auto mb-4 opacity-50" />
              <p>No new profiles found. Check back later!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Posts Section */}
      <div className="w-full max-w-6xl px-6 mb-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-instrument tracking-wide text-neutral-900 dark:text-white mb-1">
              Popular posts
            </h2>
            <div className="flex items-center justify-between ">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl font-light tracking-tight">
                Posts with the most engagement from the community
              </p>
              <Link href={"/explore/posts"}>
                <Button variant={"outline"}>View All</Button>
              </Link>
            </div>
          </div>

          <motion.div
            transition={{ duration: 0.3, type: "tween" }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {postsLoading
              ? // Show skeleton loaders
                Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={`post-skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="break-inside-avoid"
                  >
                    {/* Mix different skeleton types for variety */}
                    {i % 3 === 0 ? (
                      <PostCardSkeletonWithImage />
                    ) : (
                      <PostCardSkeleton />
                    )}
                  </motion.div>
                ))
              : // Show actual posts
                topPosts.map((post, i) => (
                  <motion.div
                    key={`post-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.02 }}
                    className="break-inside-avoid"
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
          </motion.div>

          {topPosts.length === 0 && !postsLoading && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <TrendingUp className="size-12 mx-auto mb-4 opacity-50" />
              <p>No posts found. Be the first to share something amazing!</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default ExploreRedesigned;
