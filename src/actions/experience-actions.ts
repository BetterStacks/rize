'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { experience } from '@/db/schema'
import db from '@/lib/db'
import { and, eq } from 'drizzle-orm'
import { requireProfile } from '@/lib/auth'
import { TExperience } from '@/lib/types'
import { getProfileIdByUsername } from './profile-actions'

const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  currentlyWorking: z.boolean(),
  description: z.string().optional(),
})

export async function upsertExperience(data: z.infer<typeof experienceSchema>) {
  const profileId = await requireProfile()

  const validated = experienceSchema.parse(data)

  if (validated.id) {
    await db
      .update(experience)
      .set({ ...validated })
      .where(eq(experience?.id, validated.id))
  } else {
    await db.insert(experience).values({ ...validated, profileId: profileId })
  }

  // revalidatePath("/[username]");
}

export const getExperienceById = async (id: string) => {
  const profileId = await requireProfile()
  const experienceById = await db
    .select()
    .from(experience)
    .where(and(eq(experience.id, id), eq(experience.profileId, profileId)))
    .limit(1)
  if (experienceById?.length === 0) {
    return null
  }
  return experienceById[0] as TExperience
}

export const getAllExperience = async (username: string) => {
  const profileId = await getProfileIdByUsername(username)
  if (!profileId) {
    throw new Error('Profile not found')
  }
  const allExperience = await db
    .select()
    .from(experience)
    .where(eq(experience.profileId, profileId?.id as string))
  if (allExperience?.length === 0) {
    return []
  }
  return allExperience as TExperience[]
}

export const deleteExperience = async (id: string) => {
  const profileId = await requireProfile()
  await db.delete(experience).where(and(eq(experience.id, id), eq(experience.profileId, profileId)))
  revalidatePath('/[username]')
}
