'use server'

import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { profile, education, experience, projects, storyElements } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function getProfileCompletionData() {
    const session = await getServerSession()
    if (!session?.user) {
        return null
    }

    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    })

    if (!userProfile) {
        return null
    }

    const countQuery = (table: any, column: any) =>
        db.select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(table)
          .where(eq(column, userProfile.id))
          .then(r => r[0]?.count ?? 0)

    const [educationCount, experienceCount, projectsCount, storyElementsCount] = await Promise.all([
        countQuery(education, education.profileId),
        countQuery(experience, experience.profileId),
        countQuery(projects, projects.profileId),
        countQuery(storyElements, storyElements.profileId),
    ])

    return {
        profile: {
            displayName: userProfile.displayName,
            bio: userProfile.bio,
            location: userProfile.location,
            personalMission: userProfile.personalMission,
            age: userProfile.age,
        },
        educationCount,
        experienceCount,
        projectsCount,
        storyElementsCount,
    }
}
