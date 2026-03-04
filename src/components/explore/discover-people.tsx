"use client";

import {
    getProfilesBySkill,
    getSkillsWithProfileCount,
    searchSkills,
} from "@/actions/discover-actions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Users,
    Sparkles,
    MapPin,
    User2,
    ArrowLeft,
    Loader,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { PostCardContainer } from "./post-interactions";

type Skill = {
    id: string;
    name: string;
    slug: string;
    profileCount: number;
};

type DiscoverProfile = {
    id: string;
    displayName: string | null;
    username: string | null;
    profileImage: string | null;
    bio: string | null;
    location: string | null;
    personalMission: string | null;
    image: string | null;
    name: string | null;
    createdAt: Date;
    skills: Array<{ id: string; name: string; slug: string }>;
};

/* ─── Skill Chip ─── */
const SkillChip: FC<{
    skill: Skill;
    isSelected: boolean;
    onClick: () => void;
}> = ({ skill, isSelected, onClick }) => (
    <motion.button
        layout
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
            isSelected
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent shadow-lg shadow-neutral-900/20 dark:shadow-white/20"
                : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-md"
        )}
    >
        <span>{skill.name}</span>
        <span
            className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                isSelected
                    ? "bg-white/20 dark:bg-neutral-900/20"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
            )}
        >
            {skill.profileCount}
        </span>
    </motion.button>
);

