import { NextRequest, NextResponse } from 'next/server'
import { randomUUID, timingSafeEqual } from 'crypto'
import { parseResumeContent, ExtractedData } from '@/lib/resume-parser'
import db from '@/lib/db'
import { users, profile, experience, education } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sanitizeHtml } from '@/lib/sanitize'

/**
 * Bulk Resume Import API
 * Accepts PDF resumes via curl and creates user profiles from extracted data
 */
export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication for bulk operations
    const apiKey = request.headers.get('x-api-key')
    const expected = process.env.BULK_IMPORT_API_KEY
    if (!apiKey || !expected || !timingSafeEqual(Buffer.from(apiKey), Buffer.from(expected))) {
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
        // Needed to build the claim link: /claim-profile?token=<claimToken>
        claimToken: profileData.claimToken,
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
  // Generate username from name, ensuring it's not reserved
  const { isUsernameReserved } = await import('@/lib/reserved-usernames')
  let baseUsername = data.name!
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15)
  
  // If base username is reserved, modify it
  if (isUsernameReserved(baseUsername)) {
    baseUsername = `${baseUsername}user`
  }
  
  let username = `${baseUsername}${Math.floor(Math.random() * 999) + 1}`
  
  // Extra safety check - if generated username is still reserved, add more randomness
  while (isUsernameReserved(username)) {
    username = `${baseUsername}${Math.floor(Math.random() * 9999) + 1000}`
  }
  
  // These people never signed up. The account stays unclaimed (and the
  // profile private) until they open their claim link. Only data taken from
  // the resume is stored: nothing is guessed or made up.
  const userId = `resume-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const claimToken = randomUUID()

  const insertedUser = await db.insert(users).values({
    id: userId,
    name: data.name!,
    email: data.email!,
    password: null,
    emailVerified: false,
    image: null,
    isOnboarded: false,
    isClaimed: false,
    claimToken,
  }).returning()

  // Create profile. age and pronouns are left to their column defaults
  // (both columns are NOT NULL); the person sets them after claiming.
  const summary = data.summary?.trim()
  const insertedProfile = await db.insert(profile).values({
    userId: insertedUser[0].id,
    username,
    displayName: data.name!,
    bio: summary ? sanitizeHtml(summary) : null,
    location: data.location || null,
    profileImage: null,
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
      location: exp.location || null,
      // employment_type is NOT NULL and the resume parser doesn't return it.
      employmentType: 'Full-time' as const,
      startDate: exp.startDate ? new Date(exp.startDate) : null,
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      currentlyWorking: exp.currentlyWorking || false,
      description: exp.description || null,
    }))

    await db.insert(experience).values(experienceData)
  }

  // Insert education data
  if (data.education.length > 0) {
    const educationData = data.education.map(edu => ({
      profileId,
      school: edu.school,
      degree: edu.degree || null,
      fieldOfStudy: edu.fieldOfStudy || null,
      startDate: edu.startDate ? new Date(edu.startDate) : null,
      endDate: edu.endDate ? new Date(edu.endDate) : null,
      grade: edu.grade || null,
    }))

    await db.insert(education).values(educationData)
  }

  return {
    userId: insertedUser[0].id,
    profileId,
    username,
    claimToken,
  }
}
