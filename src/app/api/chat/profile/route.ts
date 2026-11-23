import { google } from '@ai-sdk/google';
import { GEMINI_MODEL_ID } from '@/lib/ai-model';
import { streamText, convertToModelMessages, type UIMessage, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { getServerSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import db from '@/lib/db';
import { profile, projects, experience, education, storyElements, socialLinks, media, galleryMedia, gallery } from '@/db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import { getProfileTools } from './tools';
import { ChatMessage } from '@/lib/types';
import { getSystemPrompt } from './prompt';
import { memoryForChat } from '@/lib/memory/search';
import { learnFromProfileLater } from '@/lib/memory/sources';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const limited = await checkRateLimit('ai', session.user.id);
  if (!limited.success) return limited.response!;

  const { messages }: { messages: ChatMessage[]; } = await req.json();

  // Fetch user profile
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
  });

  // Fetch all profile-related data
  const [userProjects, userExperience, userEducation, userStoryElements, userSocialLinks, galleryItems] = await Promise.all([
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
    userProfile ? db
      .select({
        ...getTableColumns(media),
        galleryMediaId: galleryMedia.id,
      })
      .from(gallery)
      .innerJoin(galleryMedia, eq(gallery.id, galleryMedia.galleryId))
      .innerJoin(media, eq(galleryMedia.mediaId, media.id))
      .where(eq(gallery.profileId, userProfile.id)) : [],
  ]);

  const userGallery = galleryItems as any[];

  // Determine if this is the first real interaction to show/hide greeting
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const isFirstMessage = assistantMessages.length === 0;

  // What Rize remembers that relates to their latest message (calls, posts, profile).
  const latestUserText = lastUserText(messages);
  const memory = latestUserText
    ? await memoryForChat(session.user.id, latestUserText).catch((error) => {
        console.error('[chat/profile] memory failed', error?.message);
        return '';
      })
    : '';

  const systemPrompt = getSystemPrompt({
    userProfile,
    userEducation,
    userExperience: userExperience || [],
    userProjects: userProjects || [],
    userStoryElements: userStoryElements || [],
    userSocialLinks: userSocialLinks || [],
    userGallery: userGallery || [],
    isFirstMessage
  }) + memory;

  // The chat may have changed their profile; memory catches up after the response.
  learnFromProfileLater({ userId: session.user.id });

  const result = streamText({
    model: google(GEMINI_MODEL_ID),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: getProfileTools(userProfile?.id, userProfile?.username || '', messages),
  });


  // Errors from the model (a retired model id, a quota, a bad key) arrive inside
  // the stream. Log the real one here; the person only sees a plain message,
  // except in development where the real message helps.
  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error('[chat/profile] stream error', error);
      if (process.env.NODE_ENV !== 'production') {
        return error instanceof Error ? error.message : String(error);
      }
      return "Couldn't reach the assistant. Try again.";
    },
  });
}

function lastUserText(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return '';
  return (last.parts ?? [])
    .map((p: any) => (p?.type === 'text' && typeof p.text === 'string' ? p.text : ''))
    .join(' ')
    .trim();
}
