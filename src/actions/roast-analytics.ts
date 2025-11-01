'use server'

import db from '@/lib/db'
import { roastAnalytics, roastHistory, profile } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Track a roast event
export async function trackRoast(username: string) {
  try {
    const session = await getServerSession()
    
    // Get profile data
    const profileData = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.username, username))
      .limit(1)

    if (!profileData.length) {
      return { success: false, error: 'Profile not found' }
    }

    const profileId = profileData[0].id

    // Insert into roast history
    await db.insert(roastHistory).values({
      profileId,
    })

    // Check if analytics record exists
    const existing = await db
      .select()
      .from(roastAnalytics)
      .where(eq(roastAnalytics.profileId, profileId))
      .limit(1)

    const now = new Date()

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(roastAnalytics)
        .set({
          totalRoasts: sql`${roastAnalytics.totalRoasts} + 1`,
          lastRoastAt: now,
        })
        .where(eq(roastAnalytics.id, existing[0].id))
    } else {
      // Create new record
      await db.insert(roastAnalytics).values({
        profileId,
        totalRoasts: 1,
        firstRoastAt: now,
        lastRoastAt: now,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking roast:', error)
    return { success: false, error: 'Failed to track roast' }
  }
}

// Get roast analytics for a user
export async function getRoastAnalytics(username: string) {
  try {
    const session = await getServerSession()
    
    // Only allow user to view their own analytics
    if (session?.user?.username !== username) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get profile data
    const profileData = await db
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.username, username))
      .limit(1)

    if (!profileData.length) {
      return { success: false, error: 'Profile not found' }
    }

    const profileId = profileData[0].id

    // Get analytics
    const analytics = await db
      .select()
      .from(roastAnalytics)
      .where(eq(roastAnalytics.profileId, profileId))
      .limit(1)

    if (!analytics.length) {
      // No roasts yet
      return {
        success: true,
        data: {
          totalRoasts: 0,
          firstRoastAt: null,
          lastRoastAt: null,
        }
      }
    }

    return {
      success: true,
      data: {
        totalRoasts: analytics[0].totalRoasts,
        firstRoastAt: analytics[0].firstRoastAt,
        lastRoastAt: analytics[0].lastRoastAt,
      }
    }
  } catch (error) {
    console.error('Error getting roast analytics:', error)
    return { success: false, error: 'Failed to get analytics' }
  }
}