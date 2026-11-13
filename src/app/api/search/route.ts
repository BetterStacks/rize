import db from '@/lib/db'
import { posts, projects, profile, page, education, experience, postTopics, projectTopics, projectSkills, profileSkills } from '@/db/schema'
import { ilike, or, and, eq, isNotNull, desc, inArray, sql, type SQL, type AnyColumn } from 'drizzle-orm'
import { checkRateLimit } from '@/lib/rate-limit'
import { profileIsClaimed } from '@/lib/claimed-profiles'

const SEARCH_TYPES = ['people', 'posts', 'projects', 'pages', 'education', 'experience'] as const
type SearchType = (typeof SEARCH_TYPES)[number]

const LIMIT = 10

// Treat %, _ and \ in the query as plain characters, not ILIKE wildcards.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&')

// Timestamps are stored without a zone (UTC). Mark them as UTC so the JSON
// strings parse to the right instant in the browser.
const ts = (column: AnyColumn, alias: string) =>
  sql`(${column} AT TIME ZONE 'UTC')`.as(alias)

/*
 * Search runs as ONE SQL statement: each section is a subquery aggregated to
 * JSON. The database is far from the functions (about 220ms per round trip),
 * so six sequential queries used to cost well over a second on their own.
 *
 * Results are public (no session is read), so the CDN may cache them briefly.
 */
