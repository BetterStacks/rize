'use server'

import {
  profile,
  profileSections,
  users,
  accounts,
} from '@/db/schema'
import { requireAuth, requireAuthWithProfile, requireProfile } from '@/lib/auth'
import db from '@/lib/db'
import { GetProfileByUsername, profileSchema } from '@/lib/types'
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  not,
  // or,
  sql,
} from 'drizzle-orm'
import { cache } from 'react'
import { z } from 'zod'

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  try {
    const { session, profileId, userId } = await requireAuthWithProfile()

    const validatedFields = profileSchema.safeParse(data)
    if (!validatedFields.success) {
      return { success: false, error: 'Invalid profile data' }
    }

    const { email, isOnboarded, ...profileData } = validatedFields.data
    const userUpdates = { email, isOnboarded }
    
    // Update users table if there are user-related updates
    if (userUpdates?.email || userUpdates?.isOnboarded !== undefined) {
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, userId))
    }
    
    // Update profile table if there are profile-related updates
    if (Object.keys(profileData).length > 0) {
      await db
        .update(profile)
        .set(profileData)
        .where(eq(profile.id, profileId))
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' }
  }
}

export const getProfileById = async (id: string) => {
  const { ...rest } = getTableColumns(profile)
  const p = await db
    .select({
      ...rest,
      image: users.image,
      name: users.name,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.id, id))
    .limit(1)
  if (!p || p.length === 0) {
    throw new Error('Profile not found')
  }
  return p[0]
}

export const getProfileByUsername = async (username: string) => {
  const { ...rest } = getTableColumns(profile)
  const p = await db
    .select({
      ...rest,
      email: users.email,
    })
    .from(profile)
    .innerJoin(users, eq(profile.userId, users.id))
    .where(eq(profile.username, username.toLowerCase()))
    .limit(1)

  if (!p || p.length === 0) {
    return null
  }

  return p[0] as GetProfileByUsername
}

export const createProfile = async (username: string) => {
  const session = await requireAuth()

  // Check if user already has a profile
  const existingProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1)

  if (existingProfile.length > 0) {
    // User already has a profile, update the username instead of creating new
    const updatedProfile = await db
      .update(profile)
      .set({ username: username.toLowerCase() })
      .where(eq(profile.userId, session.user.id))
      .returning()
    
    if (updatedProfile.length === 0) {
      throw new Error('Error updating profile')
    }
    
    return updatedProfile[0]
  }

  // Create new profile if none exists
  const p = await db
    .insert(profile)
    .values({
      userId: session.user.id,
      username: username.toLowerCase(),
    })
    .returning()
  if (p.length === 0) {
    throw new Error('Error creating profile')
  }

  return p[0]
}

export const isUsernameAvailable = async (username: string) => {
  // Public endpoint - no authentication required
  const [user] = await db
    .select()
    .from(profile)
    .where(eq(profile.username, username.toLowerCase()))
    .limit(1)

  // If no user found with this username, it's available
  if (!user) {
    return { available: true }
  }

  // Username is taken by someone else
  return { available: false }
}

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
    )
}

export const getProfileIdByUsername = async (username: string) => {
  const profileId = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.username, username.toLowerCase()))
  if (profileId.length === 0) {
    throw new Error('Profile not found')
  }
  return profileId[0]
}
export const getProfileByUserId = async (userId: string) => {
  const userProfile = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.userId, userId))
  if (userProfile.length === 0) {
    throw new Error('Profile not found')
  }
  return userProfile[0]
}

export const getCurrentUserProfile = async () => {
  const session = await requireAuth()
  const { ...rest } = getTableColumns(profile)
  
  const userProfile = await db
    .select({
      ...rest,
      email: users.email,
      image: users.image,
      name: users.name,
      isOnboarded: users.isOnboarded,
      letrazId: users.letrazId,
    })
    .from(users)
    .leftJoin(profile, eq(profile.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!userProfile || userProfile.length === 0) {
    return null
  }

  const base = userProfile[0]

  // Determine auth method from connected accounts; fallback to 'email'
  let authMethod: 'google' | 'github' | 'linkedin' | 'email' = 'email'
  try {
    const userAccounts = await db
      .select({ providerId: accounts.providerId })
      .from(accounts)
      .where(eq(accounts.userId, session.user.id))

    const providers = userAccounts.map(a => a.providerId)
    if (providers.includes('google')) authMethod = 'google'
    else if (providers.includes('github')) authMethod = 'github'
    else if (providers.includes('linkedin')) authMethod = 'linkedin'
  } catch (e) {
    // ignore
  }

  return { ...base, authMethod }
}

const sectionSchema = z.object({
  slug: z.string(),
  enabled: z.boolean(),
  order: z.number(),
})

export async function updateSectionsAction(
  sections: z.infer<typeof sectionSchema>[]
) {
  const profileId = await requireProfile()

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
  )
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
    .limit(limit)
}

export const getRecentlyJoinedProfilesCached = cache(
  async (limit: number = 5) => {
    const session = await requireAuth()

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
        session && session.user.username 
          ? not(eq(profile.username, session.user.username)) 
          : undefined
      )
      .orderBy(desc(profile.createdAt))
      .limit(limit)
  }
)
