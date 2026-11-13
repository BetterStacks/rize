import {
  bookmarks,
  comments,
  postVotes,
  posts,
  profile,
  projectBookmarks,
  projectVotes,
  projects,
  voiceCalls,
  voiceDrafts,
} from "@/db/schema";
import { profileIdIsClaimed } from "@/lib/claimed-profiles";
import db from "@/lib/db";
import {
  and,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  ne,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";

/*
 * Notifications are built from activity that already exists: comments, upvotes
 * and saves on the signed-in person's own posts and projects, plus voice drafts
 * and call suggestions waiting for review. There is no notifications table.
 *
 * Nothing here is about who looked at you. Upvotes and saves are shown as
 * counts only, never names. Activity from your own profile, downvotes and
 * activity from unclaimed (seeded) profiles are left out.
 *
 * The page and the unread badge use the same filters (below), so opening the
 * page always clears the badge.
 */

const WINDOW_DAYS = 90;
const PER_SOURCE_LIMIT = 40;
export const NOTIFICATIONS_LIMIT = 80;

export type NotificationItem =
  | {
    kind: "comment";
    id: string;
    at: Date;
    href: string;
    actor: { name: string; username: string | null; image: string | null };
    comment: string;
    target: string;
  }
  | {
    kind: "post-upvotes" | "project-upvotes" | "post-saves" | "project-saves";
    id: string;
    at: Date;
    href: string;
    count: number;
    target: string;
  }
  | { kind: "voice-drafts"; id: string; at: Date; href: string; count: number }
  | { kind: "voice-suggestions"; id: string; at: Date; href: string };

type Owner = { profileId: string; userId: string };

const since = () => new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

// Activity on something the owner made, by someone else with a claimed profile.
const othersActivity = (
  ownerCol: AnyColumn,
  actorCol: AnyColumn,
  createdCol: AnyColumn,
  owner: Owner,
  extra?: SQL,
) =>
  and(
    eq(ownerCol, owner.profileId),
    ne(actorCol, owner.profileId),
    gte(createdCol, since()),
    profileIdIsClaimed(actorCol),
    extra,
  );

const where = {
  comments: (o: Owner) =>
    othersActivity(posts.profileId, comments.profileId, comments.createdAt, o),
  postUpvotes: (o: Owner) =>
    othersActivity(posts.profileId, postVotes.profileId, postVotes.createdAt, o, eq(postVotes.value, 1)),
  projectUpvotes: (o: Owner) =>
    othersActivity(projects.profileId, projectVotes.profileId, projectVotes.createdAt, o, eq(projectVotes.value, 1)),
  postSaves: (o: Owner) =>
    othersActivity(posts.profileId, bookmarks.profileId, bookmarks.createdAt, o),
  projectSaves: (o: Owner) =>
    othersActivity(projects.profileId, projectBookmarks.profileId, projectBookmarks.createdAt, o),
  voiceDrafts: (o: Owner) =>
    and(eq(voiceDrafts.profileId, o.profileId), eq(voiceDrafts.status, "draft")),
  voiceSuggestions: (o: Owner) =>
    and(
      eq(voiceCalls.userId, o.userId),
      eq(voiceCalls.kind, "onboarding"),
      isNotNull(voiceCalls.profileSuggestions),
      isNull(voiceCalls.suggestionsReviewedAt),
    ),
};

const dayOf = (col: AnyColumn) => sql<string>`to_char(${col}, 'YYYY-MM-DD')`;
const latestOf = (col: AnyColumn) => sql`max(${col})`.mapWith(col);

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** Plain one-line snippet of user HTML, for display as React text. */
export const snippet = (html: string | null | undefined, max = 90): string => {
  const text = (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

export async function loadNotifications(owner: Owner): Promise<NotificationItem[]> {
  const [
    commentRows,
    postUpvoteRows,
    projectUpvoteRows,
    postSaveRows,
    projectSaveRows,
    [drafts],
    [suggestions],
  ] = await Promise.all([
    db
      .select({
        id: comments.id,
        content: comments.content,
        at: comments.createdAt,
        postId: posts.id,
        postContent: posts.content,
        name: profile.displayName,
        username: profile.username,
        image: profile.profileImage,
      })
      .from(comments)
      .innerJoin(posts, eq(posts.id, comments.postId))
      .innerJoin(profile, eq(profile.id, comments.profileId))
      .where(where.comments(owner))
      .orderBy(desc(comments.createdAt))
      .limit(PER_SOURCE_LIMIT),
    db
      .select({
        targetId: posts.id,
        target: posts.content,
        day: dayOf(postVotes.createdAt),
        count: count(),
        at: latestOf(postVotes.createdAt),
      })
      .from(postVotes)
      .innerJoin(posts, eq(posts.id, postVotes.postId))
      .where(where.postUpvotes(owner))
      .groupBy(posts.id, posts.content, dayOf(postVotes.createdAt))
      .orderBy(desc(latestOf(postVotes.createdAt)))
      .limit(PER_SOURCE_LIMIT),
    db
      .select({
        targetId: projects.id,
        target: projects.name,
        day: dayOf(projectVotes.createdAt),
        count: count(),
        at: latestOf(projectVotes.createdAt),
      })
      .from(projectVotes)
      .innerJoin(projects, eq(projects.id, projectVotes.projectId))
      .where(where.projectUpvotes(owner))
      .groupBy(projects.id, projects.name, dayOf(projectVotes.createdAt))
      .orderBy(desc(latestOf(projectVotes.createdAt)))
      .limit(PER_SOURCE_LIMIT),
    db
      .select({
        targetId: posts.id,
        target: posts.content,
        day: dayOf(bookmarks.createdAt),
        count: count(),
        at: latestOf(bookmarks.createdAt),
      })
      .from(bookmarks)
      .innerJoin(posts, eq(posts.id, bookmarks.postId))
      .where(where.postSaves(owner))
      .groupBy(posts.id, posts.content, dayOf(bookmarks.createdAt))
      .orderBy(desc(latestOf(bookmarks.createdAt)))
      .limit(PER_SOURCE_LIMIT),
    db
      .select({
        targetId: projects.id,
        target: projects.name,
        day: dayOf(projectBookmarks.createdAt),
        count: count(),
        at: latestOf(projectBookmarks.createdAt),
      })
      .from(projectBookmarks)
      .innerJoin(projects, eq(projects.id, projectBookmarks.projectId))
      .where(where.projectSaves(owner))
      .groupBy(projects.id, projects.name, dayOf(projectBookmarks.createdAt))
      .orderBy(desc(latestOf(projectBookmarks.createdAt)))
      .limit(PER_SOURCE_LIMIT),
    db
      .select({ count: count(), at: latestOf(voiceDrafts.createdAt) })
      .from(voiceDrafts)
      .where(where.voiceDrafts(owner)),
    db
      .select({ id: voiceCalls.id, at: voiceCalls.createdAt })
      .from(voiceCalls)
      .where(where.voiceSuggestions(owner))
      .orderBy(desc(voiceCalls.createdAt))
      .limit(1),
  ]);

  const items: NotificationItem[] = [];

  for (const row of commentRows) {
    items.push({
      kind: "comment",
      id: `comment:${row.id}`,
      at: row.at,
      href: `/post/${row.postId}`,
      actor: {
        name: row.name?.trim() || row.username || "Someone",
        username: row.username,
        image: row.image,
      },
      comment: snippet(row.content, 140),
      target: snippet(row.postContent, 60),
    });
  }

  const grouped = (
    rows: { targetId: string; target: string | null; day: string; count: number; at: unknown }[],
    kind: "post-upvotes" | "project-upvotes" | "post-saves" | "project-saves",
    hrefBase: "/post/" | "/project/",
  ) => {
    for (const row of rows) {
      if (!(row.at instanceof Date)) continue;
      items.push({
        kind,
        id: `${kind}:${row.targetId}:${row.day}`,
        at: row.at,
        href: `${hrefBase}${row.targetId}`,
        count: row.count,
        target: hrefBase === "/post/" ? snippet(row.target, 60) : (row.target ?? "").trim(),
      });
    }
  };

  grouped(postUpvoteRows, "post-upvotes", "/post/");
  grouped(projectUpvoteRows, "project-upvotes", "/project/");
  grouped(postSaveRows, "post-saves", "/post/");
  grouped(projectSaveRows, "project-saves", "/project/");

  if (drafts && drafts.count > 0 && drafts.at instanceof Date) {
    items.push({
      kind: "voice-drafts",
      id: "voice-drafts",
      at: drafts.at,
      href: "/settings/voice",
      count: drafts.count,
    });
  }

  if (suggestions) {
    items.push({
      kind: "voice-suggestions",
      id: `voice-suggestions:${suggestions.id}`,
      at: suggestions.at,
      href: "/settings/voice",
    });
  }

  return items
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, NOTIFICATIONS_LIMIT);
}

/**
 * When the newest notification happened, for the unread dot. Same filters as
 * loadNotifications, but one max() per source.
 */
export async function latestNotificationAt(owner: Owner): Promise<Date | null> {
  const results = await Promise.all([
    db
      .select({ at: latestOf(comments.createdAt) })
      .from(comments)
      .innerJoin(posts, eq(posts.id, comments.postId))
      .where(where.comments(owner)),
    db
      .select({ at: latestOf(postVotes.createdAt) })
      .from(postVotes)
      .innerJoin(posts, eq(posts.id, postVotes.postId))
      .where(where.postUpvotes(owner)),
    db
      .select({ at: latestOf(projectVotes.createdAt) })
      .from(projectVotes)
      .innerJoin(projects, eq(projects.id, projectVotes.projectId))
      .where(where.projectUpvotes(owner)),
    db
      .select({ at: latestOf(bookmarks.createdAt) })
      .from(bookmarks)
      .innerJoin(posts, eq(posts.id, bookmarks.postId))
      .where(where.postSaves(owner)),
    db
      .select({ at: latestOf(projectBookmarks.createdAt) })
      .from(projectBookmarks)
      .innerJoin(projects, eq(projects.id, projectBookmarks.projectId))
      .where(where.projectSaves(owner)),
    db
      .select({ at: latestOf(voiceDrafts.createdAt) })
      .from(voiceDrafts)
      .where(where.voiceDrafts(owner)),
    db
      .select({ at: latestOf(voiceCalls.createdAt) })
      .from(voiceCalls)
      .where(where.voiceSuggestions(owner)),
  ]);

  let latest: Date | null = null;
  for (const [row] of results) {
    const at = row?.at;
    if (at instanceof Date && !Number.isNaN(at.getTime()) && (!latest || at > latest)) {
      latest = at;
    }
  }
  return latest;
}
