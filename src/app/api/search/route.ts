import { searchProfiles } from '@/actions/profile-actions'
import db from '@/lib/db'
import { posts, projects, profile, page, education, experience, postTopics, projectTopics, projectSkills, profileSkills } from '@/db/schema'
import { ilike, or, and, eq, isNotNull, desc, inArray, sql, type SQL } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const type = searchParams.get('type') || 'all'
  const topicIds = (searchParams.get('topicIds') || '').split(',').map((id) => id.trim()).filter(Boolean)
  const skillIds = (searchParams.get('skillIds') || '').split(',').map((id) => id.trim()).filter(Boolean)

  try {
    const results: { people: any[]; posts: any[]; projects: any[]; pages: any[]; education: any[]; experience: any[]; total: number } = {
      people: [],
      posts: [],
      projects: [],
      pages: [],
      education: [],
      experience: [],
      total: 0,
    }

    if (type === 'all' || type === 'people') {
      if (skillIds.length > 0) {
        const profileResults = await db
          .select({
            id: profile.id,
            userId: profile.userId,
            username: profile.username,
            displayName: profile.displayName,
            profileImage: profile.profileImage,
            bio: profile.bio,
            location: profile.location,
            website: profile.website,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          })
          .from(profile)
          .where(
            and(
              or(
                ilike(profile.displayName, `%${query}%`),
                ilike(profile.username, `%${query}%`),
                ilike(profile.bio, `%${query}%`)
              ),
              sql`EXISTS (
                SELECT 1
                FROM ${profileSkills}
                WHERE ${profileSkills.profileId} = ${profile.id}
                AND ${inArray(profileSkills.skillId, skillIds)}
              )`
            )
          )
          .limit(10)

        results.people = profileResults
      } else {
        const profileResults = await searchProfiles(query)
        results.people = profileResults.slice(0, 10)
      }
    }

    if (type === 'all' || type === 'posts') {
      const postConditions: SQL[] = [
        ilike(posts.content, `%${query}%`),
        isNotNull(posts.content),
      ]

      if (topicIds.length > 0) {
        postConditions.push(sql`EXISTS (
          SELECT 1
          FROM ${postTopics}
          WHERE ${postTopics.postId} = ${posts.id}
          AND ${inArray(postTopics.topicId, topicIds)}
        )`)
      }

      const postResults = await db
        .select({
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
          profileId: posts.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(posts)
        .innerJoin(profile, eq(posts.profileId, profile.id))
        .where(and(...postConditions))
        .limit(10)
        .orderBy(desc(posts.createdAt))

      results.posts = postResults
    }

    if (type === 'all' || type === 'projects') {
      const projectConditions: SQL[] = [
        or(
          ilike(projects.name, `%${query}%`),
          ilike(projects.description, `%${query}%`)
        )!,
      ]

      if (topicIds.length > 0) {
        projectConditions.push(sql`EXISTS (
          SELECT 1
          FROM ${projectTopics}
          WHERE ${projectTopics.projectId} = ${projects.id}
          AND ${inArray(projectTopics.topicId, topicIds)}
        )`)
      }

      if (skillIds.length > 0) {
        projectConditions.push(sql`EXISTS (
          SELECT 1
          FROM ${projectSkills}
          WHERE ${projectSkills.projectId} = ${projects.id}
          AND ${inArray(projectSkills.skillId, skillIds)}
        )`)
      }

      const projectResults = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          tagline: projects.tagline,
          status: projects.status,
          url: projects.url,
          profileId: projects.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(projects)
        .innerJoin(profile, eq(projects.profileId, profile.id))
        .where(and(...projectConditions))
        .limit(10)

      results.projects = projectResults
    }

    if (type === 'all' || type === 'pages') {
      const pageResults = await db
        .select({
          id: page.id,
          title: page.title,
          status: page.status,
          createdAt: page.createdAt,
          profileId: page.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(page)
        .innerJoin(profile, eq(page.profileId, profile.id))
        .where(
          and(
            ilike(page.title, `%${query}%`),
            eq(page.status, 'published')
          )
        )
        .limit(10)
        .orderBy(desc(page.createdAt))

      results.pages = pageResults
    }

    if (type === 'all' || type === 'education') {
      const eduResults = await db
        .select({
          id: education.id,
          school: education.school,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy,
          startDate: education.startDate,
          endDate: education.endDate,
          profileId: education.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(education)
        .innerJoin(profile, eq(education.profileId, profile.id))
        .where(
          or(
            ilike(education.school, `%${query}%`),
            ilike(education.degree, `%${query}%`),
            ilike(education.fieldOfStudy, `%${query}%`)
          )
        )
        .limit(10)

      results.education = eduResults
    }

    if (type === 'all' || type === 'experience') {
      const expResults = await db
        .select({
          id: experience.id,
          title: experience.title,
          company: experience.company,
          location: experience.location,
          employmentType: experience.employmentType,
          startDate: experience.startDate,
          endDate: experience.endDate,
          currentlyWorking: experience.currentlyWorking,
          profileId: experience.profileId,
          username: profile.username,
          displayName: profile.displayName,
          profileImage: profile.profileImage,
        })
        .from(experience)
        .innerJoin(profile, eq(experience.profileId, profile.id))
        .where(
          or(
            ilike(experience.title, `%${query}%`),
            ilike(experience.company, `%${query}%`)
          )
        )
        .limit(10)

      results.experience = expResults
    }

    results.total =
      results.people.length +
      results.posts.length +
      results.projects.length +
      results.pages.length +
      results.education.length +
      results.experience.length

    return Response.json(results, { status: 200 })
  } catch (error) {
    console.error('Error searching:', error)
    return Response.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
