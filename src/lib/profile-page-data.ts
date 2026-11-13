import {
  certificates,
  education,
  experience,
  gallery,
  galleryMedia,
  media,
  page,
  posts,
  profile,
  projects,
  sections,
  socialLinks,
  storyElements,
  users,
} from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { profileIsClaimedOrOwnedBy } from "@/lib/claimed-profiles";
import db from "@/lib/db";
import {
  profileSkillsJson,
  selectProfilePosts,
  selectProfileProjects,
} from "@/lib/profile-queries";
import type {
  GalleryItemProps,
  GetAllProjects,
  GetAllWritings,
  GetExplorePosts,
  GetProfileByUsername,
  TCertificate,
  TEducation,
  TExperience,
  TSocialLink,
  TStoryElement,
} from "@/lib/types";
import { findPendingOnboardingSuggestions } from "@/lib/voice/pending-suggestions";
import {
  and,
  eq,
  getTableColumns,
  inArray,

  sql,
  type SQL,
} from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { cache } from "react";

/*
 * Everything the public profile page needs, loaded on the server in as few
 * database round trips as possible.
 *
 * Server-only: this module is imported by server components and must never
 * be turned into a "use server" file (that would expose it to the browser).
 *
 * Round trips: the viewer's session (better-auth lookup + profile enrichment,
 * shared with generateMetadata through `cache`), then one parallel batch:
 *   1. the profile row, with its sections folded in as JSON sub-selects
 *   2. posts
 *   3. projects
 *   4. pending call suggestions (only for the owner after an onboarding call)
 *
 * Privacy filters kept from the original per-section actions:
 * - the profile is visible when claimed, or to its own owner
 *   (`profileIsClaimedOrOwnedBy`); every section hangs off that row
 * - the account email is only returned to the owner
 * - draft pages only for the owner; story elements only when public
 * - gallery capped at 10, posts at 4 (same ordering), project collaborators
 *   only when claimed (inside selectProfileProjects)
 */

/** The viewer's session, fetched once per request. */
export const getViewerSession = cache(() =>
  getServerSession().catch(() => null),
);

type Columns = Record<string, { name: string; dataType: string }>;

/** json_build_object('camelKey', table.column, ...) for every column of a table. */
const jsonRow = (table: PgTable, omit: string[] = []) => {
  const cols = getTableColumns(table) as unknown as Record<string, SQL.Aliased | object>;
  return sql.join(
    Object.entries(cols).filter(([key]) => !omit.includes(key)).map(
      ([key, col]) => sql`${sql.raw(`'${key}'`)}, ${col}`,
    ),
    sql`, `,
  );
};

/**
 * JSON gives timestamps back as strings. Turn the columns drizzle would have
 * returned as Date back into Date (timestamps without zone are stored in UTC,
 * which is how drizzle reads them too).
 */
const reviveDates = <T>(table: PgTable, rows: unknown): T[] => {
  if (!Array.isArray(rows)) return [];
  const dateKeys = Object.entries(getTableColumns(table) as unknown as Columns)
    .filter(([, col]) => col.dataType === "date")
    .map(([key]) => key);
  return rows.map((row: Record<string, unknown>) => {
    const out = { ...row };
    for (const key of dateKeys) {
      const value = out[key];
      if (typeof value === "string") {
        const hasZone = /([zZ]|[+-]\d\d(:?\d\d)?)$/.test(value);
        out[key] = new Date(hasZone ? value : `${value}Z`);
      }
    }
    return out as T;
  });
};

const jsonList = (inner: SQL) => sql`(SELECT COALESCE(json_agg(t.j), '[]'::json) FROM (${inner}) t)`;

type Viewer = { userId?: string; profileId?: string };

