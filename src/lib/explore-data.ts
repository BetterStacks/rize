/*
 * Data loaders for the explore page and the search dialog.
 *
 * This is a plain server module, not a "use server" file, so nothing here is
 * callable from the browser. Server actions and server components import it.
 *
 * Every query is a single SQL statement: the database is far from the
 * functions (about 220ms per round trip), so the number of statements per
 * request matters far more than how long each one runs.
 */
import {
  bookmarks,
  comments,
  media,
  postLinks,
  postMedia,
  postVotes,
  posts,
  profile,
  users,
} from "@/db/schema";
import db from "@/lib/db";
import { profileHasContent, profileIdIsClaimed } from "@/lib/claimed-profiles";
import type { GetExplorePosts } from "@/lib/types";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/** Public lists on explore are cached for this long (seconds). */
export const EXPLORE_CACHE_SECONDS = 60;

/*
 * Per-post counts, first media and first link, as correlated subqueries.
 * The old feed query left-joined votes, comments, bookmarks and media in one
 * go, which multiplied the vote counts by the number of comments and
 * bookmarks and listed a post once per attached image.
 */
// Always "posts"."id", never a bare "id": drizzle drops the table name when a
// query reads from posts alone, and a bare "id" is ambiguous inside the
// subqueries below that join two tables.
const POST_ID = sql.raw('"posts"."id"');

export const postCardColumns = () => ({
  id: posts.id,
  content: posts.content,
  profileId: posts.profileId,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  username: profile.username,
  name: profile.displayName,
  avatar: profile.profileImage,
  upvoteCount: sql<number>`(SELECT count(*)::int FROM ${postVotes} WHERE ${postVotes.postId} = ${POST_ID} AND ${postVotes.value} = 1)`.as("upvoteCount"),
  downvoteCount: sql<number>`(SELECT count(*)::int FROM ${postVotes} WHERE ${postVotes.postId} = ${POST_ID} AND ${postVotes.value} = -1)`.as("downvoteCount"),
  commentCount: sql<number>`(SELECT count(*)::int FROM ${comments} WHERE ${comments.postId} = ${POST_ID})`.as("commentCount"),
  media: sql<GetExplorePosts["media"]>`(
    SELECT json_build_object('id', m.id, 'url', m.url, 'type', m.type, 'width', m.width, 'height', m.height)
    FROM ${postMedia} pm JOIN ${media} m ON m.id = pm."mediaId"
    WHERE pm."postId" = ${POST_ID}
    ORDER BY m.created_at, m.id
    LIMIT 1
  )`.as("media"),
  link: sql<GetExplorePosts["link"]>`(
    SELECT json_build_object('id', l.id, 'url', l.url, 'data', l.data, 'createdAt', l.created_at)
    FROM ${postLinks} l
    WHERE l."postId" = ${POST_ID}
    ORDER BY l.created_at, l.id
    LIMIT 1
  )`.as("link"),
});

/*
 * The signed-in viewer's own vote, comment and bookmark on each post, keyed
 * by their user id so we don't need the extra "load my profile" query first.
 */
export const viewerColumns = (viewerUserId: string | null | undefined) =>
  viewerUserId
    ? {
        userVote: sql<number | null>`(
          SELECT v.value FROM ${postVotes} v JOIN ${profile} vp ON vp.id = v.profile_id
          WHERE v.post_id = ${POST_ID} AND vp."userId" = ${viewerUserId} LIMIT 1
        )`.as("userVote"),
        commented: sql<boolean>`EXISTS (
          SELECT 1 FROM ${comments} c JOIN ${profile} cp ON cp.id = c.profile_id
          WHERE c.post_id = ${POST_ID} AND cp."userId" = ${viewerUserId}
        )`.as("commented"),
        bookmarked: sql<boolean>`EXISTS (
          SELECT 1 FROM ${bookmarks} b JOIN ${profile} bp ON bp.id = b.profile_id
          WHERE b.post_id = ${POST_ID} AND bp."userId" = ${viewerUserId}
        )`.as("bookmarked"),
      }
    : {
        userVote: sql<number | null>`NULL::int`.as("userVote"),
        commented: sql<boolean>`false`.as("commented"),
        bookmarked: sql<boolean>`false`.as("bookmarked"),
      };

/** Score used for the "trending" sort: net votes plus comments. */
export const postScore = (): SQL =>
  sql`((SELECT coalesce(sum(${postVotes.value}), 0) FROM ${postVotes} WHERE ${postVotes.postId} = ${POST_ID})
      + (SELECT count(*) FROM ${comments} WHERE ${comments.postId} = ${POST_ID}))`;

