"use server";

import { profile, profileSkills, skills, users } from "@/db/schema";
import db from "@/lib/db";
import { desc, eq, sql, lt, and, ilike } from "drizzle-orm";

/**
 * Get all skills that have at least one profile, ordered by profile count.
 */
export const getSkillsWithProfileCount = async () => {
    return await db
        .select({
            id: skills.id,
            name: skills.name,
            slug: skills.slug,
            profileCount: sql<number>`COUNT(${profileSkills.profileId})::int`.as(
                "profile_count"
            ),
        })
        .from(skills)
        .innerJoin(profileSkills, eq(profileSkills.skillId, skills.id))
        .groupBy(skills.id, skills.name, skills.slug)
        .orderBy(desc(sql`COUNT(${profileSkills.profileId})`));
};

/**
 * Get profiles that have a specific skill (cursor-paginated).
 */
export const getProfilesBySkill = async ({
    skillId,
    limit = 20,
    cursor,
}: {
    skillId: string;
    limit?: number;
    cursor?: string | null;
}) => {
    const rows = await db
        .select({
            id: profile.id,
            displayName: profile.displayName,
            username: profile.username,
            profileImage: profile.profileImage,
            bio: profile.bio,
            location: profile.location,
            personalMission: profile.personalMission,
            image: users.image,
            name: users.name,
            createdAt: profile.createdAt,
            skills: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN '[]'::json
            ELSE json_agg(json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ))
            END
          FROM profile_skills ps2
          JOIN skills s ON ps2.skill_id = s.id
          WHERE ps2.profile_id = profile.id
        )
      `.as("skills"),
        })
        .from(profile)
        .innerJoin(users, eq(profile.userId, users.id))
        .innerJoin(profileSkills, eq(profileSkills.profileId, profile.id))
        .where(
            and(
                eq(profileSkills.skillId, skillId),
                cursor ? lt(profile.createdAt, new Date(cursor)) : undefined
            )
        )
        .orderBy(desc(profile.createdAt))
        .limit(limit + 1);

    let nextCursor: string | null = null;
    const resultRows = rows.slice(0, limit);
    if (rows.length > limit) {
        const last = resultRows[resultRows.length - 1];
        nextCursor = last.createdAt ? new Date(last.createdAt).toISOString() : null;
    }

    return { profiles: resultRows, nextCursor };
};

/**
 * Search skills by name.
 */
export const searchSkills = async (query: string) => {
    if (!query || query.length < 1) {
        return await getSkillsWithProfileCount();
    }
    return await db
        .select({
            id: skills.id,
            name: skills.name,
            slug: skills.slug,
            profileCount: sql<number>`COUNT(${profileSkills.profileId})::int`.as(
                "profile_count"
            ),
        })
        .from(skills)
        .innerJoin(profileSkills, eq(profileSkills.skillId, skills.id))
        .where(ilike(skills.name, `%${query}%`))
        .groupBy(skills.id, skills.name, skills.slug)
        .orderBy(desc(sql`COUNT(${profileSkills.profileId})`));
};
