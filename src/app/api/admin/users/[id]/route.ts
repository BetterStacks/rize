import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { users, profile, education, experience, projects } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const adminKeyHeader = request.headers.get('x-admin-api-key')
    const adminKey = process.env.ADMIN_API_KEY

    if (!adminKey || !adminKeyHeader || adminKeyHeader !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = context.params.id
    const { searchParams } = new URL(request.url)
    const letrazId = searchParams.get('letrazId') || undefined

    const rows = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        isOnboarded: users.isOnboarded,
        userCreatedAt: users.createdAt,
        userUpdatedAt: users.updatedAt,
        letrazId: users.letrazId,

        profileId: profile.id,
        profileUserId: profile.userId,
        profileImage: profile.profileImage,
        displayName: profile.displayName,
        username: profile.username,
        age: profile.age,
        pronouns: profile.pronouns,
        bio: profile.bio,
        location: profile.location,
        personalMission: profile.personalMission,
        lifePhilosophy: profile.lifePhilosophy,
        website: profile.website,
        isLive: profile.isLive,
        hasCompletedWalkthrough: profile.hasCompletedWalkthrough,
        profileCreatedAt: profile.createdAt,
        profileUpdatedAt: profile.updatedAt,
      })
      .from(users)
      .leftJoin(profile, eq(profile.userId, users.id))
      .where(eq(users.id, userId))

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If letrazId provided, update user before returning
    if (letrazId) {
      await db.update(users).set({ letrazId }).where(eq(users.id, userId))
    }

    // Collect profile IDs to fetch related records
    const profileIds = rows
      .map(r => r.profileId)
      .filter((id): id is string => Boolean(id))

    let educationByProfile: Record<string, unknown[]> = {}
    let experienceByProfile: Record<string, unknown[]> = {}
    let projectsByProfile: Record<string, unknown[]> = {}

    if (profileIds.length > 0) {
      const [eduRows, expRows, projRows] = await Promise.all([
        db
          .select({
            id: education.id,
            profileId: education.profileId,
            school: education.school,
            degree: education.degree,
            fieldOfStudy: education.fieldOfStudy,
            startDate: education.startDate,
            endDate: education.endDate,
            grade: education.grade,
            description: education.description,
            createdAt: education.createdAt,
            updatedAt: education.updatedAt,
          })
          .from(education)
          .where(inArray(education.profileId, profileIds as string[])),
        db
          .select({
            id: experience.id,
            profileId: experience.profileId,
            title: experience.title,
            company: experience.company,
            location: experience.location,
            employmentType: experience.employmentType,
            startDate: experience.startDate,
            endDate: experience.endDate,
            currentlyWorking: experience.currentlyWorking,
            companyLogo: experience.companyLogo,
            website: experience.website,
            description: experience.description,
            createdAt: experience.createdAt,
            updatedAt: experience.updatedAt,
          })
          .from(experience)
          .where(inArray(experience.profileId, profileIds as string[])),
        db
          .select({
            id: projects.id,
            profileId: projects.profileId,
            name: projects.name,
            description: projects.description,
            status: projects.status,
            logo: projects.logo,
            url: projects.url,
            startDate: projects.startDate,
            endDate: projects.endDate,
          })
          .from(projects)
          .where(inArray(projects.profileId, profileIds as string[])),
      ])

      educationByProfile = eduRows.reduce((acc, row) => {
        const key = row.profileId as string
        if (!acc[key]) acc[key] = []
        acc[key].push(row)
        return acc
      }, {} as Record<string, unknown[]>)

      experienceByProfile = expRows.reduce((acc, row) => {
        const key = row.profileId as string
        if (!acc[key]) acc[key] = []
        acc[key].push(row)
        return acc
      }, {} as Record<string, unknown[]>)

      projectsByProfile = projRows.reduce((acc, row) => {
        const key = row.profileId as string
        if (!acc[key]) acc[key] = []
        acc[key].push(row)
        return acc
      }, {} as Record<string, unknown[]>)
    }

    const first = rows[0]
    const responseBody = {
      id: first.userId,
      name: first.name,
      email: first.email,
      emailVerified: first.emailVerified,
      image: first.image,
      isOnboarded: first.isOnboarded,
      createdAt: first.userCreatedAt,
      updatedAt: first.userUpdatedAt,
      letrazId: letrazId ?? first.letrazId ?? null,
      profiles: rows
        .filter(r => r.profileId !== null)
        .map(r => ({
          id: r.profileId,
          userId: r.profileUserId,
          profileImage: r.profileImage,
          displayName: r.displayName,
          username: r.username,
          age: r.age,
          pronouns: r.pronouns,
          bio: r.bio,
          location: r.location,
          personalMission: r.personalMission,
          lifePhilosophy: r.lifePhilosophy,
          website: r.website,
          isLive: r.isLive,
          hasCompletedWalkthrough: r.hasCompletedWalkthrough,
          createdAt: r.profileCreatedAt,
          updatedAt: r.profileUpdatedAt,
          education: educationByProfile[r.profileId as string] || [],
          experience: experienceByProfile[r.profileId as string] || [],
          projects: projectsByProfile[r.profileId as string] || [],
        })),
    }

    return NextResponse.json(responseBody, { status: 200 })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}


