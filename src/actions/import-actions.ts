'use server'

import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { profile, projects, experience, education, socialLinks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ImportedProfile, generateEnhancedBio, generateUsername } from '@/lib/profile-import'

/**
 * Process and save imported profile data to the database
 */
export async function processImportedProfile(importedData: ImportedProfile) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get or create user profile
    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, session.user.id))
      .limit(1)

    let profileId: string

    if (userProfile.length === 0) {
      // Create new profile with imported data
      const username = generateUsername(importedData, session.user.name || undefined)
      const enhancedBio = generateEnhancedBio(importedData)

      const newProfile = await db
        .insert(profile)
        .values({
          userId: session.user.id,
          username,
          displayName: importedData.displayName || session.user.name,
          bio: enhancedBio,
          location: importedData.location,
          profileImage: session.user.image || undefined,
        })
        .returning()

      profileId = newProfile[0].id
    } else {
      // Update existing profile with imported data (only if fields are empty)
      profileId = userProfile[0].id
      const updates: Partial<{
        bio: string;
        location: string;
        displayName: string;
      }> = {}

      if (!userProfile[0].bio && importedData.bio) {
        updates.bio = generateEnhancedBio(importedData)
      }
      if (!userProfile[0].location && importedData.location) {
        updates.location = importedData.location
      }
      if (!userProfile[0].displayName && importedData.displayName) {
        updates.displayName = importedData.displayName
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(profile)
          .set(updates)
          .where(eq(profile.id, profileId))
      }
    }

    const stats = {
      experience: 0,
      projects: 0,
      education: 0,
      socialLinks: 0
    }

    // Insert experience data
    if (importedData.experience && importedData.experience.length > 0) {
      const experienceData = importedData.experience.map(exp => ({
        profileId,
        title: exp.title,
        company: exp.company,
        location: exp.location,
        employmentType: 'Full-time' as const, // Default
        startDate: exp.startDate,
        endDate: exp.endDate,
        currentlyWorking: exp.currentlyWorking || false,
        description: exp.description,
      }))

      await db.insert(experience).values(experienceData)
      stats.experience = experienceData.length
    }

    // Insert education data
    if (importedData.education && importedData.education.length > 0) {
      const educationData = importedData.education.map(edu => ({
        profileId,
        school: edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        grade: edu.grade,
      }))

      await db.insert(education).values(educationData)
      stats.education = educationData.length
    }

    // Insert projects data
    if (importedData.projects && importedData.projects.length > 0) {
      // Only insert projects with names and descriptions
      const projectsData = importedData.projects
        .filter(proj => proj.name && proj.description)
        .slice(0, 8) // Limit to 8 projects
        .map(proj => ({
          profileId,
          name: proj.name,
          description: proj.description,
          url: proj.url,
          status: proj.status,
          // logo field is now optional in schema
        }))

      if (projectsData.length > 0) {
        await db.insert(projects).values(projectsData)
        stats.projects = projectsData.length
      }
    }

    // Insert social links
    if (importedData.socialLinks && importedData.socialLinks.length > 0) {
      const socialData = importedData.socialLinks
        .filter(link => link.url && link.platform)
        .map(link => ({
          profileId,
          platform: link.platform,
          url: link.url,
        }))

      if (socialData.length > 0) {
        await db.insert(socialLinks).values(socialData)
        stats.socialLinks = socialData.length
      }
    }

    // Revalidate the profile page
    revalidatePath(`/${session.user.username}`)

    return { 
      success: true, 
      message: 'Profile imported successfully',
      stats,
      profileId
    }

  } catch (error) {
    console.error('Error processing imported profile:', error)
    return { 
      success: false, 
      error: 'Failed to process imported profile data' 
    }
  }
}

/**
 * Get available import sources for a user
 */
export async function getImportSources() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check which accounts are connected
    const accounts = await db.query.accounts.findMany({
      where: (accounts, { eq }) => eq(accounts.userId, session.user.id),
    })

    const availableSources = {
      github: accounts.some(account => account.provider === 'github'),
      linkedin: accounts.some(account => account.provider === 'linkedin'),
      google: accounts.some(account => account.provider === 'google'),
    }

    return { 
      success: true, 
      sources: availableSources 
    }

  } catch (error) {
    console.error('Error getting import sources:', error)
    return { 
      success: false, 
      error: 'Failed to get import sources' 
    }
  }
}