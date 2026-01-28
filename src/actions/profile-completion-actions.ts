'use server'

import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { profile, education, experience, projects, storyElements } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

    const [educationCount, experienceCount, projectsCount, storyElementsCount] = await Promise.all([
        db.query.education.findMany({
            where: eq(education.profileId, userProfile.id),
        }).then(items => items.length),
        db.query.experience.findMany({
            where: eq(experience.profileId, userProfile.id),
        }).then(items => items.length),
        db.query.projects.findMany({
            where: eq(projects.profileId, userProfile.id),
        }).then(items => items.length),
        db.query.storyElements.findMany({
            where: eq(storyElements.profileId, userProfile.id),
        }).then(items => items.length),
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
