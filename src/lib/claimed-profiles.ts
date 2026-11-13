import { profile, users } from "@/db/schema";
import db from "@/lib/db";
import { eq, inArray, or, type AnyColumn, type SQL } from "drizzle-orm";

/*
 * Profiles seeded from resumes belong to people who never signed up. Until
 * they claim the account (users.isClaimed = true) the profile is private:
 * it must not show up on any public page, list or search.
 */

const claimedUserIds = () =>
  db.select({ id: users.id }).from(users).where(eq(users.isClaimed, true));

const claimedProfileIds = () =>
  db
    .select({ id: profile.id })
    .from(profile)
    .innerJoin(users, eq(users.id, profile.userId))
    .where(eq(users.isClaimed, true));

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
