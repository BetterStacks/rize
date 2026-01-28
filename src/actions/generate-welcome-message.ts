'use server'

import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { profile, projects, experience, education } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function generateWelcomeMessage() {
    const session = await getServerSession()
    if (!session?.user) {
        return "Hi! I'm Rize.ai, your AI profile builder. Let's create an amazing profile together! To get started, what do you do professionally?"
    }

    // Fetch user profile
    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    })

    if (!userProfile) {
        return "Hi! I'm Rize.ai, your AI profile builder. Let's create an amazing profile together! To get started, what do you do professionally?"
    }

    // Fetch profile data counts
    const [userExperience, userEducation, userProjects] = await Promise.all([
        db.query.experience.findMany({
            where: eq(experience.profileId, userProfile.id),
        }),
        db.query.education.findMany({
            where: eq(education.profileId, userProfile.id),
        }),
        db.query.projects.findMany({
            where: eq(projects.profileId, userProfile.id),
        }),
    ])

    const displayName = userProfile.displayName || 'there'

    // Determine what's missing
    const missingBio = !userProfile.bio
    const missingLocation = !userProfile.location
    const missingPersonalMission = !userProfile.personalMission
    const missingWorkExperience = userExperience.length === 0
    const missingEducation = userEducation.length === 0
    const missingProjects = userProjects.length === 0

    // Generate AI welcome message
    const prompt = `You are Rize.ai, a friendly AI profile builder assistant. Generate a warm, personalized welcome message for ${displayName}.

Profile Status:
- Bio: ${missingBio ? 'MISSING' : 'Complete'}
- Location: ${missingLocation ? 'MISSING' : 'Complete'}
- Personal Mission: ${missingPersonalMission ? 'MISSING' : 'Complete'}
- Work Experience: ${missingWorkExperience ? 'MISSING (0 entries)' : `Complete (${userExperience.length} entries)`}
- Education: ${missingEducation ? 'MISSING (0 entries)' : `Complete (${userEducation.length} entries)`}
- Projects: ${missingProjects ? 'MISSING (0 entries)' : `Complete (${userProjects.length} entries)`}

Priority order for questions:
1. Bio (if missing)
2. Work Experience (if missing) - HIGHEST PRIORITY
3. Education (if missing)
4. Projects (if missing)

Instructions:
- Start with a warm greeting using their name
- Immediately follow with an engaging question about the FIRST missing section (highest priority)
- Keep it conversational and friendly
- Make it feel natural, not robotic
- The message should be 2-3 sentences max

Example format:
"Hi [Name]! 👋 I'm Rize.ai, your profile builder. Let's make your profile stand out! [Engaging question about first missing section]"

Generate ONLY the welcome message text, nothing else.`

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt,
            maxOutputTokens: 150,
        })

        return text.trim()
    } catch (error) {
        console.error('Error generating welcome message:', error)
        // Fallback message
        if (missingBio) {
            return `Hi ${displayName}! 👋 I'm Rize.ai, your profile builder. Let's create an amazing profile together! To start, tell me a bit about yourself - what do you do?`
        } else if (missingWorkExperience) {
            return `Hi ${displayName}! 👋 I'm Rize.ai. Let's build out your professional experience! What's your current or most recent job title?`
        } else if (missingEducation) {
            return `Hi ${displayName}! 👋 I'm Rize.ai. Let's add your education background! Where did you study?`
        } else {
            return `Hi ${displayName}! 👋 I'm Rize.ai. Your profile is looking good! How can I help you improve it further?`
        }
    }
}
