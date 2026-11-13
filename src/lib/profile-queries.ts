import {
  bookmarks,
  comments,
  media,
  postLinks,
  postMedia,
  postVotes,
  posts,
  profile,
  projects,
} from "@/db/schema";
import db from "@/lib/db";
import { eq, getTableColumns, sql, type SQL } from "drizzle-orm";

/*
 * Query builders shared by the server actions and the profile page loader.
 * This module is deliberately NOT a "use server" file: nothing here may be
 * callable from the browser. Callers pass the `where` that scopes the rows,
 * so they carry the claimed-profile filter themselves.
 */

/** Skills of the outer `profile` row, as a JSON array (or NULL). */
export const profileSkillsJson = () =>
  sql`
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE json_agg(json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ))
            END
          FROM profile_skills ps
          JOIN skills s ON ps.skill_id = s.id
          WHERE ps.profile_id = profile.id
        )
      `;

/** The four most engaged posts matching `where`, with the viewer's vote/bookmark state. */
export const selectProfilePosts = (
  where: SQL,
  viewerProfileId: string | null | undefined,
) => {
  const { ...rest } = getTableColumns(posts);
  return db
    .select({
      ...rest,
      username: profile.username,
      name: profile.displayName,
      avatar: profile.profileImage,
      upvoteCount: sql<number>`COALESCE(SUM(CASE WHEN ${postVotes.value} = 1 THEN 1 ELSE 0 END), 0)`.as("upvoteCount"),
      downvoteCount: sql<number>`COALESCE(SUM(CASE WHEN ${postVotes.value} = -1 THEN 1 ELSE 0 END), 0)`.as("downvoteCount"),
      commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`.as("commentCount"),
      userVote:
        viewerProfileId
          ? sql<number | null>`MAX(CASE WHEN ${postVotes.profileId} = ${viewerProfileId} THEN ${postVotes.value} ELSE NULL END)`.as("userVote")
          : sql<number | null>`NULL`.as("userVote"),

      commented:
        viewerProfileId
          ? sql<boolean>`COALESCE(BOOL_OR(comments.profile_id = ${viewerProfileId}), false)`.as(
            "commented"
          )
          : sql<boolean>`false`.as("commented"),
      bookmarked:
        viewerProfileId
          ? sql<boolean>`COALESCE(bool_or(${bookmarks.profileId} = ${viewerProfileId}), false)`.as("bookmarked")
          : sql<boolean>`false`.as("bookmarked"),
      media: sql`
      CASE 
        WHEN media.id IS NOT NULL THEN json_build_object(
          'id', media.id,
          'url', media.url,
          'type', media.type,
          'width', media.width,
          'height', media.height
        )
        ELSE NULL
      END
    `.as("media"),

      link: sql`
      CASE 
        WHEN post_links.id IS NOT NULL THEN json_build_object(
          'id', post_links.id,
          'url', post_links.url,
          'data', post_links.data,
          'createdAt', post_links.created_at
        )
        ELSE NULL
      END
    `.as("link"),
    })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .leftJoin(postMedia, eq(posts.id, postMedia.postId))
    .leftJoin(postVotes, eq(posts.id, postVotes.postId))
    .leftJoin(comments, eq(posts.id, comments.postId))
    .leftJoin(media, eq(postMedia.mediaId, media.id))
    .leftJoin(postLinks, eq(posts.id, postLinks.postId))
    .leftJoin(bookmarks, eq(posts.id, bookmarks.postId))
    .where(where)
    .groupBy(
      posts.id,
      profile.username,
      profile.displayName,
      profile.profileImage,
      media.id,
      postLinks.id
    )
    .orderBy(
      sql`COUNT(DISTINCT ${comments.id}) + SUM(CASE WHEN ${postVotes.value} = 1 THEN 1 WHEN ${postVotes.value} = -1 THEN -1 ELSE 0 END) DESC`
    )
    .limit(4);
};

/** All projects matching `where`, with the viewer's vote/bookmark state. */
export const selectProfileProjects = (
  where: SQL,
  viewerProfileId: string | null | undefined,
) => {
  const { ...rest } = getTableColumns(projects);
  return db
    .select({
      ...rest,
      logo: media.url,
      upvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("upvoteCount"),
      downvoteCount: sql<number>`(SELECT COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) FROM project_votes WHERE project_id = ${projects.id} )`.as("downvoteCount"),
      userVote: viewerProfileId
        ? sql<number | null>`(SELECT value FROM project_votes WHERE project_id = ${projects.id} AND profile_id = ${viewerProfileId} LIMIT 1)`.as("userVote")
        : sql<number | null>`NULL`.as("userVote"),
      bookmarked: viewerProfileId
        ? sql<boolean>`EXISTS (SELECT 1 FROM project_bookmarks WHERE project_id = ${projects.id} AND profile_id = ${viewerProfileId})`.as("bookmarked")
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
          JOIN "user" u ON u.id = p."userId"
          WHERE pc.project_id = projects.id
            AND u.is_claimed = true
        )
      `.as("collaborators"),
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.logo))
    .where(where);
};