/* ─── Profile Card with Skills ─── */
const DiscoverProfileCard: FC<{
    profile: DiscoverProfile;
    activeSkillId?: string;
}> = ({ profile, activeSkillId }) => {
    const session = useSession();
    const isOwnProfile =
        (session?.data?.user as any)?.username === profile.username;

    if (!profile.username) return null;

    const rawSrc = profile.profileImage || profile.image || "";
    let normalizedSrc: string | null = null;
    if (rawSrc) {
        try {
            new URL(rawSrc);
            normalizedSrc = rawSrc;
        } catch {
            normalizedSrc = rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`;
        }
    }

    return (
        <PostCardContainer
            handlePostClick={() => window.open(`/${profile.username}`, "_blank")}
            className="group hover:shadow-lg shadow transition-all duration-300"
        >
            <div className="p-5">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 ring-2 ring-neutral-200 dark:ring-neutral-600 group-hover:ring-neutral-400 dark:group-hover:ring-neutral-400 transition-all duration-300">
                        {normalizedSrc ? (
                            <Image
                                src={normalizedSrc}
                                alt={profile.displayName || profile.username || "User"}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User2 className="size-8 opacity-40" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name */}
                <div className="text-center mb-3">
                    <Link href={`/${profile.username}`} target="_blank">
                        <h3 className="font-semibold text-base text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {profile.displayName || profile.name || profile.username}
                        </h3>
                    </Link>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        @{profile.username}
                    </p>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 text-center leading-relaxed mb-3 line-clamp-2">
                        {profile.bio}
                    </p>
                )}

                {/* Location */}
                {profile.location && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                        <MapPin className="size-3" />
                        <span>{profile.location}</span>
                    </div>
                )}

                {/* Skills Tags */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {profile.skills.slice(0, 4).map((skill) => (
                            <span
                                key={skill.id}
                                className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    skill.id === activeSkillId
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium"
                                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                )}
                            >
                                {skill.name}
                            </span>
                        ))}
                        {profile.skills.length > 4 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
                                +{profile.skills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* CTA */}
                <Link href={`/${profile.username}`} target="_blank" className="w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 rounded-full border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isOwnProfile ? "Edit Profile" : "Connect"}
                    </Button>
                </Link>
            </div>
        </PostCardContainer>
    );
};

/* ─── Main Component ─── */
const DiscoverPeople = () => {
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Fetch all skills with counts
    const { data: allSkills, isLoading: skillsLoading } = useQuery({
        queryKey: ["discover-skills"],
        queryFn: () => getSkillsWithProfileCount(),
    });

    // Search skills
    const { data: searchedSkills } = useQuery({
        queryKey: ["discover-skills-search", searchQuery],
        queryFn: () => searchSkills(searchQuery),
        enabled: searchQuery.length > 0,
    });

    const displayedSkills = useMemo(
        () => (searchQuery ? searchedSkills : allSkills) ?? [],
        [searchQuery, searchedSkills, allSkills]
    );

    // Fetch profiles for selected skill
    const {
        data: profilesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: profilesLoading,
    } = useInfiniteQuery({
        queryKey: ["discover-profiles-by-skill", selectedSkill?.id],
        queryFn: ({ pageParam }: { pageParam?: string | null }) =>
            getProfilesBySkill({
                skillId: selectedSkill!.id,
                limit: 20,
                cursor: pageParam ?? null,
            }),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
        enabled: !!selectedSkill,
    });

    const profiles = useMemo(
        () =>
            profilesData?.pages?.flatMap((p: any) => p.profiles as DiscoverProfile[]) ?? [],
        [profilesData]
    );

    // Infinite scroll sentinel
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
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleSkillClick = useCallback(
        (skill: Skill) => {
            setSelectedSkill((prev) =>
                prev?.id === skill.id ? null : skill
            );
        },
        []
    );

    return (
        <div className="flex items-center justify-center flex-col w-full min-h-screen">
            {/* Header */}
            <div className="w-full max-w-4xl px-6 mt-12 mb-10 text-center mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                        <Sparkles className="size-4" />
                        <span>Discover by skills</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl text-neutral-900 dark:text-white mb-4 tracking-tight leading-tight">
                        <span
                            className="font-instrument tracking-wide inline-block"
                            style={{ transform: "skewX(-5deg)", display: "inline-block" }}
                        >
                            Find your
                        </span>{" "}
                        <br />
                        <span>people</span>
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl tracking-tight mx-auto leading-relaxed">
                        Discover and connect with people who share your skills and interests
                    </p>
                </motion.div>
            </div>

            {/* Search */}
            <div className="w-full max-w-2xl px-6 mb-8 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search skills..."
                        className="w-full pl-12 pr-10 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-400 dark:focus:border-neutral-500 transition-all duration-200 text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Skill Chips */}
            <div className="w-full max-w-5xl px-6 mb-10 mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex flex-wrap gap-2 justify-center"
                >
                    {skillsLoading
                        ? Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                                style={{ width: `${60 + Math.random() * 60}px` }}
                            />
                        ))
                        : displayedSkills.map((skill: Skill) => (
                            <SkillChip
                                key={skill.id}
                                skill={skill}
                                isSelected={selectedSkill?.id === skill.id}
                                onClick={() => handleSkillClick(skill)}
                            />
                        ))}

                    {!skillsLoading && displayedSkills.length === 0 && (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            No skills found{searchQuery ? ` matching "${searchQuery}"` : ""}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Selected Skill Header */}
            <AnimatePresence mode="wait">
                {selectedSkill && (
                    <motion.div
                        key={selectedSkill.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-6xl px-6 mb-6 mx-auto"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedSkill(null)}
                                    className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <ArrowLeft className="size-5 text-neutral-600 dark:text-neutral-400" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                        {selectedSkill.name}
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {selectedSkill.profileCount} people with this skill
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profiles Grid */}
            {selectedSkill && (
                <div className="w-full max-w-6xl px-6 mb-16 mx-auto">
                    {profilesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={`skeleton-${i}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-5 animate-pulse">
                                        <div className="flex justify-center mb-4">
                                            <div className="size-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                            <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-800 rounded mt-2" />
                                            <div className="flex gap-1.5 mt-2">
                                                <div className="h-5 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                                                <div className="h-5 w-14 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
                            <Users className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No people found with this skill yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {profiles.map((p, idx) => (
                                    <motion.div
                                        key={p.id ?? idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.03 }}
                                    >
                                        <DiscoverProfileCard
                                            profile={p}
                                            activeSkillId={selectedSkill.id}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-6">
                                <div ref={sentinelRef} />
                                <div className="mt-3">
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="size-4 animate-spin" />
                                            <span className="text-sm">Loading more...</span>
                                        </div>
                                    ) : !hasNextPage && profiles.length > 0 ? (
                                        <span className="text-sm text-neutral-500">
                                            That's everyone!
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Empty state when no skill selected */}
            {!selectedSkill && !skillsLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-neutral-400 dark:text-neutral-500"
                >
                    <Users className="size-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Select a skill to discover people</p>
                </motion.div>
            )}

            <div className="h-20" />
        </div>
    );
};

export default DiscoverPeople;
