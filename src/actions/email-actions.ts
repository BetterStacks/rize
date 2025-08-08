'use server'

import { emailService } from '@/lib/email-service'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { emailPreferences, emailTracking } from '@/db/email-schema'
import { users } from '@/db/schema'
import { eq, gte } from 'drizzle-orm'
import { v4 } from 'uuid'

export interface EmailJobPayload {
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
}

/**
 * Trigger welcome email sequence when user completes signup
 * Called from OnboardingFlow.tsx after profile creation
 */
export async function triggerWelcomeEmailSequence(userData: EmailJobPayload) {
  try {
    // Check if user has email preferences (first time users won't)
    const preferences = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.userId, userData.email))
      .limit(1)

    // Create default email preferences for new users
    if (preferences.length === 0) {
      await db.insert(emailPreferences).values({
        userId: userData.email,
        onboardingEmails: true,
        weeklyDigest: true,
        featureAnnouncements: true,
        marketingEmails: false,
        unsubscribeToken: v4(),
      })
    }

    // Check if user wants onboarding emails
    const userPrefs = preferences[0]
    if (userPrefs && !userPrefs.onboardingEmails) {
      console.log(`User ${userData.email} opted out of onboarding emails`)
      return { success: false, message: 'User opted out of onboarding emails' }
    }

    // Send immediate welcome email
    const welcomeSent = await emailService.sendWelcomeEmail(userData)
    
    if (!welcomeSent) {
      throw new Error('Failed to send welcome email')
    }

    return { success: true, message: 'Welcome email sequence triggered' }
  } catch (error) {
    console.error('Error triggering welcome email sequence:', error)
    return { success: false, message: 'Failed to trigger email sequence' }
  }
}

/**
 * Manually trigger follow-up email (for testing or admin use)
 */
export async function triggerFollowUpEmail(email: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Get user data
    const user = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (user.length === 0) {
      throw new Error('User not found')
    }

    const userData = {
      name: user[0].name || 'User',
      email: user[0].email!,
    }

    const followUpSent = await emailService.sendFollowUpEmail(userData)
    
    if (!followUpSent) {
      throw new Error('Failed to send follow-up email')
    }

    return { success: true, message: 'Follow-up email sent' }
  } catch (error) {
    console.error('Error sending follow-up email:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

/**
 * Update user email preferences
 */
export async function updateEmailPreferences(preferences: {
  onboardingEmails?: boolean;
  weeklyDigest?: boolean;
  featureAnnouncements?: boolean;
  marketingEmails?: boolean;
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    await db
      .update(emailPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(emailPreferences.userId, session.user.id))

    return { success: true, message: 'Email preferences updated' }
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return { success: false, message: 'Failed to update preferences' }
  }
}

/**
 * Unsubscribe user from all emails using token
 */
export async function unsubscribeFromEmails(token: string) {
  try {
    const result = await db
      .update(emailPreferences)
      .set({
        onboardingEmails: false,
        weeklyDigest: false,
        featureAnnouncements: false,
        marketingEmails: false,
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailPreferences.unsubscribeToken, token))

    return { success: true, message: 'Successfully unsubscribed from all emails' }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, message: 'Failed to unsubscribe' }
  }
}

/**
 * Get email analytics for admin dashboard
 */
export async function getEmailAnalytics(days: number = 30) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const analytics = await db
      .select({
        template: emailTracking.template,
        status: emailTracking.status,
        sentAt: emailTracking.sentAt,
        openedAt: emailTracking.openedAt,
        clickedAt: emailTracking.clickedAt,
      })
      .from(emailTracking)
      .where(gte(emailTracking.createdAt, startDate))

    // Calculate metrics
    const totalSent = analytics.filter(e => e.status === 'sent').length
    const totalOpened = analytics.filter(e => e.openedAt).length
    const totalClicked = analytics.filter(e => e.clickedAt).length

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

    // Group by template
    const byTemplate = analytics.reduce((acc, email) => {
      if (!acc[email.template]) {
        acc[email.template] = { sent: 0, opened: 0, clicked: 0 }
      }
      if (email.status === 'sent') acc[email.template].sent++
      if (email.openedAt) acc[email.template].opened++
      if (email.clickedAt) acc[email.template].clicked++
      return acc
    }, {} as Record<string, { sent: number; opened: number; clicked: number }>)

    return {
      success: true,
      data: {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        byTemplate,
      },
    }
  } catch (error) {
    console.error('Error getting email analytics:', error)
    return { success: false, message: 'Failed to get analytics' }
  }
}

/**
 * Check if user should receive a specific email type
 */
export async function canSendEmail(userId: string, template: string): Promise<boolean> {
  try {
    // Check user preferences
    const preferences = await db
      .select()
      .from(emailPreferences) 
      .where(eq(emailPreferences.userId, userId))
      .limit(1)

    if (preferences.length === 0) return true // New users can receive emails

    const prefs = preferences[0]
    
    // Check if user is globally unsubscribed
    if (prefs.unsubscribedAt) return false

    // Check specific template preferences
    switch (template) {
      case 'welcome':
      case 'followUp':
        return prefs.onboardingEmails
      case 'weekly_digest':
        return prefs.weeklyDigest
      case 'feature_announcement':
        return prefs.featureAnnouncements
      default:
        return false
    }
  } catch (error) {
    console.error('Error checking email permissions:', error)
    return false
  }
}