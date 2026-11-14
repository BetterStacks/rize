'use server'
import { requireProfile } from '@/lib/auth'
import db from '@/lib/db'
import { education, experience, profile, projects, skills, users } from '@/db/schema'
import { ExtractedData } from '@/lib/resume-parser'
import { parseDatePair, parseDateRange } from '@/lib/import-dates'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Process and save resume data to user's profile
 */
export async function processResumeData(resumeData: ExtractedData, resumeFileUrl?: string) {
  try {
    const profileId = await requireProfile()

    // Get user's profile for conditional updates
    const userProfile = await db
      .select({ id: profile.id, userId: profile.userId, username: profile.username, location: profile.location, bio: profile.bio })
      .from(profile)
      .where(eq(profile.id, profileId))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    // Update user's resumeFileId if provided
    if (resumeFileUrl) {
      await db
        .update(users)
        .set({ resumeFileId: resumeFileUrl })
        .where(eq(users.id, userProfile[0].userId))
    }

    // Insert experience data
    if (resumeData.experience && resumeData.experience.length > 0) {
      const experienceData = resumeData.experience.map(exp => ({
        profileId,
        title: exp.title,
        company: exp.company,
        location: exp.location,
        employmentType: 'Full-time' as const, // Default, could be extracted from resume
        ...parseDateRange(exp.startDate, exp.endDate, { currentlyWorking: exp.currentlyWorking }),
        description: exp.description,
      }))

      await db.insert(experience).values(experienceData)
    }

    // Insert education data
    if (resumeData.education && resumeData.education.length > 0) {
      const educationData = resumeData.education.map(edu => ({
        profileId,
        school: edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        ...parseDatePair(edu.startDate, edu.endDate),
        grade: edu.grade,
      }))

      await db.insert(education).values(educationData)
    }

    // Insert projects data
    if (resumeData.projects && resumeData.projects.length > 0) {
      const projectsData = resumeData.projects
        .filter(proj => proj.name && proj.description) // Only projects with name and description
        .slice(0, 5) // Limit to 5 projects
        .map(proj => ({
          profileId,
          name: proj.name as string,
          description: proj.description as string,
          url: proj.url,
          status: 'completed' as const,
        }))

      if (projectsData.length > 0) {
        await db.insert(projects).values(projectsData)
      }
    }

    // Update profile with extracted personal info if available
    const profileUpdates: Partial<{
      location: string;
      bio: string;
    }> = {}
    if (resumeData.location && !userProfile[0].location) {
      profileUpdates.location = resumeData.location
    }
    if (resumeData.summary && !userProfile[0].bio) {
      profileUpdates.bio = resumeData.summary
    }

    if (Object.keys(profileUpdates).length > 0) {
      await db
        .update(profile)
        .set(profileUpdates)
        .where(eq(profile.id, profileId))
    }

    // Revalidate the profile page
    if (userProfile[0].username) {
      revalidatePath(`/${userProfile[0].username}`)
    }

    return {
      success: true,
      message: 'Resume data processed successfully',
      stats: {
        experience: resumeData.experience?.length || 0,
        education: resumeData.education?.length || 0,
        skills: resumeData.skills?.length || 0,
        projects: resumeData.projects?.length || 0,
      }
    }

  } catch (error) {
    console.error('Error processing resume data:', error)
    return {
      success: false,
      error: 'Failed to process resume data'
    }
  }
}

/**
 * Get resume processing status for a user
 */
export async function getResumeProcessingStatus() {
  try {
    const profileId = await requireProfile()

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    const [experienceCount, educationCount] = await Promise.all([
      db.select().from(experience).where(eq(experience.profileId, profileId)),
      db.select().from(education).where(eq(education.profileId, profileId)),
    ])

    return {
      success: true,
      hasResumeData: experienceCount.length > 0 || educationCount.length > 0,
      experienceCount: experienceCount.length,
      educationCount: educationCount.length,
    }

  } catch (error) {
    console.error('Error checking resume status:', error)
    return {
      success: false,
      error: 'Failed to check resume status'
    }
  }
}

/**
 * Clear all resume-imported data from user's profile
 */
export async function clearResumeData() {
  try {
    const profileId = await requireProfile()

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    await Promise.all([
      db.delete(experience).where(eq(experience.profileId, profileId)),
      db.delete(education).where(eq(education.profileId, profileId)),
    ])

    if (userProfile[0].username) {
      revalidatePath(`/${userProfile[0].username}`)
    }

    return {
      success: true,
      message: 'Resume data cleared successfully'
    }

  } catch (error) {
    console.error('Error clearing resume data:', error)
    return {
      success: false,
      error: 'Failed to clear resume data'
    }
  }
}