export async function GET(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const { success, response } = await checkRateLimit('search', ip)
  if (!success) return response!

  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('query') || searchParams.get('q') || '').trim()
  // `type` is "all", one section, or a comma-separated list of sections.
  const typeParam = (searchParams.get('type') || 'all').split(',').map((t) => t.trim())
  const types = new Set<SearchType>(
    typeParam.includes('all')
      ? SEARCH_TYPES
      : SEARCH_TYPES.filter((t) => typeParam.includes(t))
  )
  const topicIds = (searchParams.get('topicIds') || '').split(',').map((id) => id.trim()).filter(Boolean)
  const skillIds = (searchParams.get('skillIds') || '').split(',').map((id) => id.trim()).filter(Boolean)

  const results: Record<SearchType, unknown[]> & { total: number } = {
    people: [],
    posts: [],
    projects: [],
    pages: [],
    education: [],
    experience: [],
    total: 0,
  }

  if (!query || types.size === 0) {
    return Response.json(results, { status: 200 })
  }

  const like = `%${escapeLike(query)}%`
  const sections: { key: SearchType; query: SQL }[] = []

  if (types.has('people')) {
    if (skillIds.length > 0) {
      sections.push({
        key: 'people',
        query: db
          .select({
            id: sql`${profile.id}`.as('id'),
            userId: sql`${profile.userId}`.as('userId'),
            username: sql`${profile.username}`.as('username'),
            displayName: sql`${profile.displayName}`.as('displayName'),
            profileImage: sql`${profile.profileImage}`.as('profileImage'),
            bio: sql`${profile.bio}`.as('bio'),
            location: sql`${profile.location}`.as('location'),
            website: sql`${profile.website}`.as('website'),
            createdAt: ts(profile.createdAt, 'createdAt'),
            updatedAt: ts(profile.updatedAt, 'updatedAt'),
          })
          .from(profile)
          .where(
            and(
              profileIsClaimed(),
              or(
                ilike(profile.displayName, like),
                ilike(profile.username, like),
                ilike(profile.bio, like)
              ),
              sql`EXISTS (
                SELECT 1
                FROM ${profileSkills}
                WHERE ${profileSkills.profileId} = ${profile.id}
                AND ${inArray(profileSkills.skillId, skillIds)}
              )`
            )
          )
          .limit(LIMIT)
          .getSQL(),
      })
    } else {
      // Same as searchProfiles(): name or username, a leading "@" is ignored.
      const handle = query.startsWith('@') ? query.slice(1) : query
      const handleLike = `%${escapeLike(handle)}%`
      sections.push({
        key: 'people',
        query: db
          .select({
            id: sql`${profile.id}`.as('id'),
            displayName: sql`${profile.displayName}`.as('displayName'),
            username: sql`${profile.username}`.as('username'),
            profileImage: sql`${profile.profileImage}`.as('profileImage'),
          })
          .from(profile)
          .where(
            and(
              handle ? or(ilike(profile.displayName, handleLike), ilike(profile.username, handleLike)) : undefined,
              profileIsClaimed()
            )
          )
          .limit(LIMIT)
          .getSQL(),
      })
    }
  }

  if (types.has('posts')) {
    const postConditions: SQL[] = [
      profileIsClaimed(),
      ilike(posts.content, like),
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
    sections.push({
      key: 'posts',
      query: db
        .select({
          id: sql`${posts.id}`.as('id'),
          content: sql`${posts.content}`.as('content'),
          createdAt: ts(posts.createdAt, 'createdAt'),
          profileId: sql`${posts.profileId}`.as('profileId'),
          username: sql`${profile.username}`.as('username'),
          displayName: sql`${profile.displayName}`.as('displayName'),
          profileImage: sql`${profile.profileImage}`.as('profileImage'),
        })
        .from(posts)
        .innerJoin(profile, eq(posts.profileId, profile.id))
        .where(and(...postConditions))
        .orderBy(desc(posts.createdAt))
        .limit(LIMIT)
        .getSQL(),
    })
  }

  if (types.has('projects')) {
    const projectConditions: SQL[] = [
      profileIsClaimed(),
      or(ilike(projects.name, like), ilike(projects.description, like))!,
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
    sections.push({
      key: 'projects',
      query: db
        .select({
          id: sql`${projects.id}`.as('id'),
          name: sql`${projects.name}`.as('name'),
          description: sql`${projects.description}`.as('description'),
          tagline: sql`${projects.tagline}`.as('tagline'),
          status: sql`${projects.status}`.as('status'),
          url: sql`${projects.url}`.as('url'),
          profileId: sql`${projects.profileId}`.as('profileId'),
          username: sql`${profile.username}`.as('username'),
          displayName: sql`${profile.displayName}`.as('displayName'),
          profileImage: sql`${profile.profileImage}`.as('profileImage'),
        })
        .from(projects)
        .innerJoin(profile, eq(projects.profileId, profile.id))
        .where(and(...projectConditions))
        .limit(LIMIT)
        .getSQL(),
    })
  }

  if (types.has('pages')) {
    sections.push({
      key: 'pages',
      query: db
        .select({
          id: sql`${page.id}`.as('id'),
          title: sql`${page.title}`.as('title'),
          status: sql`${page.status}`.as('status'),
          createdAt: ts(page.createdAt, 'createdAt'),
          profileId: sql`${page.profileId}`.as('profileId'),
          username: sql`${profile.username}`.as('username'),
          displayName: sql`${profile.displayName}`.as('displayName'),
          profileImage: sql`${profile.profileImage}`.as('profileImage'),
        })
        .from(page)
        .innerJoin(profile, eq(page.profileId, profile.id))
        .where(
          and(
            profileIsClaimed(),
            ilike(page.title, like),
            // Drafts never show up in search.
            eq(page.status, 'published')
          )
        )
        .orderBy(desc(page.createdAt))
        .limit(LIMIT)
        .getSQL(),
    })
  }

  if (types.has('education')) {
    sections.push({
      key: 'education',
      query: db
        .select({
          id: sql`${education.id}`.as('id'),
          school: sql`${education.school}`.as('school'),
          degree: sql`${education.degree}`.as('degree'),
          fieldOfStudy: sql`${education.fieldOfStudy}`.as('fieldOfStudy'),
          startDate: ts(education.startDate, 'startDate'),
          endDate: ts(education.endDate, 'endDate'),
          profileId: sql`${education.profileId}`.as('profileId'),
          username: sql`${profile.username}`.as('username'),
          displayName: sql`${profile.displayName}`.as('displayName'),
          profileImage: sql`${profile.profileImage}`.as('profileImage'),
        })
        .from(education)
        .innerJoin(profile, eq(education.profileId, profile.id))
        .where(
          and(
            profileIsClaimed(),
            or(
              ilike(education.school, like),
              ilike(education.degree, like),
              ilike(education.fieldOfStudy, like)
            )
          )
        )
        .limit(LIMIT)
        .getSQL(),
    })
  }

  if (types.has('experience')) {
    sections.push({
      key: 'experience',
      query: db
        .select({
          id: sql`${experience.id}`.as('id'),
          title: sql`${experience.title}`.as('title'),
          company: sql`${experience.company}`.as('company'),
          location: sql`${experience.location}`.as('location'),
          employmentType: sql`${experience.employmentType}`.as('employmentType'),
          startDate: ts(experience.startDate, 'startDate'),
          endDate: ts(experience.endDate, 'endDate'),
          currentlyWorking: sql`${experience.currentlyWorking}`.as('currentlyWorking'),
          profileId: sql`${experience.profileId}`.as('profileId'),
          username: sql`${profile.username}`.as('username'),
          displayName: sql`${profile.displayName}`.as('displayName'),
          profileImage: sql`${profile.profileImage}`.as('profileImage'),
        })
        .from(experience)
        .innerJoin(profile, eq(experience.profileId, profile.id))
        .where(
          and(
            profileIsClaimed(),
            or(ilike(experience.title, like), ilike(experience.company, like))
          )
        )
        .limit(LIMIT)
        .getSQL(),
    })
  }

  try {
    const statement = sql.join(
      sections.map(
        ({ key, query: sub }) =>
          sql`(SELECT coalesce(json_agg(t), '[]'::json) FROM (${sub}) t) AS ${sql.identifier(key)}`
      ),
      sql`, `
    )
    const { rows } = await db.execute<Record<SearchType, unknown[]>>(sql`SELECT ${statement}`)
    const row = rows[0] ?? {}

    for (const { key } of sections) {
      results[key] = (row as Record<string, unknown[]>)[key] ?? []
    }
    results.total = SEARCH_TYPES.reduce((n, key) => n + results[key].length, 0)

    return Response.json(results, {
      status: 200,
      headers: {
        // Public data only; a short shared cache absorbs repeated keystrokes.
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return Response.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
