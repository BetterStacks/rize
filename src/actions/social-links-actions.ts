'use server'

import { socialLinks, education, experience, projects } from '@/db/schema'
import { requireAuthWithProfile } from '@/lib/auth'
import db from '@/lib/db'
import { SocialPlatform } from '@/lib/types'
import { and, eq } from 'drizzle-orm'
import { after } from 'next/server'
import { getProfileIdByUsername } from './profile-actions'

interface LetrazEducation {
  title: string
  degree?: string
  field?: string
  start_year?: string
  end_year?: string
  description?: string
  institute_logo_url?: string
  url?: string
}

interface LetrazExperience {
  company: string
  title: string
  location?: string
  start_date?: string
  end_date?: string | null
  description?: string
  company_logo_url?: string
  url?: string
}

interface LetrazProject {
  title: string
  description?: string
  start_date?: string
  end_date?: string | null
  url?: string
}

interface LetrazResponse {
  data: {
    education: LetrazEducation[]
    experience: LetrazExperience[]
    projects: LetrazProject[]
    [key: string]: any
  }
}

function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined
  
  // Handle formats like "Jan 2024", "2024", "Jan 2024 - Dec 2024"
  try {
    // If it's just a year
    if (/^\d{4}$/.test(dateString)) {
      return new Date(`Jan 1, ${dateString}`)
    }
    
    // If it's "Mon YYYY" format
    if (/^[A-Za-z]{3} \d{4}$/.test(dateString)) {
      return new Date(`${dateString} 1`)
    }
    
    return new Date(dateString)
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return undefined
  }
}

async function processLinkedInData(profileId: string, linkedinUrl: string) {
  try {
    const letrazUrl = process.env.NEXT_PUBLIC_LETRAZ_URL
    const apiKey = process.env.LETRAZ_API_KEY

    if (!letrazUrl || !apiKey) {
      console.error('Missing NEXT_PUBLIC_LETRAZ_URL or LETRAZ_API_KEY environment variables')
      return
    }

    console.log('Fetching LinkedIn data for URL:', linkedinUrl)
    
    const response = await fetch(`${letrazUrl}/api/linkedin/parse/`, {
      method: 'POST',
      headers: {
        'x-authentication': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: linkedinUrl }),
    })

    if (!response.ok) {
      console.error('Failed to fetch data from Letraz:', response.status, response.statusText)
      return
    }

    const letrazData: LetrazResponse = await response.json()
    
    if (!letrazData.data) {
      console.error('No data received from Letraz')
      return
    }

    console.log('Successfully received data from Letraz')

    // Insert education data
    if (letrazData.data.education && letrazData.data.education.length > 0) {
      for (const edu of letrazData.data.education) {
        try {
          await db.insert(education).values({
            profileId,
            school: edu.title,
            degree: edu.degree || null,
            fieldOfStudy: edu.field || null,
            startDate: parseDate(edu.start_year),
            endDate: parseDate(edu.end_year),
            description: edu.description || null,
          })
          console.log('Added education:', edu.title)
        } catch (error) {
          console.error('Error inserting education:', error)
        }
      }
    }

    // Insert experience data
    if (letrazData.data.experience && letrazData.data.experience.length > 0) {
      for (const exp of letrazData.data.experience) {
        try {
          await db.insert(experience).values({
            profileId,
            title: exp.title,
            company: exp.company,
            location: exp.location || null,
            startDate: parseDate(exp.start_date),
            endDate: exp.end_date ? parseDate(exp.end_date) : null,
            currentlyWorking: !exp.end_date,
            description: exp.description || null,
            website: exp.url || null,
          })
          console.log('Added experience:', exp.title, 'at', exp.company)
        } catch (error) {
          console.error('Error inserting experience:', error)
        }
      }
    }

    // Insert project data
    if (letrazData.data.projects && letrazData.data.projects.length > 0) {
      for (const project of letrazData.data.projects) {
        try {
          // Skip empty projects
          if (!project.title) continue
          
          await db.insert(projects).values({
            profileId,
            name: project.title,
            description: project.description || '',
            url: project.url || null,
            startDate: parseDate(project.start_date),
            endDate: project.end_date ? parseDate(project.end_date) : null,
            status: project.end_date ? 'completed' : 'wip',
          })
          console.log('Added project:', project.title)
        } catch (error) {
          console.error('Error inserting project:', error)
        }
      }
    }

    console.log('Successfully processed LinkedIn data for profile:', profileId)
    
  } catch (error) {
    console.error('Error processing LinkedIn data:', error)
  }
}

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

  // If it's a LinkedIn profile URL, trigger the import process asynchronously
  if (platform === 'linkedin' && url.includes('linkedin.com/in/')) {
    after(() => processLinkedInData(profileId, url))
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

export const upsertSocialLinks = async (linksData: Record<string, string>) => {
  const { profileId } = await requireAuthWithProfile()

  // Get existing links
  const existingLinks = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.profileId, profileId))

  // Process each platform
  for (const [platform, url] of Object.entries(linksData) as [SocialPlatform, string][]) {
    // Skip empty URLs
    if (!url || url.trim() === '') {
      // If exists, delete it
      const existing = existingLinks.find(l => l.platform === platform)
      if (existing) {
        await db
          .delete(socialLinks)
          .where(eq(socialLinks.id, existing.id))
      }
      continue
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      throw new Error(`Invalid URL for ${platform}`)
    }

    // Check if link exists
    const existing = existingLinks.find(l => l.platform === platform)

    if (existing) {
      // Update existing
      await db
        .update(socialLinks)
        .set({ url, updatedAt: new Date() })
        .where(eq(socialLinks.id, existing.id))
    } else {
      // Insert new
      await db.insert(socialLinks).values({
        profileId,
        platform,
        url,
      })

      // Trigger LinkedIn import if applicable
      if (platform === 'linkedin' && url.includes('linkedin.com/in/')) {
        after(() => processLinkedInData(profileId, url))
      }
    }
  }

  return { success: true }
}