/** The profile row with every flat section folded in. Exported for SQL inspection. */
export const profileRowQuery = (username: string, viewer: Viewer) => {
  const { ...rest } = getTableColumns(profile);
  const viewerProfileId = viewer.profileId ?? null;

  return db
    .select({
      ...rest,
      email: users.email,
      image: users.image,
      name: users.name,
      skills: profileSkillsJson().as("skills"),
      educationRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(education)}) AS j FROM ${education} WHERE ${education.profileId} = ${profile.id}`,
      ).as("educationRows"),
      experienceRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(experience)}) AS j FROM ${experience} WHERE ${experience.profileId} = ${profile.id}`,
      ).as("experienceRows"),
      certificateRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(certificates)}) AS j FROM ${certificates} WHERE ${certificates.profileId} = ${profile.id}`,
      ).as("certificateRows"),
      socialLinkRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(socialLinks)}) AS j FROM ${socialLinks} WHERE ${socialLinks.profileId} = ${profile.id}`,
      ).as("socialLinkRows"),
      sectionRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(sections)}) AS j FROM ${sections} WHERE ${sections.profileId} = ${profile.id} ORDER BY ${sections.order}`,
      ).as("sectionRows"),
      storyRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(storyElements)}) AS j FROM ${storyElements} WHERE ${storyElements.profileId} = ${profile.id} AND ${storyElements.isPublic} = true ORDER BY ${storyElements.order} ASC, ${storyElements.createdAt} ASC`,
      ).as("storyRows"),
      galleryRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(media)}, 'galleryMediaId', ${galleryMedia.id}) AS j FROM ${gallery} INNER JOIN ${galleryMedia} ON ${gallery.id} = ${galleryMedia.galleryId} INNER JOIN ${media} ON ${galleryMedia.mediaId} = ${media.id} WHERE ${gallery.profileId} = ${profile.id} LIMIT 10`,
      ).as("galleryRows"),
      // Drafts only for the owner (same rule as getAllPages).
      pageRows: jsonList(
        sql`SELECT json_build_object(${jsonRow(page, ["thumbnail"])}, 'thumbnail', ${media.url}, 'avatar', ${profile.profileImage}) AS j FROM ${page} LEFT JOIN ${media} ON ${media.id} = ${page.thumbnail} WHERE ${page.profileId} = ${profile.id} AND (${page.status} = 'published' OR ${page.profileId} = ${viewerProfileId})`,
      ).as("pageRows"),
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(
      and(
        eq(profile.username, username),
        profileIsClaimedOrOwnedBy(viewer.userId),
      ),
    )
    .limit(1);
};

const queryProfile = async (username: string, viewer: Viewer) => {
  const rows = await profileRowQuery(username, viewer);
  const row = rows[0];
  if (!row) return null;

  const {
    educationRows,
    experienceRows,
    certificateRows,
    socialLinkRows,
    sectionRows,
    storyRows,
    galleryRows,
    pageRows,
    ...profileRow
  } = row;

  // The account email (for phone sign-ups it contains the phone number) is
  // only returned to the profile's owner.
  const isOwner = !!viewer.userId && viewer.userId === profileRow.userId;
  const user = {
    ...profileRow,
    email: isOwner ? profileRow.email : null,
  } as unknown as NonNullable<GetProfileByUsername>;

  return {
    user,
    education: reviveDates<TEducation>(education, educationRows),
    workExperience: reviveDates<TExperience>(experience, experienceRows),
    certificates: reviveDates<TCertificate>(certificates, certificateRows),
    socialLinks: reviveDates<TSocialLink>(socialLinks, socialLinkRows),
    sections: reviveDates<typeof sections.$inferSelect>(sections, sectionRows),
    storyElements: reviveDates<TStoryElement>(storyElements, storyRows),
    gallery: reviveDates<GalleryItemProps>(media, galleryRows),
    writings: reviveDates<GetAllWritings>(page, pageRows).map((p) => ({
      ...p,
      // Matches what the page passed before: the card avatar is the thumbnail.
      avatar: p.thumbnail || "",
    })),
  };
};

/** Profile ids for `username` that this viewer may see (claimed, or their own). */
const visibleProfileIds = (username: string, viewerUserId?: string) =>
  db
    .select({ id: profile.id })
    .from(profile)
    .where(
      and(
        eq(profile.username, username),
        profileIsClaimedOrOwnedBy(viewerUserId),
      ),
    );

export const loadProfilePage = cache(async (rawUsername: string) => {
  const username = rawUsername.toLowerCase();
  const session = await getViewerSession();
  const viewer = {
    userId: session?.user?.id,
    profileId: session?.user?.profileId,
  };
  const isOwnUsername =
    !!session?.user?.username && session.user.username === username;

  const [data, postRows, projectRows, hasCallSuggestions] = await Promise.all([
    queryProfile(username, viewer),
    selectProfilePosts(
      inArray(posts.profileId, visibleProfileIds(username, viewer.userId)),
      viewer.profileId ?? null,
    ),
    selectProfileProjects(
      inArray(projects.profileId, visibleProfileIds(username, viewer.userId)),
      viewer.profileId ?? null,
    ),
    // After an onboarding call, point the person to the suggestions waiting for review.
    isOwnUsername && session?.user?.onboardingCallId
      ? findPendingOnboardingSuggestions(session.user.id).then((s) => !!s)
      : Promise.resolve(false),
  ]);

  if (!data) return null;

  const isMine = data.user.username === session?.user?.username;

  return {
    ...data,
    session,
    isMine,
    hasCallSuggestions: isMine && hasCallSuggestions,
    posts: postRows as unknown as GetExplorePosts[],
    projects: projectRows as unknown as GetAllProjects[],
  };
});

export type ProfilePageData = NonNullable<
  Awaited<ReturnType<typeof loadProfilePage>>
>;

