"use server";

import {
  topics,
  media,
  projectTopics,
  projectMedia,
  projects,
  skills,
  projectSkills,
  profile,
  projectBookmarks,
  projectCollaborators,
  projectVotes,
} from "@/db/schema";
import { requireAuth, requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import {
  GetAllProjects,
  newProjectSchema,
  TProject,
  UpsertProjectPayload,
} from "@/lib/types";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getProfileIdByUsername } from "./profile-actions";
import { deleteFromS3, getS3KeyFromUrl } from "@/lib/s3";
import { asc } from "drizzle-orm";

export const getAllTopics = async () => {
  return await db.select().from(topics).orderBy(asc(topics.name));
};

export const getAllSkills = async () => {
  return await db.select().from(skills).orderBy(asc(skills.name));
};


export const getAllProjects = async (username: string) => {
  const profileId = await getProfileIdByUsername(username);
  if (!profileId) {
    throw new Error("Profile not found");
  }

  let session = null;
  let userProfileId: string | null = null;
  try {
    const s = await requireAuth();
    session = s;
    userProfileId = s.user.profileId || null;
  } catch { }

  const { ...rest } = getTableColumns(projects);
  const allProjects = await db
    .select({
      ...rest,
      logo: media.url,
      upvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("upvoteCount"),
      downvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("downvoteCount"),
      userVote: userProfileId
        ? sql<number | null>`(SELECT value FROM project_votes WHERE project_id = ${projects.id} AND profile_id = ${userProfileId} LIMIT 1)`.as("userVote")
        : sql<number | null>`NULL`.as("userVote"),
      bookmarked: userProfileId
        ? sql<boolean>`EXISTS (SELECT 1 FROM project_bookmarks WHERE project_id = ${projects.id} AND profile_id = ${userProfileId})`.as("bookmarked")
        : sql<boolean>`false`.as("bookmarked"),
      attachments: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', m.id,
              'url', m.url,
              'type', m.type,
              'width', m.width,
              'height', m.height
            ))
            END
          FROM project_media pm
          JOIN media m ON pm.media_id = m.id
          WHERE pm.project_id = projects.id
        )
      `.as("attachments"),
      topics: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug
            ))
            END
          FROM project_topics pt
          JOIN topics t ON pt.topic_id = t.id
          WHERE pt.project_id = projects.id
        )
      `.as("topics"),
      skills: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ))
            END
          FROM project_skills ps
          JOIN skills s ON ps.skill_id = s.id
          WHERE ps.project_id = projects.id
        )
      `.as("skills"),
      collaborators: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', p.id,
              'displayName', p.display_name,
              'username', p.username,
              'profileImage', p.profile_image
            ))
            END
          FROM project_collaborators pc
          JOIN profile p ON pc.profile_id = p.id
          WHERE pc.project_id = projects.id
        )
      `.as("collaborators"),
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(eq(projects.profileId, profileId?.id as string));
  if (allProjects?.length === 0) {
    return [];
  }
  return allProjects as GetAllProjects[];
};

export const getProjectByID = async (id: string) => {
  let userProfileId: string | null = null;
  try {
    const s = await requireAuth();
    userProfileId = s.user.profileId || null;
  } catch { }

  const { ...rest } = getTableColumns(projects);
  const allProjects = await db
    .select({
      ...rest,
      logo: media.url,
      username: profile.username,
      upvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("upvoteCount"),
      downvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("downvoteCount"),
      userVote: userProfileId
        ? sql<number | null>`(SELECT value FROM project_votes WHERE project_id = ${projects.id} AND profile_id = ${userProfileId} LIMIT 1)`.as("userVote")
        : sql<number | null>`NULL`.as("userVote"),
      bookmarked: userProfileId
        ? sql<boolean>`EXISTS (SELECT 1 FROM project_bookmarks WHERE project_id = ${projects.id} AND profile_id = ${userProfileId})`.as("bookmarked")
        : sql<boolean>`false`.as("bookmarked"),
      attachments: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', m.id,
              'url', m.url,
              'type', m.type,
              'width', m.width,
              'height', m.height
            ))
            END
          FROM project_media pm
          JOIN media m ON pm.media_id = m.id
          WHERE pm.project_id = projects.id
        )
      `.as("attachments"),
      topics: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', t.id,
              'name', t.name,
              'slug', t.slug
            ))
            END
          FROM project_topics pt
          JOIN topics t ON pt.topic_id = t.id
          WHERE pt.project_id = projects.id
        )
      `.as("topics"),
      skills: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ))
            END
          FROM project_skills ps
          JOIN skills s ON ps.skill_id = s.id
          WHERE ps.project_id = projects.id
        )
      `.as("skills"),
      collaborators: sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', p.id,
              'displayName', p.display_name,
              'username', p.username,
              'profileImage', p.profile_image
            ))
            END
          FROM project_collaborators pc
          JOIN profile p ON pc.profile_id = p.id
          WHERE pc.project_id = projects.id
        )
      `.as("collaborators"),
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .leftJoin(profile, eq(profile.id, projects.profileId))
    .where(eq(projects.id, id as string))
    .limit(1);
  return allProjects[0] as GetAllProjects;
};

// ── Upsert (create or update) ──────────────────────────────────────────

