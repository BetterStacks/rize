import {
  accounts,
  education,
  experience,
  gallery,
  page,
  posts,
  profile,
  projects,
  socialLinks,
  users,
} from "@/db/schema";
import db from "@/lib/db";
import { eq, exists, inArray, or, sql, type AnyColumn, type SQL } from "drizzle-orm";

/*
 * Profiles seeded from resumes belong to people who never signed up. Until
 * they claim the account (users.isClaimed = true) the profile is private:
 * it must not show up on any public page, list or search.
 */

// An account counts as claimed when it's marked claimed or when the person has
// ever signed in (has an auth account row). The second part keeps people who
// signed in before isClaimed was kept up to date visible.
const isClaimedUser = (): SQL =>
  or(
    eq(users.isClaimed, true),
    exists(db.select({ one: accounts.id }).from(accounts).where(eq(accounts.userId, users.id)))
  )!;

const claimedUserIds = () =>
  db.select({ id: users.id }).from(users).where(isClaimedUser());

const claimedProfileIds = () =>
  db
    .select({ id: profile.id })
    .from(profile)
    .innerJoin(users, eq(users.id, profile.userId))
    .where(isClaimedUser());

/** For queries that select from `profile`: keep only claimed accounts. */
export const profileIsClaimed = (): SQL =>
  inArray(profile.userId, claimedUserIds());

/**
 * For queries on tables keyed by a profile id (posts, projects, pages,
 * education, experience, ...): keep only rows owned by claimed accounts.
 */
export const profileIdIsClaimed = (profileIdColumn: AnyColumn): SQL =>
  inArray(profileIdColumn, claimedProfileIds());

/** Claimed accounts, plus the signed-in user's own profile. */
export const profileIsClaimedOrOwnedBy = (
  viewerUserId: string | null | undefined,
): SQL =>
  viewerUserId
    ? or(profileIsClaimed(), eq(profile.userId, viewerUserId))!
    : profileIsClaimed();

/**
 * For discovery lists (new faces, recently joined, people on explore): only
 * profiles with something on them, so visitors don't land on an empty page.
 * The profile itself stays reachable by its link and by search.
 */
export const profileHasContent = (): SQL =>
  or(
    sql`coalesce(trim(${profile.bio}), '') <> ''`,
    exists(db.select({ one: posts.id }).from(posts).where(eq(posts.profileId, profile.id))),
    exists(db.select({ one: projects.id }).from(projects).where(eq(projects.profileId, profile.id))),
    exists(db.select({ one: page.id }).from(page).where(eq(page.profileId, profile.id))),
    exists(db.select({ one: gallery.id }).from(gallery).where(eq(gallery.profileId, profile.id))),
    exists(db.select({ one: experience.id }).from(experience).where(eq(experience.profileId, profile.id))),
    exists(db.select({ one: education.id }).from(education).where(eq(education.profileId, profile.id))),
    exists(db.select({ one: socialLinks.id }).from(socialLinks).where(eq(socialLinks.profileId, profile.id))),
  )!;
