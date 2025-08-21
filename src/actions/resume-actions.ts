'use server'
import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { education, experience, profile, projects } from '@/db/schema'
import { ExtractedData } from '@/lib/resume-parser'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
})

/**
 * Process and save resume data to user's profile
 */
export async function processResumeData(resumeData: ExtractedData) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user's profile
    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    const profileId = userProfile[0].id

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
      // Note: Projects need a logo (media), so we'll create placeholder projects
      // In a real implementation, you might want to generate placeholder logos
      // or allow users to add them later
      const projectsData = resumeData.projects
        .filter(proj => proj.name && proj.description) // Only projects with name and description
        .slice(0, 5) // Limit to 5 projects
        .map(proj => ({
          profileId,
          name: proj.name as string, // We filtered for truthy name above
          description: proj.description as string, // We filtered for truthy description above
          url: proj.url,
          status: 'completed' as const,
          // logo field is now optional in schema
        }))

      // Insert projects now that logo field is optional
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
    revalidatePath(`/${session.user.username}`)

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
 * Handles various date formats commonly found in resumes
 */
function parseDate(dateString?: string): Date | null {
  if (!dateString || typeof dateString !== 'string') return null
  
  // Clean the string
  const cleanDate = dateString.trim()
  if (!cleanDate) return null
  
  // Handle "present", "current" cases
  if (/present|current/i.test(cleanDate)) {
    return new Date()
  }
  
  // Try MM/YYYY or MM/YY format
  const monthYearMatch = cleanDate.match(/^(\d{1,2})\/(\d{2,4})$/)
  if (monthYearMatch) {
    const month = parseInt(monthYearMatch[1]) - 1 // JavaScript months are 0-indexed
    const year = parseInt(monthYearMatch[2])
    const fullYear = year < 100 ? 2000 + year : year
    
    // Validate month and year
    if (month >= 0 && month <= 11 && fullYear >= 1900 && fullYear <= 2100) {
      const date = new Date(fullYear, month, 1)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  // Try YYYY format
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
  
  // Try Month YYYY format
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
        // Invalid month name, continue
      }
    }
  }
  
  // Fallback: try native Date parsing with validation
  try {
    const parsed = new Date(cleanDate)
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
      return parsed
    }
  } catch (e) {
    // Invalid date format
  }
  
  return null
}

/**
 * Get resume processing status for a user
 */
export async function getResumeProcessingStatus() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    const profileId = userProfile[0].id

    // Check if user has any resume-imported data
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
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    if (!userProfile.length) {
      return { success: false, error: 'Profile not found' }
    }

    const profileId = userProfile[0].id

    // Delete all experience and education data
    // Note: You might want to add a flag to distinguish resume-imported vs manually added data
    await Promise.all([
      db.delete(experience).where(eq(experience.profileId, profileId)),
      db.delete(education).where(eq(education.profileId, profileId)),
    ])

    // Revalidate the profile page
    revalidatePath(`/${session.user.username}`)

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

/**
 * Clean up old resume files from Cloudinary for a user
 */
export async function cleanupOldResumeFiles(userId: string) {
  try {
    // Search for existing resume files for this user
    const searchExpression = `folder:fyp-stacks/resumes AND public_id:resume_${userId}_*`
    
    const searchResult = await cloudinary.search
      .expression(searchExpression)
      .sort_by('created_at', 'desc')
      .max_results(10) // Get up to 10 recent files
      .execute()

    // Keep the most recent file, delete the rest
    if (searchResult.resources && searchResult.resources.length > 1) {
      const filesToDelete = searchResult.resources.slice(1) // Skip the first (most recent) file
      
      const deletePromises = filesToDelete.map((resource: any) => 
        cloudinary.uploader.destroy(resource.public_id, { resource_type: 'raw' })
      )
      
      await Promise.allSettled(deletePromises)
      console.log(`Cleaned up ${filesToDelete.length} old resume files for user ${userId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error cleaning up old resume files:', error)
    return { success: false, error: 'Failed to cleanup old files' }
  }
}