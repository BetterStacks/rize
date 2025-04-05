"use server";

import { profile, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GetProfileByUsername, profileSchema } from "@/lib/types";
import { eq, getTableColumns, ilike, or } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const validatedFields = profileSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.format() };
  }

  const { email, isOnboarded, ...profileData } = validatedFields.data;

  const userUpdates = { email, isOnboarded };
  const profileUpdates = profileData;
  console.log({ userUpdates, profileUpdates });
  if (userUpdates?.email || userUpdates?.isOnboarded) {
    await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, session?.user?.id));
  }
  await db
    .update(profile)
    .set(profileUpdates)
    .where(eq(profile.id, session?.user?.profileId));

  return { success: true, error: null };
}

export const getProfileById = async (id: string) => {
  const { ...rest } = getTableColumns(profile);
  const p = await db
    .select({
      ...rest,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.id, id))
    .limit(1);
  if (!p || p.length === 0) {
    throw new Error("Profile not found");
  }
  return p[0];
};

export const getProfileByUsername = async (username: string) => {
  const { ...rest } = getTableColumns(profile);
  const p = await db
    .select({
      ...rest,
      email: users.email,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.username, username))
    .limit(1);

  if (!p || p.length === 0) {
    throw new Error("Profile not found");
  }

  return p[0] as GetProfileByUsername;
};

export const createProfile = async (username: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("Session not found");
  }
  const p = await db
    .insert(profile)
    .values({
      userId: session?.user?.id,
      username: username,
    })
    .returning();
  if (p.length === 0) {
    throw new Error("Error creating profile");
  }

  return p[0];
};

export const isUsernameAvailable = async (username: string) => {
  // try {
  const [user] = await db
    .select()
    .from(profile)
    .where(eq(profile.username, username))
    .limit(1);

  return { available: !user };
};

export const searchProfiles = cache(async (query: string) => {
  const { ...rest } = getTableColumns(profile);
  return await db
    .select({ ...rest })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(
      or(ilike(profile.username, `%${query}%`), ilike(users.name, `%${query}%`))
    );
});

export const getProfileIdByUsername = async (username: string) => {
  const profileId = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.username, username));
  if (profileId.length === 0) {
    throw new Error("Profile not found");
  }
  return profileId[0];
};
export const getProfileByUserId = async (userId: string) => {
  const userProfile = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.userId, userId));
  if (userProfile.length === 0) {
    throw new Error("Profile not found");
  }
  return userProfile[0];
};