export const upsertProject = async (
  payload: UpsertProjectPayload
) => {
  try {
    const profileId = await requireProfile();
    const isUpdate = !!payload.id;

    // ── handle logo ────────────────────────────────────────────────────
    let logoId: string | null = null;
    if (payload.logo) {
      const [logoRow] = await db
        .insert(media)
        .values({
          // @ts-ignore
          url: payload.logo,
          type: "image",
          profileId,
          height: payload.height ? parseInt(payload.height) : undefined,
          width: payload.width ? parseInt(payload.width) : undefined,
        })
        .returning({ id: media.id });

      if (!logoRow) throw new Error("Logo upload failed");
      logoId = logoRow.id;
    }

    // ── insert or update the project row ───────────────────────────────
    let projectId: string;

    if (isUpdate) {
      const updateData: any = {
        name: payload.name,
        tagline: payload.tagline || "",
        description: payload.description || "",
        url: payload.url,
      };
      if (logoId) updateData.logo = logoId;

      const [updated] = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, payload.id!))
        .returning();

      if (!updated) throw new Error("Error updating project");
      projectId = updated.id;
    } else {
      const [created] = await db
        .insert(projects)
        .values({
          name: payload.name,
          tagline: payload.tagline || "",
          description: payload.description || "",
          url: payload.url,
          profileId,
          logo: logoId,
        })
        .returning();

      projectId = created.id;
    }

    // ── handle new media attachments ──────────────────────────────────
    if (payload.media && payload.media.length > 0) {
      await db.transaction(async (tx) => {
        for (const item of payload.media!) {
          const [inserted] = await tx
            .insert(media)
            .values({
              url: item.url,
              type: item.type === "video" ? "video" : "image",
              profileId,
              height: item.height,
              width: item.width,
            })
            .returning({ id: media.id });

          if (inserted) {
            await tx.insert(projectMedia).values({
              projectId,
              mediaId: inserted.id,
            });
          }
        }
      });
    }

    // ── handle media removals (edit only) ─────────────────────────────
    if (
      isUpdate &&
      payload.removeMediaPayload &&
      payload.removeMediaPayload.length > 0
    ) {
      const ids = payload.removeMediaPayload.map((item) => item.id);
      const deletePromises = payload.removeMediaPayload.map((item) => {
        const key = getS3KeyFromUrl(item.url);
        return deleteFromS3(key);
      });
      await Promise.allSettled(deletePromises);
      await db.transaction(async (tx) => {
        await tx.delete(media).where(inArray(media.id, ids));
      });
    }

    // ── handle topics ────────────────────────────────────────────────
    if (payload.topicIds) {
      await db.transaction(async (tx) => {
        // Clear existing topics if updating
        if (isUpdate) {
          await tx.delete(projectTopics).where(eq(projectTopics.projectId, projectId));
        }

        // Insert new topics
        if (payload.topicIds!.length > 0) {
          await tx.insert(projectTopics).values(
            payload.topicIds!.map(topicId => ({
              projectId,
              topicId: topicId,
            }))
          );
        }
      });
    }

    // ── handle skills ─────────────────────────────────────────────────
    if (payload.skillIds) {
      await db.transaction(async (tx) => {
        // Clear existing skills if updating
        if (isUpdate) {
          await tx.delete(projectSkills).where(eq(projectSkills.projectId, projectId));
        }

        // Insert new skills
        if (payload.skillIds!.length > 0) {
          await tx.insert(projectSkills).values(
            payload.skillIds!.map(skillId => ({
              projectId,
              skillId: skillId,
            }))
          );
        }
      });
    }

    // ── handle collaborators ──────────────────────────────────────────
    if (payload.collaboratorProfileIds) {
      await db.transaction(async (tx) => {
        // Clear existing collaborators if updating
        if (isUpdate) {
          await tx.delete(projectCollaborators).where(eq(projectCollaborators.projectId, projectId));
        }

        // Insert new collaborators
        if (payload.collaboratorProfileIds!.length > 0) {
          await tx.insert(projectCollaborators).values(
            payload.collaboratorProfileIds!.map(profileId => ({
              projectId,
              profileId,
            }))
          );
        }
      });
    }

    return { ok: true, projectId };
  } catch (error) {
    return { ok: false, error: (error as Error)?.message };
  }
};



// keep old exports alive so existing chat‑tool imports don't break
export const createProject = async (data: z.infer<typeof newProjectSchema>) =>
  upsertProject(data);
export const updateProject = async (payload: any) => upsertProject(payload);

export async function deleteProject(id: string) {
  const p = await db.delete(projects).where(eq(projects.id, id!)).returning();
  if (p.length === 0) {
    throw new Error("Error deleting page");
  }
}

export async function toggleProjectBookmark(projectId: string, bookmark: boolean) {
  const userProfileId = await requireProfile();
  if (bookmark) {
    await db
      .insert(projectBookmarks)
      .values({ projectId, profileId: userProfileId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(projectBookmarks)
      .where(
        and(
          eq(projectBookmarks.projectId, projectId),
          eq(projectBookmarks.profileId, userProfileId)
        )
      );
  }
}

export async function voteProject(projectId: string, value: number) {
  const userProfileId = await requireProfile();

  if (value === 0) {
    // Remove vote
    await db
      .delete(projectVotes)
      .where(and(eq(projectVotes.projectId, projectId), eq(projectVotes.profileId, userProfileId)));
  } else {
    // Upsert vote
    await db
      .insert(projectVotes)
      .values({ projectId, profileId: userProfileId, value })
      .onConflictDoUpdate({
        target: [projectVotes.profileId, projectVotes.projectId],
        set: { value },
      });
  }
}
