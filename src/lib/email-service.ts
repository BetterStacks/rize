// Initialize Loops client
const LOOPS_API_KEY = process.env.RIZE_LOOPS_API_KEY

if (!LOOPS_API_KEY) {
  console.warn('RIZE_LOOPS_API_KEY not found in environment variables')
}

// Loops API helper
const loops = {
  async sendTransactionalEmail(params: {
    transactionalId: string;
    email: string;
    dataVariables?: Record<string, any>;
  }) {
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Loops API error: ${response.status} - ${error}`)
    }

    return response.json()
  }
}

export interface EmailJobData {
  to: string;
  template: 'welcome' | 'followUp';
  userData: {
    name: string;
    email: string;
    username?: string;
    profileImage?: string;
    completionPercentage?: number;
  };
  scheduledFor?: Date;
}

export interface EmailJobOptions {
  delay?: number; // milliseconds
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export class EmailService {
  private static instance: EmailService
  
  private constructor() {}
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Send welcome email immediately after user signs up
   * Note: You need to create a 'welcome' transactional email template in your Loops dashboard
   */
  async sendWelcomeEmail(userData: EmailJobData['userData']): Promise<boolean> {
    try {
      if (!LOOPS_API_KEY) {
        console.error('RIZE_LOOPS_API_KEY not configured')
        return false
      }

      await loops.sendTransactionalEmail({
        transactionalId: 'welcome', // This should match your Loops template ID
        email: userData.email,
        dataVariables: {
          name: userData.name,
          username: userData.username || '',
          profileImage: userData.profileImage || '',
          // Add any other variables your welcome email template needs
        }
      })

      // Track email sent
      await this.trackEmailSent(userData.email, 'welcome')
      
      // Schedule follow-up email for 3 days later
      await this.scheduleFollowUpEmail(userData, 3 * 24 * 60 * 60 * 1000) // 3 days in ms
      
      return true
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  /**
   * Schedule follow-up email with delay
   */
  async scheduleFollowUpEmail(userData: EmailJobData['userData'], delayMs: number): Promise<void> {
    // Using a simple setTimeout for now - in production, use a proper job queue like Bull/BullMQ
    setTimeout(async () => {
      await this.sendFollowUpEmail(userData)
    }, delayMs)
    
    // For production, you'd add to a job queue:
    // await emailQueue.add('sendFollowUpEmail', { userData }, { delay: delayMs });
  }

  /**
   * Send follow-up email with profile completion nudge
   * Note: You need to create a 'follow-up' transactional email template in your Loops dashboard
   */
  async sendFollowUpEmail(userData: EmailJobData['userData']): Promise<boolean> {
    try {
      if (!LOOPS_API_KEY) {
        console.error('RIZE_LOOPS_API_KEY not configured')
        return false
      }

      // Calculate profile completion percentage
      const completionPercentage = await this.calculateProfileCompletion(userData.username)

      await loops.sendTransactionalEmail({
        transactionalId: 'follow-up', // This should match your Loops template ID
        email: userData.email,
        dataVariables: {
          name: userData.name,
          username: userData.username || '',
          profileImage: userData.profileImage || '',
          completionPercentage,
          // Add any other variables your follow-up email template needs
        }
      })

      // Track email sent
      await this.trackEmailSent(userData.email, 'followUp')
      
      return true
    } catch (error) {
      console.error('Error sending follow-up email:', error)
      return false
    }
  }

  /**
   * Calculate profile completion percentage based on filled sections
   */
  private async calculateProfileCompletion(username?: string): Promise<number> {
    if (!username) return 0

    try {
      // Import profile action to get user data
      const { getProfileByUsername } = await import('@/actions/profile-actions')
      const { getGalleryItems } = await import('@/actions/gallery-actions')
      const { getAllProjects } = await import('@/actions/project-actions')
      
      const profile = await getProfileByUsername(username)
      if (!profile) return 0

      const [gallery, projects] = await Promise.all([
        getGalleryItems(username),
        getAllProjects(username)
      ])

      let completedSections = 0
      const totalSections = 6 // profileImage, bio, gallery, projects, socialLinks, displayName

      // Check each section
      if (profile.profileImage) completedSections++
      if (profile.bio && profile.bio.length > 20) completedSections++
      if (profile.displayName) completedSections++
      if (gallery && gallery.length > 0) completedSections++
      if (projects && projects.length > 0) completedSections++
      // if (profile.socialLinks && profile.socialLinks.length > 0) completedSections++

      return Math.round((completedSections / totalSections) * 100)
    } catch (error) {
      console.error('Error calculating profile completion:', error)
      return 0
    }
  }

  /**
   * Track email sent to database for analytics
   */
  private async trackEmailSent(email: string, template: string): Promise<void> {
    try {
      // This would insert into an email_tracking table
      // For now, just log it
      console.log(`Email tracked: ${template} sent to ${email}`)
      
      // In production:
      // await db.insert(emailTracking).values({
      //   email,
      //   template,
      //   sentAt: new Date(),
      //   status: 'sent'
      // });
    } catch (error) {
      console.error('Error tracking email:', error)
    }
  }

  /**
   * Check if user should receive email (not unsubscribed, not too many emails, etc.)
   */
  async shouldSendEmail(email: string, template: string): Promise<boolean> {
    try {
      // Check unsubscribe status, rate limits, etc.
      // For now, always return true
      return true
      
      // In production:
      // const recentEmails = await db.select()
      //   .from(emailTracking)
      //   .where(and(
      //     eq(emailTracking.email, email),
      //     eq(emailTracking.template, template),
      //     gte(emailTracking.sentAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      //   ));
      // 
      // return recentEmails.length === 0;
    } catch (error) {
      console.error('Error checking email eligibility:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()