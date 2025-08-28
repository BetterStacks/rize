'use server'

import db from '@/lib/db'
import { 
  profileViews, 
  engagementMetrics, 
  clickTracking, 
  profile, 
  posts, 
  likes, 
  comments, 
  bookmarks 
} from '@/db/schema'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'
import { headers } from 'next/headers'

// Track profile view
export async function trackProfileView(username: string) {
  try {
    const session = await getServerSession()
    const headersList = headers()
    
    // Get profile data
    const profileData = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.username, username))
      .limit(1)

    if (!profileData.length) return { success: false, error: 'Profile not found' }

    const profileId = profileData[0].id
    
    // Don't track views from the profile owner
    if (session?.user?.username === username) {
      return { success: true, message: 'Owner view not tracked' }
    }

    // Get viewer profile ID if logged in
    let viewerProfileId = null
    if (session?.user?.username) {
      const viewer = await db
        .select({ id: profile.id })
        .from(profile)
        .where(eq(profile.username, session.user.username))
        .limit(1)
      
      if (viewer.length) {
        viewerProfileId = viewer[0].id
      }
    }

    // Get IP and user agent
    const headersData = await headersList
    const ipAddress = headersData.get('x-forwarded-for') || 
                     headersData.get('x-real-ip') || 
                     'unknown'
    const userAgent = headersData.get('user-agent') || 'unknown'
    const referrer = headersData.get('referer') || null

    // Insert profile view
    await db.insert(profileViews).values({
      profileId,
      viewerProfileId,
      ipAddress,
      userAgent,
      referrer,
    })

    // Update daily engagement metrics
    await updateDailyEngagementMetrics(profileId)

    return { success: true }
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return { success: false, error: 'Failed to track view' }
  }
}

// Track clicks on profile elements (social links, projects, etc.)
export async function trackClick(
  username: string, 
  elementType: 'social_link' | 'project' | 'writing' | 'email' | 'resume',
  elementId?: string
) {
  try {
    const session = await getServerSession()
    const headersList = headers()
    
    // Get profile data
    const profileData = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.username, username))
      .limit(1)

    if (!profileData.length) return { success: false, error: 'Profile not found' }

    const profileId = profileData[0].id

    // Get clicker profile ID if logged in
    let clickerProfileId = null
    if (session?.user?.username) {
      const clicker = await db
        .select({ id: profile.id })
        .from(profile)
        .where(eq(profile.username, session.user.username))
        .limit(1)
      
      if (clicker.length) {
        clickerProfileId = clicker[0].id
      }
    }

    const headersData = await headersList
    const ipAddress = headersData.get('x-forwarded-for') || 
                     headersData.get('x-real-ip') || 
                     'unknown'

    // Insert click tracking
    await db.insert(clickTracking).values({
      profileId,
      elementType,
      elementId,
      clickerProfileId,
      ipAddress,
    })

    return { success: true }
  } catch (error) {
    console.error('Error tracking click:', error)
    return { success: false, error: 'Failed to track click' }
  }
}

// Get analytics data for a profile
export async function getProfileAnalytics(username: string, timeframe: '7d' | '30d' | '90d' = '30d') {
  try {
    const session = await getServerSession()
    
    // Only allow profile owner to view analytics
    if (session?.user?.username !== username) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get profile data
    const profileData = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.username, username))
      .limit(1)

    if (!profileData.length) return { success: false, error: 'Profile not found' }

    const profileId = profileData[0].id
    
    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total views and unique views
    const totalViews = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(profileViews)
      .where(and(
        eq(profileViews.profileId, profileId),
        gte(profileViews.viewedAt, startDate)
      ))

    const uniqueViews = await db
      .select({ count: sql<number>`count(distinct ${profileViews.ipAddress})`.mapWith(Number) })
      .from(profileViews)
      .where(and(
        eq(profileViews.profileId, profileId),
        gte(profileViews.viewedAt, startDate)
      ))

    // Get engagement metrics
    const userPosts = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.profileId, profileId))

    const postIds = userPosts.map(p => p.id)

    // Get likes, comments, bookmarks count
    const [likesCount, commentsCount, bookmarksCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(likes).where(sql`${likes.postId} = ANY(${postIds})`),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(comments).where(sql`${comments.postId} = ANY(${postIds})`),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(bookmarks).where(sql`${bookmarks.postId} = ANY(${postIds})`)
    ])

    // Get click data by element type
    const clicksByType = await db
      .select({
        elementType: clickTracking.elementType,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(clickTracking)
      .where(and(
        eq(clickTracking.profileId, profileId),
        gte(clickTracking.clickedAt, startDate)
      ))
      .groupBy(clickTracking.elementType)

    // Get daily views for chart
    const dailyViews = await db
      .select({
        date: sql<string>`date(${profileViews.viewedAt})`,
        views: sql<number>`count(*)`.mapWith(Number),
        uniqueViews: sql<number>`count(distinct ${profileViews.ipAddress})`.mapWith(Number)
      })
      .from(profileViews)
      .where(and(
        eq(profileViews.profileId, profileId),
        gte(profileViews.viewedAt, startDate)
      ))
      .groupBy(sql`date(${profileViews.viewedAt})`)
      .orderBy(sql`date(${profileViews.viewedAt})`)

    // Get top referrers
    const topReferrers = await db
      .select({
        referrer: profileViews.referrer,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(profileViews)
      .where(and(
        eq(profileViews.profileId, profileId),
        gte(profileViews.viewedAt, startDate),
        sql`${profileViews.referrer} IS NOT NULL`
      ))
      .groupBy(profileViews.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(10)

    return {
      success: true,
      data: {
        overview: {
          totalViews: totalViews[0]?.count || 0,
          uniqueViews: uniqueViews[0]?.count || 0,
          totalLikes: likesCount[0]?.count || 0,
          totalComments: commentsCount[0]?.count || 0,
          totalBookmarks: bookmarksCount[0]?.count || 0,
        },
        clicksByType: clicksByType.reduce((acc, item) => {
          acc[item.elementType] = item.count
          return acc
        }, {} as Record<string, number>),
        dailyViews,
        topReferrers,
        timeframe
      }
    }
  } catch (error) {
    console.error('Error getting profile analytics:', error)
    return { success: false, error: 'Failed to get analytics data' }
  }
}

// Helper function to update daily engagement metrics
async function updateDailyEngagementMetrics(profileId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    // Check if we already have metrics for today
    const existing = await db
      .select()
      .from(engagementMetrics)
      .where(and(
        eq(engagementMetrics.profileId, profileId),
        gte(engagementMetrics.date, today)
      ))
      .limit(1)

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(engagementMetrics)
        .set({
          totalViews: sql`${engagementMetrics.totalViews} + 1`
        })
        .where(eq(engagementMetrics.id, existing[0].id))
    } else {
      // Create new record
      await db.insert(engagementMetrics).values({
        profileId,
        date: today,
        totalViews: 1,
        uniqueViews: 1,
        totalLikes: 0,
        totalComments: 0,
        totalBookmarks: 0,
        profileClicks: 0,
      })
    }
  } catch (error) {
    console.error('Error updating engagement metrics:', error)
  }
}