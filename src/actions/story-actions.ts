'use server'

import { storyElements, profile } from '@/db/schema'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { cache } from 'react'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Validation schemas
const storyElementSchema = z.object({
  type: z.enum(['mission', 'value', 'milestone', 'dream', 'superpower']),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
  isPublic: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

const updateStoryElementSchema = storyElementSchema.partial().extend({
  id: z.string().uuid(),
})

// Get story elements for a profile by username
export const getStoryElementsByUsername = cache(async (username: string) => {
  try {
    const elements = await db
      .select({
        id: storyElements.id,
        profileId: storyElements.profileId,
        type: storyElements.type,
        title: storyElements.title,
        content: storyElements.content,
        order: storyElements.order,
        isPublic: storyElements.isPublic,
        createdAt: storyElements.createdAt,
        updatedAt: storyElements.updatedAt,
      })
      .from(storyElements)
      .innerJoin(profile, eq(profile.id, storyElements.profileId))
      .where(and(
        eq(profile.username, username.toLowerCase()),
        eq(storyElements.isPublic, true) // Only return public elements for public viewing
      ))
      .orderBy(asc(storyElements.order), asc(storyElements.createdAt))

    return { success: true, data: elements }
  } catch (error) {
    console.error('Error fetching story elements:', error)
    return { success: false, error: 'Failed to fetch story elements' }
  }
})

// Get all story elements for authenticated user (including private ones)
export const getMyStoryElements = cache(async () => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // First check if user has a profile
    const userProfile = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    if (!userProfile[0]) {
      // User doesn't have a profile yet, return empty array
      return { success: true, data: [] }
    }

    const elements = await db
      .select({
        id: storyElements.id,
        profileId: storyElements.profileId,
        type: storyElements.type,
        title: storyElements.title,
        content: storyElements.content,
        order: storyElements.order,
        isPublic: storyElements.isPublic,
        createdAt: storyElements.createdAt,
        updatedAt: storyElements.updatedAt,
      })
      .from(storyElements)
      .where(eq(storyElements.profileId, userProfile[0].id))
      .orderBy(asc(storyElements.order), asc(storyElements.createdAt))

    return { success: true, data: elements }
  } catch (error) {
    console.error('Error fetching my story elements:', error)
    return { success: false, error: 'Failed to fetch story elements' }
  }
})

// Create a new story element
export async function createStoryElement(data: z.infer<typeof storyElementSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    const validatedFields = storyElementSchema.safeParse(data)
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.format() }
    }

    // Get user's profile
    const userProfile = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    if (!userProfile[0]) {
      return { success: false, error: 'Profile not found' }
    }

    // Check if user already has this type of story element
    const existingElement = await db
      .select({ id: storyElements.id })
      .from(storyElements)
      .where(and(
        eq(storyElements.profileId, userProfile[0].id),
        eq(storyElements.type, validatedFields.data.type)
      ))
      .limit(1)

    if (existingElement[0]) {
      return { success: false, error: 'You already have a story element of this type' }
    }

    // Get the next order number
    const lastElement = await db
      .select({ order: storyElements.order })
      .from(storyElements)
      .where(eq(storyElements.profileId, userProfile[0].id))
      .orderBy(desc(storyElements.order))
      .limit(1)

    const nextOrder = lastElement[0]?.order !== undefined ? lastElement[0].order + 1 : 0

    // Create the story element
    const [newElement] = await db
      .insert(storyElements)
      .values({
        profileId: userProfile[0].id,
        type: validatedFields.data.type,
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        isPublic: validatedFields.data.isPublic,
        order: validatedFields.data.order ?? nextOrder,
      })
      .returning()

    // Revalidate profile page
    const profileData = await db
      .select({ username: profile.username })
      .from(profile)
      .where(eq(profile.id, userProfile[0].id))
      .limit(1)

    if (profileData[0]?.username) {
      revalidatePath(`/${profileData[0].username}`)
      revalidatePath('/settings/profile')
    }

    return { success: true, data: newElement }
  } catch (error) {
    console.error('Error creating story element:', error)
    return { success: false, error: 'Failed to create story element' }
  }
}

