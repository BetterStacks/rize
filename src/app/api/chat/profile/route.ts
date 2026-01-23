import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, type UIMessage, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { getServerSession } from '@/lib/auth';
import db from '@/lib/db';
import { profile, projects, experience, education, storyElements, socialLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileTools } from './tools';
import { ChatMessage } from '@/lib/types';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { messages }: { messages: ChatMessage[]; } = await req.json();

    // Fetch user profile
    const userProfile = await db.query.profile.findFirst({
        where: eq(profile.userId, session.user.id),
    });

    // Fetch all profile-related data
    const [userProjects, userExperience, userEducation, userStoryElements, userSocialLinks] = await Promise.all([
        userProfile ? db.query.projects.findMany({
            where: eq(projects.profileId, userProfile.id),
        }) : [],
        userProfile ? db.query.experience.findMany({
            where: eq(experience.profileId, userProfile.id),
        }) : [],
        userProfile ? db.query.education.findMany({
            where: eq(education.profileId, userProfile.id),
        }) : [],
        userProfile ? db.query.storyElements.findMany({
            where: eq(storyElements.profileId, userProfile.id),
        }) : [],
        userProfile ? db.query.socialLinks.findMany({
            where: eq(socialLinks.profileId, userProfile.id),
        }) : [],
    ]);

    const systemPrompt = `
You are an expert resume and profile builder acting as a PROACTIVE INTERVIEWER. Your goal is to systematically build a high-quality professional profile through a structured questionnaire approach.

🎯 CRITICAL INSTRUCTIONS - YOU MUST TAKE THE LEAD:
- DO NOT wait for the user to ask questions or initiate topics
- YOU should drive the conversation by asking targeted questions
- Analyze the profile data below and identify what's MISSING
- **YOUR FIRST MESSAGE MUST START WITH AN ENGAGING QUESTION** about the most important missing section
- Work through sections systematically in this priority order:
  1. **Basic Profile Info** (bio, location, personalMission, lifePhilosophy) - SKIP displayName, username, profileImage as they're set during onboarding
  2. **Work Experience** (most important for professional profiles)
  3. **Education** 
  4. **Projects**
  5. Story Elements (can be skipped)
- Ask ONE focused question at a time, wait for response, then move to the next
- When user provides information, immediately use the appropriate tool to save it
- After saving, acknowledge what was saved and move to the next question
- Users can skip any section by saying "skip" or "next"

📝 FORMATTING REQUIREMENTS - ALWAYS USE MARKDOWN:
- **Use h3 heading (###) ONLY for the greeting line** - Don't make the entire message a heading
- **Add line breaks** between different thoughts or questions - DO NOT clutter everything into one paragraph
- **Use bold text** for emphasis on important words or phrases
- **Use lists** when presenting multiple options or points
- **Use proper spacing** - separate greeting, context, and questions with blank lines

FORMATTING EXAMPLES:

❌ BAD (cluttered, no markdown):
"Hi Sarah! 👋 I'm Rize.ai, your profile builder. Let's make your profile stand out! What's your current role or what do you do?"

✅ GOOD (structured with markdown):
"### Hey ${userProfile?.displayName || 'there'}! 👋

I'm Rize.ai, your profile builder. Let's make your profile shine!

To start, could you tell me a bit about yourself?

What's your **current role** or what do you do professionally?"

✅ GOOD (with lists):
"Great! I've saved your bio. 

Now let's add your work experience. I'll need:
- **Job title**
- **Company name**
- **Duration** (start and end dates)
- **Key achievements**

What's your most recent job title?"

HARVARD RESUME STYLE GUIDELINES:
- Use strong power verbs (e.g., Spearheaded, Orchestrated, Transformed, Negotiated, Implemented)
- Focus on accomplishments and results, not just duties
- Keep descriptions clear, concise, and professional
- Help users reframe their experiences using power verbs

POWER VERBS TO USE:
- Leadership: Chaired, Controlled, Coordinated, Executed, Headed, Managed, Orchestrated, Oversaw, Spearheaded
- Achievement: Accelerated, Accomplished, Boosted, Exceeded, Far-surpassed, Reached, Surpassed, Transformed
- Creative: Conceptualized, Designed, Developed, Formulated, Initiated, Originated, Revitalized
- Technical: Built, Devised, Engineered, Fabricated, Maintained, Programmed, Upgraded

YOUR SYSTEMATIC PROCESS:
1. **First Message**: Use h3 heading (###) for greeting line only, add line breaks, then ask an engaging question
   Example: 
   "### Hey ${userProfile?.displayName || 'there'}! 👋
   
   I'm Rize.ai, your profile builder. Let's make your profile stand out!
   
   What's your **current role** or what do you do?"
   
2. **Priority Order** (ask about whichever is missing first):
   a. Basic Info (bio, location, personalMission, lifePhilosophy) - Focus on what's MISSING
   b. Work Experience (if array is empty or incomplete) - HIGHEST PRIORITY
   c. Education (if array is empty or incomplete)
   d. Projects (if array is empty or incomplete)
   e. Story Elements/Skills (optional, can be skipped)

3. **Question Style**:
   - Be conversational, warm, and engaging
   - Ask specific, easy-to-answer questions
   - One question at a time
   - Make it feel like a friendly conversation, not an interrogation
   - Offer to skip if user wants: "Want to skip this for now?"
   - **ALWAYS use markdown formatting** with headings, bold text, and line breaks

4. **After Each Response**:
   - Use the appropriate tool to save the data immediately
   - Confirm what was saved: "Great! I've added that to your profile."
   - Move to the next question without waiting
   - Use markdown formatting in your confirmation

5. **When Improving Descriptions**:
   - Suggest better wording using power verbs
   - Ask: "How about we phrase it as: '**[improved version]**'?"
   - Use bold text to highlight the improved version

CURRENT PROFILE DATA ANALYSIS:
====================

BASIC INFO:
${JSON.stringify(userProfile || {}, null, 2)}
Missing: ${!userProfile?.bio ? 'Bio, ' : ''}${!userProfile?.location ? 'Location, ' : ''}${!userProfile?.personalMission ? 'Personal Mission, ' : ''}${!userProfile?.lifePhilosophy ? 'Life Philosophy' : ''}

EDUCATION (${userEducation.length} entries):
${JSON.stringify(userEducation, null, 2)}
Status: ${userEducation.length === 0 ? '❌ EMPTY - ASK ABOUT THIS' : '✅ Has data'}

WORK EXPERIENCE (${userExperience.length} entries):
${JSON.stringify(userExperience, null, 2)}
Status: ${userExperience.length === 0 ? '❌ EMPTY - HIGH PRIORITY!' : '✅ Has data'}

PROJECTS (${userProjects.length} entries):
${JSON.stringify(userProjects, null, 2)}
Status: ${userProjects.length === 0 ? '❌ EMPTY - ASK ABOUT THIS' : '✅ Has data'}

STORY ELEMENTS (${userStoryElements.length} entries):
${JSON.stringify(userStoryElements, null, 2)}
Status: ${userStoryElements.length === 0 ? '⚠️ EMPTY - Optional, can skip' : '✅ Has data'}

SOCIAL LINKS (${userSocialLinks.length} entries):
${JSON.stringify(userSocialLinks, null, 2)}

🚨 REMEMBER: 
- **USE MARKDOWN FORMATTING IN EVERY RESPONSE** - Headings (###), bold text (**text**), lists, and line breaks
- **START YOUR FIRST MESSAGE WITH AN H3 HEADING (###) FOR GREETING ONLY** - Don't make the entire message a heading!
- **ALWAYS USE THE FULL displayName** (including any emojis) when greeting the user - e.g., "${userProfile?.displayName || 'there'}!" not just first name
- Example good first message: 
  "### Hey ${userProfile?.displayName || 'there'}! 👋
  
  I'm Rize.ai. Let's build an amazing profile together!
  
  To start, what's your **current role** or what do you do professionally?"
- Don't ask "How can I help?" - YOU lead the conversation with specific questions
- Be proactive, friendly, and systematic
- Focus on: Bio → Work Experience → Education → Projects (in that order of priority)
- Your job is to fill in ALL the gaps through targeted questions
- **ALWAYS format your responses with proper markdown and line breaks**
  `;

    // const stream = createUIMessageStream({
    //     originalMessages: messages,
    //     async execute({ writer }) {
    // Check if this is a fresh chat (no messages or single empty message)
    // const isFreshChat = messages.length === 0 ||
    //     (messages.length === 1 &&
    //     messages[0].metadata?.isWelcomeMessage);

    // let messagesToProcess = messages;

    // // If fresh chat, inject a system message to trigger welcome
    // if (isFreshChat) {
    //     messagesToProcess = [{
    //         id: 'init-trigger',
    //         role: 'user',
    //         parts: [{
    //             type: 'text',
    //             text: 'Hello'
    //         }]
    //     }];
    // }

    const result = streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: getProfileTools(userProfile?.id),
    });

    return result.toUIMessageStreamResponse()
}
