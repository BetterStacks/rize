import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import db from '@/lib/db'
import { users, profile, experience, education, projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { call, transcript, type } = body?.message

        if (type !== 'end-of-call-report') {
            console.log("Type:", type)
            return NextResponse.json({ received: true })
        }

        // Find user by onboardingCallId
        const user = await db.query.users.findFirst({
            where: eq(users.onboardingCallId, call?.id),
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get user's profile
        const userProfile = await db.query.profile.findFirst({
            where: eq(profile.userId, user.id),
        })

        if (!userProfile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Send transcript to OpenAI for extraction
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

        const prompt = `Extract structured profile information from this conversation transcript. Return ONLY valid JSON.

        Transcript: ${transcript}

        Return this exact JSON structure:
        {
        "bio": "2-3 sentence bio based on their description",
        "personalMission": "extracted from 'what are you curious about' or 'what you want to get better at'",
        "lifePhilosophy": "extracted from their values or principles",
        "skills": ["skill1", "skill2", "skill3"],
        "experience": [
            {
            "title": "Job Title",
            "company": "Company Name",
            "description": "What they did",
            "startDate": "YYYY-MM-DD or null",
            "endDate": "YYYY-MM-DD or null",
            "currentlyWorking": true/false
            }
        ],
        "education": [
            {
            "school": "School Name",
            "degree": "Degree",
            "fieldOfStudy": "Field",
            "startDate": "YYYY-MM-DD or null",
            "endDate": "YYYY-MM-DD or null"
            }
        ],
        "projects": [
            {
            "name": "Project Name",
            "tagline": "One line description",
            "description": "Full description",
            "status": "wip" or "completed"
            }
        ]
        }

        If any section has no data, return empty array or null.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        })

        const extractedData = JSON.parse(completion.choices[0].message?.content || '{}')

        // ✅ If conversation was in Hindi, translate to English first
        let processedData = extractedData

        if (transcript.includes('हिन्दी') || transcript.includes('Hindi')) {
            const translationPrompt = `Translate this Hindi conversation data to English while preserving meaning:
            ${JSON.stringify(extractedData)}
            Return the same JSON structure but with English text.`

            const translation = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: translationPrompt
                }],
                response_format: { type: 'json_object' }
            })

            processedData = JSON.parse(translation.choices[0].message?.content || '{}')
        }

        // Update profile bio ONLY if fields are empty
        if (extractedData.bio && !userProfile.bio) {
            await db.update(profile).set({ bio: extractedData.bio }).where(eq(profile.id, userProfile.id))
        }

        // Insert experience ONLY if user has none
        const existingExp = await db.query.experience.findFirst({
            where: eq(experience.profileId, userProfile.id)
        })

        if (!existingExp && extractedData.experience?.length > 0) {
            for (const exp of extractedData.experience) {
                await db.insert(experience).values({
                    profileId: userProfile.id,
                    title: exp.title,
                    company: exp.company,
                    description: exp.description,
                    startDate: exp.startDate ? new Date(exp.startDate) : null,
                    endDate: exp.endDate ? new Date(exp.endDate) : null,
                    currentlyWorking: exp.currentlyWorking || false,
                })
            }
        }

        // Insert education ONLY if user has none
        const existingEdu = await db.query.education.findFirst({
            where: eq(education.profileId, userProfile.id)
        })

        if (!existingEdu && extractedData.education?.length > 0) {
            for (const edu of extractedData.education) {
                await db.insert(education).values({
                    profileId: userProfile.id,
                    school: edu.school,
                    degree: edu.degree,
                    fieldOfStudy: edu.fieldOfStudy,
                    startDate: edu.startDate ? new Date(edu.startDate) : null,
                    endDate: edu.endDate ? new Date(edu.endDate) : null,
                })
            }
        }

        // Insert projects ONLY if user has none
        const existingProj = await db.query.projects.findFirst({
            where: eq(projects.profileId, userProfile.id)
        })

        if (!existingProj && extractedData.projects?.length > 0) {
            for (const proj of extractedData.projects) {
                await db.insert(projects).values({
                    profileId: userProfile.id,
                    name: proj.name,
                    tagline: proj.tagline,
                    description: proj.description,
                    status: proj.status || 'wip',
                })
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
}