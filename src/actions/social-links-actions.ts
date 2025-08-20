'use server'

import { socialLinks } from '@/db/schema'
import { requireAuthWithProfile } from '@/lib/auth'
import db from '@/lib/db'
import { SocialPlatform } from '@/lib/types'
import { and, eq } from 'drizzle-orm'
import { getProfileIdByUsername } from './profile-actions'

export const getSocialLinks = async (username: string) => {
  const profileId = await getProfileIdByUsername(username)
  if (!profileId?.id) {
    throw new Error('Profile not found')
  }
  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.profileId, profileId?.id))

  if (links.length === 0) {
    // throw new Error("No social links found");
    return []
  }

  return links
}

export const addSocialLink = async (url: string, platform: SocialPlatform) => {
  const { profileId } = await requireAuthWithProfile()

  const newLink = await db
    .insert(socialLinks)
    .values({
      profileId,
      platform,
      url,
    })
    .returning()
  if (newLink.length === 0) {
    throw new Error('Error adding social link')
  }

  return newLink[0]
}
export const editSocialLink = async (id: string, url: string) => {
  const { profileId } = await requireAuthWithProfile()

  const newLink = await db
    .update(socialLinks)
    .set({
      url,
    })
    .where(
      and(
        eq(socialLinks.id, id),
        eq(socialLinks.profileId, profileId)
      )
    )
    .returning()
  if (newLink.length === 0) {
    throw new Error('Error updating social link')
  }

  return newLink[0]
}

export const removeSocialLink = async (id: string) => {
  const { profileId } = await requireAuthWithProfile()
  const link = await db
    .delete(socialLinks)
    .where(
      and(
        eq(socialLinks.id, id),
        eq(socialLinks.profileId, profileId)
      )
    )
    .returning()
  if (link.length === 0) {
    throw new Error('Error deleting social link')
  }
  return link[0]
}