// Update a story element
export async function updateStoryElement(data: z.infer<typeof updateStoryElementSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    const validatedFields = updateStoryElementSchema.safeParse(data)
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.format() }
    }

    const { id, ...updateData } = validatedFields.data

    // Verify ownership
    const existingElement = await db
      .select({ 
        id: storyElements.id,
        profileId: storyElements.profileId 
      })
      .from(storyElements)
      .innerJoin(profile, eq(profile.id, storyElements.profileId))
      .where(and(
        eq(storyElements.id, id),
        eq(profile.userId, session.user.id)
      ))
      .limit(1)

    if (!existingElement[0]) {
      return { success: false, error: 'Story element not found or access denied' }
    }

    // Update the story element
    const [updatedElement] = await db
      .update(storyElements)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(storyElements.id, id))
      .returning()

    // Revalidate profile page
    const profileData = await db
      .select({ username: profile.username })
      .from(profile)
      .where(eq(profile.id, existingElement[0].profileId))
      .limit(1)

    if (profileData[0]?.username) {
      revalidatePath(`/${profileData[0].username}`)
      revalidatePath('/settings/profile')
    }

    return { success: true, data: updatedElement }
  } catch (error) {
    console.error('Error updating story element:', error)
    return { success: false, error: 'Failed to update story element' }
  }
}

// Delete a story element
export async function deleteStoryElement(elementId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify ownership
    const existingElement = await db
      .select({ 
        id: storyElements.id,
        profileId: storyElements.profileId,
        order: storyElements.order 
      })
      .from(storyElements)
      .innerJoin(profile, eq(profile.id, storyElements.profileId))
      .where(and(
        eq(storyElements.id, elementId),
        eq(profile.userId, session.user.id)
      ))
      .limit(1)

    if (!existingElement[0]) {
      return { success: false, error: 'Story element not found or access denied' }
    }

    // Delete the story element
    await db
      .delete(storyElements)
      .where(eq(storyElements.id, elementId))

    // Update order of remaining elements
    await db
      .update(storyElements)
      .set({
        order: sql`"order" - 1`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(storyElements.profileId, existingElement[0].profileId),
        sql`"order" > ${existingElement[0].order}`
      ))

    // Revalidate profile page
    const profileData = await db
      .select({ username: profile.username })
      .from(profile)
      .where(eq(profile.id, existingElement[0].profileId))
      .limit(1)

    if (profileData[0]?.username) {
      revalidatePath(`/${profileData[0].username}`)
      revalidatePath('/settings/profile')
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting story element:', error)
    return { success: false, error: 'Failed to delete story element' }
  }
}

// Reorder story elements
export async function reorderStoryElements(elementIds: string[]) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify all elements belong to the user
    const userElements = await db
      .select({ 
        id: storyElements.id,
        profileId: storyElements.profileId 
      })
      .from(storyElements)
      .innerJoin(profile, eq(profile.id, storyElements.profileId))
      .where(eq(profile.userId, session.user.id))

    const userElementIds = userElements.map(el => el.id)
    const hasUnauthorized = elementIds.some(id => !userElementIds.includes(id))
    
    if (hasUnauthorized) {
      return { success: false, error: 'Access denied to some elements' }
    }

    // Update order for each element
    const updatePromises = elementIds.map((id, index) => 
      db
        .update(storyElements)
        .set({ 
          order: index,
          updatedAt: new Date() 
        })
        .where(eq(storyElements.id, id))
    )

    await Promise.all(updatePromises)

    // Revalidate profile page
    if (userElements[0]?.profileId) {
      const profileData = await db
        .select({ username: profile.username })
        .from(profile)
        .where(eq(profile.id, userElements[0].profileId))
        .limit(1)

      if (profileData[0]?.username) {
        revalidatePath(`/${profileData[0].username}`)
        revalidatePath('/settings/profile')
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error reordering story elements:', error)
    return { success: false, error: 'Failed to reorder story elements' }
  }
}

// Toggle visibility of a story element
export async function toggleStoryElementVisibility(elementId: string, isPublic: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify ownership and update
    const result = await db
      .update(storyElements)
      .set({ 
        isPublic,
        updatedAt: new Date() 
      })
      .from(profile)
      .where(and(
        eq(storyElements.id, elementId),
        eq(storyElements.profileId, profile.id),
        eq(profile.userId, session.user.id)
      ))
      .returning({ profileId: storyElements.profileId })

    if (!result[0]) {
      return { success: false, error: 'Story element not found or access denied' }
    }

    // Revalidate profile page
    const profileData = await db
      .select({ username: profile.username })
      .from(profile)
      .where(eq(profile.id, result[0].profileId))
      .limit(1)

    if (profileData[0]?.username) {
      revalidatePath(`/${profileData[0].username}`)
      revalidatePath('/settings/profile')
    }

    return { success: true }
  } catch (error) {
    console.error('Error toggling story element visibility:', error)
    return { success: false, error: 'Failed to toggle visibility' }
  }
}