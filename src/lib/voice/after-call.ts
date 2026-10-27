import {
  education,
  experience,
  posts,
  profile,
  projects,
  voiceCalls,
  voiceDrafts,
  type TTranscriptTurn,
} from "@/db/schema";
import db from "@/lib/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import OpenAI from "openai";

const TEXT_MODEL = process.env.VOICE_TEXT_MODEL || "gpt-4o-mini";

const openai = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export function transcriptToText(transcript: TTranscriptTurn[]) {
  return transcript
    .map((t) => `${t.role === "user" ? "User" : "Interviewer"}: ${t.text.trim()}`)
    .join("\n");
}

async function profileIdForUser(userId: string) {
  const row = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
    columns: { id: true },
  });
  return row?.id ?? null;
}

const DRAFT_SYSTEM_PROMPT = `You turn a voice journaling call into short social posts that the speaker could have written themselves.

Rules:
- Use ONLY what the user (not the interviewer) actually said. Never invent facts, numbers, names or outcomes.
- Write in first person, in the user's own voice: reuse their phrasing, their level of formality, their slang. If they spoke Hindi or Hinglish, write the post in the same language mix they used.
- It must not sound AI-written. No hooks like "Here's the thing", no "I'm thrilled/excited to share", no "delve", "journey", "game-changer", "in today's fast-paced world", no rhetorical question openers, no lists of lessons, no hashtags, no emojis unless the user's own past posts use them.
- Each post covers one specific thread from the call (a moment, a lesson, a thing they built). Plain sentences, 40-180 words.
- Return 2 or 3 posts. If the call has material for only 2 genuinely different posts, return 2. If the user said almost nothing usable, return an empty list.

Return JSON: {"posts": ["...", "..."]}`;

// Creates 2-3 drafts for a finished journal call. Drafts are never published
// automatically; the user publishes them from the drafts screen.
export async function generateDraftsForCall(callId: string) {
  const call = await db.query.voiceCalls.findFirst({
    where: eq(voiceCalls.id, callId),
  });
  if (!call || call.draftsGeneratedAt) return 0;

  const transcript = call.transcript ?? [];
  const userWords = transcript
    .filter((t) => t.role === "user")
    .reduce((n, t) => n + t.text.split(/\s+/).length, 0);

  const profileId = await profileIdForUser(call.userId);
  if (!profileId || userWords < 40) {
    await db
      .update(voiceCalls)
      .set({ draftsGeneratedAt: new Date() })
      .where(eq(voiceCalls.id, callId));
    return 0;
  }

  // A few of their published posts show the model how they actually write.
  const pastPosts = await db
    .select({ content: posts.content })
    .from(posts)
    .where(eq(posts.profileId, profileId))
    .orderBy(desc(posts.createdAt))
    .limit(5);
  const styleSamples = pastPosts
    .map((p) => p.content?.trim())
    .filter(Boolean)
    .map((c) => `---\n${c!.slice(0, 800)}`)
    .join("\n");

  const completion = await openai().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: DRAFT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `${styleSamples ? `The user's past posts (for voice only, don't reuse their content):\n${styleSamples}\n\n` : ""}Call transcript:\n${transcriptToText(transcript)}`,
      },
    ],
  });

  let drafts: string[] = [];
  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    drafts = Array.isArray(parsed.posts)
      ? parsed.posts.filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0)
      : [];
  } catch {
    drafts = [];
  }
  drafts = drafts.slice(0, 3);

  // Claim the call first so a retry running in parallel can't double-insert.
  const claimed = await db
    .update(voiceCalls)
    .set({ draftsGeneratedAt: new Date() })
    .where(and(eq(voiceCalls.id, callId), isNull(voiceCalls.draftsGeneratedAt)))
    .returning({ id: voiceCalls.id });
  if (claimed.length === 0) return 0;

  if (drafts.length > 0) {
    await db.insert(voiceDrafts).values(
      drafts.map((content) => ({ callId, profileId, content: content.trim() }))
    );
  }
  return drafts.length;
}

