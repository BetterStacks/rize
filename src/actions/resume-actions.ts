'use server'
import { requireProfile } from '@/lib/auth'
import db from '@/lib/db'
import { education, experience, profile, projects, users } from '@/db/schema'
import { ExtractedData } from '@/lib/resume-parser'
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
        employmentType: 'Full-time', // Default, could be extracted from resume
        startDate: parseDate(exp.startDate),
        endDate: parseDate(exp.endDate),
        currentlyWorking: exp.currentlyWorking || false,
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
        startDate: parseDate(edu.startDate),
        endDate: parseDate(edu.endDate),
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
 * Parse date string into Date object
 */
function parseDate(dateString?: string): Date | null {
  if (!dateString || typeof dateString !== 'string') return null

  const cleanDate = dateString.trim()
  if (!cleanDate) return null

  if (/present|current/i.test(cleanDate)) {
    return new Date()
  }

  const monthYearMatch = cleanDate.match(/^(\d{1,2})\/(\d{2,4})$/)
  if (monthYearMatch) {
    const month = parseInt(monthYearMatch[1]) - 1
    const year = parseInt(monthYearMatch[2])
    const fullYear = year < 100 ? 2000 + year : year

    if (month >= 0 && month <= 11 && fullYear >= 1900 && fullYear <= 2100) {
      const date = new Date(fullYear, month, 1)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  const yearMatch = cleanDate.match(/^(\d{4})$/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1])
    if (year >= 1900 && year <= 2100) {
      const date = new Date(year, 0, 1)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  const monthNameMatch = cleanDate.match(/^([A-Za-z]+)\s+(\d{4})$/)
  if (monthNameMatch) {
    const monthName = monthNameMatch[1]
    const year = parseInt(monthNameMatch[2])

    if (year >= 1900 && year <= 2100) {
      try {
        const testDate = new Date(`${monthName} 1, 2000`)
        if (!isNaN(testDate.getTime())) {
          const monthIndex = testDate.getMonth()
          const date = new Date(year, monthIndex, 1)
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      } catch (e) {
      }
    }
  }

  try {
    const parsed = new Date(cleanDate)
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
      return parsed
    }
  } catch (e) {
  }

  return null
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