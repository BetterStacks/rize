import { NextRequest, NextResponse } from 'next/server'
import { parseResumeContent, ExtractedData } from '@/lib/resume-parser'
import db from '@/lib/db'
import { users, profile, experience, education, socialLinks } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Generate a random date between start and end
 */
function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Bulk Resume Import API
 * Accepts PDF resumes via curl and creates user profiles from extracted data
 */
export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication for bulk operations
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.BULK_IMPORT_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - PDFs only for resumes
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    console.log(`📄 Processing resume: ${file.name}`)

    // Parse resume content using Letraz API
    const extractedData = await parseResumeContent(file)

    // Validate extracted data has minimum required fields
    if (!extractedData.email || !extractedData.name) {
      return NextResponse.json({
        error: 'Could not extract required information (name, email) from resume',
        extractedData
      }, { status: 400 })
    }

    // Check if user already exists by email
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, extractedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
        email: extractedData.email,
        existingUserId: existingUser[0].id
      }, { status: 409 })
    }

    // Create user profile from extracted data
    const profileData = await createProfileFromExtractedData(extractedData)

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully from resume',
      profile: {
        userId: profileData.userId,
        email: extractedData.email,
        name: extractedData.name,
        username: profileData.username,
        experienceCount: extractedData.experience.length,
        educationCount: extractedData.education.length,
        skillsCount: extractedData.skills.length,
      },
      extractedData
    })

  } catch (error) {
    console.error('Bulk resume import error:', error)
    return NextResponse.json({
      error: 'Failed to process resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Create a complete user profile from extracted resume data
 */
async function createProfileFromExtractedData(data: ExtractedData) {
  // Generate username from name
  const baseUsername = data.name!
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15)
  
  const username = `${baseUsername}${Math.floor(Math.random() * 999) + 1}`
  
  // Create user first
  const userId = `resume-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const insertedUser = await db.insert(users).values({
    id: userId,
    name: data.name!,
    email: data.email!,
    emailVerified: true,
    image: `https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 1000)}?w=400&h=400&fit=crop&crop=face`,
    isOnboarded: true,
  }).returning()

  // Create profile
  
  const insertedProfile = await db.insert(profile).values({
    userId: insertedUser[0].id,
    username,
    displayName: data.name!,
    bio: data.summary || generateBioFromData(data),
    location: data.location || null,
    profileImage: `https://images.unsplash.com/photo-${1500000000 + Math.floor(Math.random() * 1000)}?w=400&h=400&fit=crop&crop=face`,
    age: Math.floor(Math.random() * 10) + 22, // 22-32 years old
    pronouns: 'they/them', // Default, can be updated later
    isLive: false,
    hasCompletedWalkthrough: true,
  }).returning()

  const profileId = insertedProfile[0].id

  // Insert experience data
  if (data.experience.length > 0) {
    const experienceData = data.experience.map(exp => ({
      profileId,
      title: exp.title,
      company: exp.company,
      location: exp.location || data.location || null,
      employmentType: 'Full-time' as const,
      startDate: exp.startDate ? new Date(exp.startDate) : generateRandomDate(new Date(2020, 0, 1), new Date(2023, 0, 1)),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      currentlyWorking: exp.currentlyWorking || false,
      description: exp.description || `${exp.title} at ${exp.company}`,
    }))

    await db.insert(experience).values(experienceData)
  }

  // Insert education data
  if (data.education.length > 0) {
    const educationData = data.education.map(edu => ({
      profileId,
      school: edu.school,
      degree: edu.degree || 'Bachelor\'s Degree',
      fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
      startDate: edu.startDate ? new Date(edu.startDate) : generateRandomDate(new Date(2015, 8, 1), new Date(2018, 8, 1)),
      endDate: edu.endDate ? new Date(edu.endDate) : generateRandomDate(new Date(2019, 4, 1), new Date(2022, 4, 1)),
      grade: edu.grade || null,
    }))

    await db.insert(education).values(educationData)
  }

  // Add social links if email suggests GitHub/LinkedIn
  const socialLinksData = []
  
  // Try to infer GitHub username from email or create one
  if (data.email?.includes('github') || Math.random() > 0.5) {
    socialLinksData.push({
      profileId,
      platform: 'github' as const,
      url: `https://github.com/${username.toLowerCase()}`
    })
  }

  // Add LinkedIn profile
  if (Math.random() > 0.3) {
    socialLinksData.push({
      profileId,
      platform: 'linkedin' as const,
      url: `https://linkedin.com/in/${username.toLowerCase()}`
    })
  }

  if (socialLinksData.length > 0) {
    await db.insert(socialLinks).values(socialLinksData)
  }

  return {
    userId: insertedUser[0].id,
    profileId,
    username
  }
}

/**
 * Generate a bio from extracted data
 */
function generateBioFromData(data: ExtractedData): string {
  const currentJob = data.experience.find(exp => exp.currentlyWorking) || data.experience[0]
  const topSkills = data.skills.slice(0, 3).join(', ')
  
  if (currentJob && topSkills) {
    return `${currentJob.title} at ${currentJob.company}. Experienced with ${topSkills}. Passionate about technology and innovation.`
  } else if (currentJob) {
    return `${currentJob.title} at ${currentJob.company}. Passionate about technology and building great products.`
  } else if (topSkills) {
    return `Experienced with ${topSkills}. Always learning and building cool stuff.`
  } else {
    return 'Passionate developer and problem solver. Always excited to work on new challenges.'
  }
}