// Rebuilt from the old Vapi end-of-call webhook: fills empty profile sections
// from the onboarding conversation. Existing data is never overwritten.
export async function applyOnboardingTranscript(callId: string) {
  const call = await db.query.voiceCalls.findFirst({
    where: eq(voiceCalls.id, callId),
  });
  if (!call?.transcript?.length) return;

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, call.userId),
  });
  if (!userProfile) return;

  const completion = await openai().chat.completions.create({
    model: TEXT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extract profile information from an onboarding call transcript. Use only what the user said. The call may be in Hindi, English or a mix; always write the output in English. Return ONLY valid JSON with this shape:
{
  "bio": "2-3 sentence first-person bio, or null",
  "personalMission": "what they're curious about or want to get better at, or null",
  "lifePhilosophy": "their values or principles, or null",
  "experience": [{"title": "", "company": "", "description": "", "startDate": "YYYY-MM-DD or null", "endDate": "YYYY-MM-DD or null", "currentlyWorking": false}],
  "education": [{"school": "", "degree": "", "fieldOfStudy": "", "startDate": "YYYY-MM-DD or null", "endDate": "YYYY-MM-DD or null"}],
  "projects": [{"name": "", "tagline": "", "description": "", "status": "wip or completed"}]
}
Use empty arrays or null when there is no data.`,
      },
      { role: "user", content: transcriptToText(call.transcript) },
    ],
  });

  let data: any = {};
  try {
    data = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch {
    return;
  }

  const toDate = (value: unknown) => {
    if (typeof value !== "string") return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const profileUpdates: Partial<typeof profile.$inferInsert> = {};
  if (data.bio && !userProfile.bio) profileUpdates.bio = String(data.bio);
  if (data.personalMission && !userProfile.personalMission)
    profileUpdates.personalMission = String(data.personalMission);
  if (data.lifePhilosophy && !userProfile.lifePhilosophy)
    profileUpdates.lifePhilosophy = String(data.lifePhilosophy);
  if (Object.keys(profileUpdates).length) {
    await db.update(profile).set(profileUpdates).where(eq(profile.id, userProfile.id));
  }

  const [hasExp, hasEdu, hasProj] = await Promise.all([
    db.query.experience.findFirst({ where: eq(experience.profileId, userProfile.id) }),
    db.query.education.findFirst({ where: eq(education.profileId, userProfile.id) }),
    db.query.projects.findFirst({ where: eq(projects.profileId, userProfile.id) }),
  ]);

  if (!hasExp && Array.isArray(data.experience) && data.experience.length) {
    const rows = data.experience
        .filter((e: any) => e?.title || e?.company)
        .map((e: any) => ({
          profileId: userProfile.id,
          title: e.title ?? null,
          company: e.company ?? null,
          description: e.description ?? null,
          startDate: toDate(e.startDate),
          endDate: toDate(e.endDate),
          currentlyWorking: Boolean(e.currentlyWorking),
        }));
    if (rows.length) await db.insert(experience).values(rows);
  }

  if (!hasEdu && Array.isArray(data.education) && data.education.length) {
    const rows = data.education
        .filter((e: any) => e?.school)
        .map((e: any) => ({
          profileId: userProfile.id,
          school: e.school,
          degree: e.degree ?? null,
          fieldOfStudy: e.fieldOfStudy ?? null,
          startDate: toDate(e.startDate),
          endDate: toDate(e.endDate),
        }));
    if (rows.length) await db.insert(education).values(rows);
  }

  if (!hasProj && Array.isArray(data.projects) && data.projects.length) {
    const rows = data.projects
        .filter((p: any) => p?.name)
        .map((p: any) => ({
          profileId: userProfile.id,
          name: p.name,
          tagline: p.tagline ?? null,
          description: p.description ?? null,
          status: p.status === "completed" ? ("completed" as const) : ("wip" as const),
        }));
    if (rows.length) await db.insert(projects).values(rows);
  }
}
