import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, type UIMessage, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { getServerSession } from '@/lib/auth';
import db from '@/lib/db';
import { profile, projects, experience, education, storyElements, socialLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileTools } from './tools';
import { ChatMessage } from '@/lib/types';
import { getSystemPrompt } from './prompt';

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

  // Determine if this is the first real interaction to show/hide greeting
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const isFirstMessage = assistantMessages.length === 0;

  const systemPrompt = getSystemPrompt({
    userProfile,
    userEducation,
    userExperience: userExperience || [],
    userProjects: userProjects || [],
    userStoryElements: userStoryElements || [],
    userSocialLinks: userSocialLinks || [],
    isFirstMessage
  });

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: getProfileTools(userProfile?.id, userProfile?.username || ''),
  });


  return result.toUIMessageStreamResponse()
}
