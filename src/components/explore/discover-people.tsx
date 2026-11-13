"use client";

import {
    getProfilesBySkill,
    getSkillsWithProfileCount,
    searchSkills,
} from "@/actions/discover-actions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader, Search, X } from "lucide-react";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ProfileCard from "./profile-card";
import { ProfileCardSkeleton } from "./skeletons";

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
    <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors duration-fast ease-calm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
            isSelected
                ? "border-ink bg-ink text-on-ink"
                : "border-hairline bg-surface text-ink hover:border-ink/30"
        )}
    >
        <span>{skill.name}</span>
        <span
            className={cn(
                "text-xs tabular-nums",
                isSelected ? "text-on-ink/70" : "text-ink-secondary"
            )}
        >
            {skill.profileCount}
        </span>
    </button>
);

const CHIP_SKELETON_WIDTHS = [72, 96, 64, 110, 84, 70, 120, 90, 66, 100, 78, 88];

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
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 md:pt-14">
            <header className="pb-8">
                <h1 className="font-instrument text-4xl leading-[1.05] text-ink md:text-5xl">
                    Find your people
                </h1>
                <p className="mt-2 max-w-md text-base text-ink-secondary">
                    Pick a skill to see who on Rize works with it.
                </p>
            </header>

            {/* Search */}
            <div className="relative max-w-md">
                <label htmlFor="skill-search" className="sr-only">
                    Search skills
                </label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-secondary" aria-hidden />
                <input
                    id="skill-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search skills"
                    className="h-11 w-full rounded-xl border border-hairline bg-surface pl-10 pr-11 text-[15px] text-ink placeholder:text-ink-secondary transition-[border-color,box-shadow] duration-fast ease-calm focus:border-ink focus:outline-none focus:ring-4 focus:ring-brand/40 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        className="touch-target absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                        <X className="size-4" aria-hidden />
                    </button>
                )}
            </div>

            {/* Skill chips */}
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Skills">
                {skillsLoading
                    ? CHIP_SKELETON_WIDTHS.map((w, i) => (
                        <div
                            key={i}
                            aria-hidden
                            className="h-9 rounded-full bg-subtle motion-safe:animate-pulse"
                            style={{ width: w }}
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
                    <p className="text-[15px] text-ink-secondary">
                        No skills match{searchQuery ? ` “${searchQuery}”` : ""}.
                    </p>
                )}
            </div>

            {/* Results */}
            {selectedSkill ? (
                <section aria-labelledby="skill-results" className="mt-12">
                    <div className="mb-5 flex items-end justify-between gap-4 border-b border-hairline pb-3">
                        <div className="min-w-0">
                            <h2 id="skill-results" className="font-instrument text-2xl leading-tight text-ink md:text-3xl">
                                {selectedSkill.name}
                            </h2>
                            <p className="mt-0.5 text-sm text-ink-secondary">
                                {selectedSkill.profileCount} {selectedSkill.profileCount === 1 ? "person" : "people"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedSkill(null)}
                            className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-ink hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        >
                            Clear
                        </button>
                    </div>

                    {profilesLoading ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProfileCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    ) : profiles.length === 0 ? (
                        <p className="py-10 text-[15px] text-ink-secondary">
                            No one has added this skill yet.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                                {profiles.map((p, idx) => (
                                    <ProfileCard
                                        key={p.id ?? idx}
                                        profile={p}
                                        skills={p.skills}
                                        activeSkillId={selectedSkill.id}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex flex-col items-center">
                                <div ref={sentinelRef} />
                                <div className="mt-3 text-sm text-ink-secondary">
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center gap-2" role="status">
                                            <Loader className="size-4 motion-safe:animate-spin" aria-hidden />
                                            Loading more
                                        </span>
                                    ) : !hasNextPage && profiles.length > 0 ? (
                                        <span>That&apos;s everyone for now</span>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            ) : null}
        </div>
    );
};

export default DiscoverPeople;
