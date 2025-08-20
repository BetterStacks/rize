'use server'

import { initialValue } from '@/components/editor/utils'
import { media, page, profile } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { TPage, TUploadFilesResponse } from '@/lib/types'
import { and, eq, getTableColumns } from 'drizzle-orm'
import { getProfileIdByUsername } from './profile-actions'

export const createPage = async (title?: string) => {
  try {
    const session = await getServerSession()
    if (!session?.user?.profileId) {
      throw new Error('Authentication required')
    }

    // Generate a more interesting default title
    const defaultTitles = [
      'My New Story',
      'Untitled Thoughts', 
      'Fresh Ideas',
      'New Chapter',
      'Today\'s Thoughts',
      'My Latest Project',
      'Work in Progress'
    ]
    
    const randomTitle = title || defaultTitles[Math.floor(Math.random() * defaultTitles.length)]
    
    const p = await db
      .insert(page)
      .values({
        title: randomTitle,
        content: JSON.stringify(initialValue),
        profileId: session.user.profileId,
      })
      .returning()
    if (p.length === 0) {
      throw new Error('Error creating page')
    }
    return { data: p[0], error: null }
  } catch (error) {
    return { data: null, error: (error as Error)?.message }
  }
}

export const updatePage = async (payload: typeof TPage) => {
  try {
    const p = await db
      .update(page)
      .set(payload)
      .where(eq(page.id, payload.id!))
      .returning()
    // console.log({ p });
    if (p.length === 0) {
      throw new Error('Error updating page')
    }
    return { ok: true, error: null }
  } catch (error) {
    return { ok: false, error: (error as Error)?.message }
  }
}
export const getAllPages = async (username: string) => {
  // try {
  const profileId = await getProfileIdByUsername(username)
  if (!profileId) {
    throw new Error('Profile not found')
  }
  const { ...rest } = getTableColumns(page)
  const pages = await db
    .select({
      ...rest,
      thumbnail: media.url,
      avatar: profile.profileImage,
    })
    .from(page)
    .leftJoin(media, eq(media.id, page.thumbnail))
    .innerJoin(profile, eq(profile.id, page.profileId))
    .where(eq(page.profileId, profileId?.id as string))
  if (pages.length === 0) {
    return []
  }
  return pages as (typeof TPage & { thumbnail: string })[]
}
export const getPageById = async (id: string) => {
  const { ...rest } = getTableColumns(page)
  const pages = await db
    .select({
      ...rest,
      thumbnail: media.url,
    })
    .from(page)
    .leftJoin(media, eq(media.id, page.thumbnail))
    .where(and(eq(page.id, id)))
    .limit(1)
  // console.log(pages);
  if (pages.length === 0) {
    throw new Error('No page found')
  }
  return pages[0]
}

export async function updatePageThumbnail(
  payload: TUploadFilesResponse & { pageId: string }
) {
  const session = await getServerSession()
  if (!session || !session?.user?.profileId) {
    throw new Error('Session not found')
  }
  const newMedia = await db
    .insert(media)
    .values({
      url: payload?.url,
      type: 'image',
      profileId: session?.user?.profileId,
      height: payload?.height,
      width: payload?.width,
    })
    .returning({ id: media.id })
  if (newMedia.length === 0) {
    throw new Error('Error creating thumbnail media')
  }

  const newThumbnail = await db
    .update(page)
    .set({ thumbnail: newMedia[0].id })
    .where(eq(page.id, payload?.pageId))
    .returning()

  if (newThumbnail.length === 0) {
    throw new Error('Error updating page thumbnail')
  }

  return true
}

export async function removePageThumbnail({ pageId }: { pageId: string }) {
  const session = await getServerSession()
  if (!session || !session?.user?.profileId) {
    throw new Error('Session not found')
  }

  const newThumbnail = await db
    .update(page)
    .set({ thumbnail: null })
    .where(eq(page.id, pageId))
    .returning()

  if (newThumbnail.length === 0) {
    throw new Error('Error deleting page thumbnail')
  }

  return true
}

export const deletePage = async (pageId: string) => {
  try {
    const session = await getServerSession()
    if (!session || !session?.user?.profileId) {
      throw new Error('Unauthorized')
    }

    // First check if the page belongs to the user
    const existingPage = await db
      .select({ profileId: page.profileId })
      .from(page)
      .where(eq(page.id, pageId))
      .limit(1)

    if (existingPage.length === 0) {
      throw new Error('Page not found')
    }

    if (existingPage[0].profileId !== session.user.profileId) {
      throw new Error('Unauthorized to delete this page')
    }

    // Delete the page
    const deletedPage = await db
      .delete(page)
      .where(eq(page.id, pageId))
      .returning()

    if (deletedPage.length === 0) {
      throw new Error('Error deleting page')
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: (error as Error)?.message }
  }
}
