"use server";

import {
  gallery,
  galleryMedia,
  media,
  profile,
  profileSections,
  users,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GetProfileByUsername, profileSchema } from "@/lib/types";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  not,
  or,
  sql,
} from "drizzle-orm";
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
  
  // Update users table if there are user-related updates
  if (userUpdates?.email || userUpdates?.isOnboarded) {
    await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, session?.user?.id));
  }
  
  // Only update profile table if there are profile-related updates
  if (Object.keys(profileUpdates).length > 0) {
    await db
      .update(profile)
      .set(profileUpdates)
      .where(eq(profile.id, session?.user?.profileId));
  }

  return { success: true, error: null };
}

export const getProfileById = async (id: string) => {
  const { ...rest } = getTableColumns(profile);
  const p = await db
    .select({
      ...rest,
      image: users.image,
      name: users.name,
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

  // Check if user already has a profile
  const existingProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1);

  if (existingProfile.length > 0) {
    // User already has a profile, update the username instead of creating new
    const updatedProfile = await db
      .update(profile)
      .set({ username })
      .where(eq(profile.userId, session.user.id))
      .returning();
    
    if (updatedProfile.length === 0) {
      throw new Error("Error updating profile");
    }
    
    return updatedProfile[0];
  }

  // Create new profile if none exists
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
  const session = await auth();
  
  const [user] = await db
    .select()
    .from(profile)
    .where(eq(profile.username, username))
    .limit(1);

  // If no user found with this username, it's available
  if (!user) {
    return { available: true };
  }

  // If current user owns this username, it's available for them to keep
  if (session?.user?.profileId && user.id === session.user.profileId) {
    return { available: true };
  }

  // Username is taken by someone else
  return { available: false };
};

export const searchProfiles = async (query: string) => {
  // return await db
  //   .select({
  //     displayName: profile.displayName,
  //     username: profile.username,
  //     profileImage: profile.profileImage,
  //     image: users.image,
  //     name: users.name,
  //   })
  //   .from(profile)
  //   .innerJoin(users, eq(profile.userId, users.id))
  //   .where(
  //     or(ilike(profile.username, `%${query}%`), ilike(users.name, `%${query}%`))
  //   );

  return await db
    .select({
      displayName: profile.displayName,
      username: profile.username,
      profileImage: profile.profileImage,
      image: users.image,
      name: users.name,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))

    .where(
      sql`
      to_tsvector('english', 
        coalesce(${profile.username}, '') || ' ' || 
        coalesce(${profile.displayName}, '') || ' ' || 
        coalesce(${profile.bio}, '')
      ) @@ websearch_to_tsquery('english', ${query})
    `
    );
};

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

const sectionSchema = z.object({
  slug: z.string(),
  enabled: z.boolean(),
  order: z.number(),
});

export async function updateSectionsAction(
  sections: z.infer<typeof sectionSchema>[]
) {
  const session = await auth();
  if (!session) {
    throw new Error("Session not found");
  }
  const profileId = session.user.profileId;

  await Promise.all(
    sections.map((section, index) =>
      db
        .update(profileSections)
        .set({
          enabled: section.enabled,
          order: index, // index from array = new order
        })
        .where(
          and(
            eq(profileSections.profileId, profileId),
            eq(profileSections.slug, section.slug)
          )
        )
    )
  );
}

export const getRecentlyJoinedProfiles = async (limit: number = 5) => {
  return await db
    .select({
      displayName: profile.displayName,
      username: profile.username,
      profileImage: profile.profileImage,
      image: users.image,
      name: users.name,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .orderBy(desc(profile.createdAt))
    .limit(limit);
};

export const getRecentlyJoinedProfilesCached = cache(
  async (limit: number = 5) => {
    const session = await auth();

    return await db
      .select({
        displayName: profile.displayName,
        username: profile.username,
        profileImage: profile.profileImage,
        image: users.image,
        name: users.name,
      })
      .from(profile)
      .innerJoin(users, eq(profile.userId, users.id))
      .where(
        session ? not(eq(profile.username, session.user.username)) : undefined
      )
      .orderBy(desc(profile.createdAt))
      .limit(limit);
  }
);
