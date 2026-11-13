import { accounts, profile, users } from "@/db/schema";
import db from "@/lib/db";
import { eq, exists, inArray, or, type AnyColumn, type SQL } from "drizzle-orm";

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