/* ------------------------------------------------------------------------ */
/* New faces                                                                */
/* ------------------------------------------------------------------------ */

export type NewFace = {
  displayName: string | null;
  username: string | null;
  profileImage: string | null;
  image: string | null;
  name: string | null;
  bio: string | null;
  location: string | null;
};

// Same filter as before (users.isClaimed = true), which is stricter than the
// general claimed-profile rule. Public data only: never add viewer filters
// inside a cached function.
const loadNewFaces = async (limit: number): Promise<NewFace[]> =>
  db
    .select({
      displayName: profile.displayName,
      username: profile.username,
      profileImage: profile.profileImage,
      image: users.image,
      name: users.name,
      bio: profile.bio,
      location: profile.location,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(and(eq(users.isClaimed, true), profileHasContent()))
    .orderBy(desc(profile.createdAt))
    .limit(limit);

const newFacesCached = unstable_cache(loadNewFaces, ["explore-new-faces-v2"], {
  revalidate: EXPLORE_CACHE_SECONDS,
  tags: ["explore"],
});

/** The newest claimed profiles. Cached for a minute, shared by everyone. */
export const getNewFaces = (limit: number = 8) =>
  newFacesCached(Math.min(Math.max(Math.trunc(limit) || 1, 1), 24));

/* ------------------------------------------------------------------------ */
/* Popular posts                                                            */
/* ------------------------------------------------------------------------ */

/*
 * Explore leaves out one-line test posts ("hello") so the page shows things
 * people meant to share. A post counts if it has a few sentences of text, an
 * image or a link. The posts stay on the author's profile either way.
 */
const MIN_TEXT_LENGTH = 60;
const postHasSubstance = (): SQL => sql`(
  length(trim(regexp_replace(coalesce(${posts.content}, ''), '<[^>]*>', '', 'g'))) >= ${MIN_TEXT_LENGTH}
  OR EXISTS (SELECT 1 FROM ${postMedia} pm WHERE pm."postId" = ${POST_ID})
  OR EXISTS (SELECT 1 FROM ${postLinks} pl WHERE pl."postId" = ${POST_ID})
)`;

const RECENT_WINDOW = 32; // the four 8-post pages the page used to load
const POPULAR_LIMIT = 20;

/*
 * Top posts by net votes among the most recent ones, in one statement. Viewer
 * fields are blank here; the browser fetches the viewer's own votes and
 * bookmarks separately so this list can be cached for everyone.
 */
const loadPopularPosts = async (): Promise<GetExplorePosts[]> => {
  const recent = db
    .select({ id: posts.id })
    .from(posts)
    .where(and(profileIdIsClaimed(posts.profileId), postHasSubstance()))
    .orderBy(desc(posts.createdAt))
    .limit(RECENT_WINDOW);

  const rows = await db
    .select({ ...postCardColumns(), ...viewerColumns(null) })
    .from(posts)
    .innerJoin(profile, eq(posts.profileId, profile.id))
    .where(inArray(posts.id, recent))
    .orderBy(
      desc(sql`(SELECT coalesce(sum(${postVotes.value}), 0) FROM ${postVotes} WHERE ${postVotes.postId} = ${POST_ID})`),
      desc(posts.createdAt),
    )
    .limit(POPULAR_LIMIT);

  return rows as unknown as GetExplorePosts[];
};

const popularPostsCached = unstable_cache(
  loadPopularPosts,
  ["explore-popular-posts-v2"],
  { revalidate: EXPLORE_CACHE_SECONDS, tags: ["explore"] },
);

export const getPopularPosts = () => popularPostsCached();

/* ------------------------------------------------------------------------ */
/* Viewer state for a set of posts                                          */
/* ------------------------------------------------------------------------ */

export type ViewerPostState = Record<
  string,
  { userVote: number | null; commented: boolean; bookmarked: boolean }
>;

/** One query: the viewer's vote, comment and bookmark on each given post. */
export const loadViewerPostState = async (
  viewerUserId: string,
  postIds: string[],
): Promise<ViewerPostState> => {
  if (postIds.length === 0) return {};
  const rows = await db
    .select({ id: posts.id, ...viewerColumns(viewerUserId) })
    .from(posts)
    .where(and(inArray(posts.id, postIds), profileIdIsClaimed(posts.profileId)));

  const state: ViewerPostState = {};
  for (const r of rows) {
    state[r.id] = {
      userVote: r.userVote ?? null,
      commented: Boolean(r.commented),
      bookmarked: Boolean(r.bookmarked),
    };
  }
  return state;
};
