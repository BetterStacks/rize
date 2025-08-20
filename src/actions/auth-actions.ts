'use server'

import db from '@/lib/db'
import { profile, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Server action to create profile after OAuth signup
 * Client passes the claimed username instead of reading cookies server-side
 */
export async function createProfileAfterOAuth(
  userId: string, 
  userInfo: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  },
  claimedUsername?: string
) {
  console.log('🔍 createProfileAfterOAuth called with:', { userId, userInfo, claimedUsername })
  
  try {
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1)
    
    if (existingProfile.length > 0) {
      console.log(`Profile already exists for user ${userId}`)
      return { success: true, profileId: existingProfile[0].id, username: existingProfile[0].username }
    }

    console.log('🔍 Using claimed username:', claimedUsername)

    // Generate final username
    let finalUsername: string
    
    if (claimedUsername) {
      // Check if claimed username is available
      const existingUser = await db
        .select()
        .from(profile)
        .where(eq(profile.username, claimedUsername.toLowerCase()))
        .limit(1)
      
      if (existingUser.length === 0) {
        finalUsername = claimedUsername.toLowerCase()
        console.log(`Using claimed username: ${finalUsername}`)
      } else {
        // Username taken, generate alternative
        const baseUsername = claimedUsername.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)
        finalUsername = `${baseUsername}${Math.floor(Math.random() * 999) + 1}`
        console.log(`Claimed username taken, using: ${finalUsername}`)
      }
    } else {
      // Generate username from user info
      const baseUsername = userInfo.name?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) || 'user'
      finalUsername = `${baseUsername}${Math.floor(Math.random() * 999) + 1}`
      console.log(`No claimed username, generated: ${finalUsername}`)
    }

    // Create the profile
    const [newProfile] = await db.insert(profile).values({
      userId: userId,
      username: finalUsername,
      displayName: userInfo.name || finalUsername,
      profileImage: userInfo.image || null,
      isLive: true,
    }).returning()

    console.log(`✅ Created profile for ${userInfo.name} with username: ${finalUsername}`)

    return { success: true, profileId: newProfile.id, username: finalUsername }
    
  } catch (error) {
    console.error('Error creating profile after OAuth:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}