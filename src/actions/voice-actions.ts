"use server";

import {
  education,
  experience,
  media,
  postMedia,
  posts,
  profile,
  projects,
  users,
  voiceCalls,
  voiceDrafts,
  type TProfileSuggestions,
  type TVoiceDraftMedia,
} from "@/db/schema";
import { auth, requireAuth, requireAuthWithProfile, requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteFromS3, getOwnS3KeyFromUrl } from "@/lib/s3";
import { isImageUrl } from "@/lib/utils";
import { generateDraftsForCall } from "@/lib/voice/after-call";
import { findPendingOnboardingSuggestions } from "@/lib/voice/pending-suggestions";
import { SUGGESTION_TEXT_LIMITS, cleanPlainText, suggestionDate } from "@/lib/voice/profile-suggestions";
import { deleteRecording } from "@/lib/voice/r2";
import { twilioClient } from "@/lib/voice/twilio";
import { and, desc, eq, inArray, isNotNull, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter the number with country code");
const draftContentSchema = z.string().trim().min(1, "Draft can't be empty").max(5000);

type ActionResult = { success: true } | { success: false; error: string };

// Phone verification results carry a code so the form can show its own copy.
export type PhoneVerifyErrorCode =
  | "invalid_number"
  | "rate_limited"
  | "taken"
  | "send_failed"
  | "wrong_code"
  | "expired";
type PhoneVerifyResult = { success: true } | { success: false; error: string; code: PhoneVerifyErrorCode };

// The signed-in user's id, from the session alone. These two actions are on
// the "send code" critical path and don't need the profile join that
// requireAuth adds, so this saves a database round trip before Twilio.
async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Authentication required");
  return session.user.id;
}

// --- Phone number verification (Twilio Verify, same service as phone login) ---

export async function sendPhoneVerification(phoneNumber: string): Promise<PhoneVerifyResult> {
  const userId = await requireUserId();
  const parsed = phoneSchema.safeParse(phoneNumber);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: "invalid_number" };
  }

  // Independent checks, run together. Both must pass before any SMS is sent.
  const [{ success }, taken] = await Promise.all([
    checkRateLimit("auth", `voice-otp:${userId}`),
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phoneNumber, parsed.data), ne(users.id, userId)))
      .limit(1),
  ]);
  if (!success) {
    return { success: false, error: "Too many attempts. Wait a minute and try again.", code: "rate_limited" };
  }
  if (taken.length) {
    return { success: false, error: "This number is linked to another account", code: "taken" };
  }

  try {
    await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: parsed.data, channel: "sms" });
    return { success: true };
  } catch (error: any) {
    console.error("[voice] send verification failed", error?.code, error?.message);
    return { success: false, error: "Couldn't send the code. Check the number and try again.", code: "send_failed" };
  }
}

export async function confirmPhoneVerification(
  phoneNumber: string,
  code: string
): Promise<PhoneVerifyResult> {
  const userId = await requireUserId();
  const parsed = phoneSchema.safeParse(phoneNumber);
  if (!parsed.success || !/^\d{4,10}$/.test(code)) {
    return { success: false, error: "Invalid code", code: "wrong_code" };
  }

  const { success } = await checkRateLimit("auth", `voice-otp:${userId}`);
  if (!success) {
    return { success: false, error: "Too many attempts. Wait a minute and try again.", code: "rate_limited" };
  }

  try {
    const check = await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: parsed.data, code });
    if (check.status !== "approved") return { success: false, error: "Wrong code", code: "wrong_code" };
  } catch (error: any) {
    console.error("[voice] verification check failed", error?.code, error?.message);
    return { success: false, error: "Code expired or invalid. Request a new one.", code: "expired" };
  }

  try {
    await db
      .update(users)
      .set({ phoneNumber: parsed.data, phoneNumberVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch {
    return { success: false, error: "This number is linked to another account", code: "taken" };
  }

  // No revalidatePath here: it would re-render the page the form is on, and
  // on a profile that unmounts the setup dialog before the call starts.
  // Callers refresh when they're ready (VoiceJournal does on verify).
  return { success: true };
}

// --- Removing data ---

// Deletes one call: its recording, transcript and any drafts made from it.
// Posts already published from those drafts stay up; they can be deleted
// from the profile like any other post.
export async function deleteVoiceCall(callId: string): Promise<ActionResult> {
  const session = await requireAuth();
  const [call] = await db
    .select({ id: voiceCalls.id, status: voiceCalls.status, recordingKey: voiceCalls.recordingKey })
    .from(voiceCalls)
    .where(and(eq(voiceCalls.id, callId), eq(voiceCalls.userId, session.user.id)))
    .limit(1);
  if (!call) return { success: false, error: "Call not found" };
  if (["queued", "ringing", "in_progress"].includes(call.status)) {
    return { success: false, error: "This call is still in progress. Try again when it has ended." };
  }

  if (call.recordingKey) {
    try {
      await deleteRecording(call.recordingKey);
    } catch (error: any) {
      console.error("[voice] recording delete failed", call.id, error?.name);
      return { success: false, error: "Couldn't delete the recording. Please try again." };
    }
  }

  // Files attached to unshared drafts go with them; a shared post keeps its own.
  const draftFiles = await db
    .select({ media: voiceDrafts.media })
    .from(voiceDrafts)
    .where(and(eq(voiceDrafts.callId, call.id), eq(voiceDrafts.status, "draft"), isNotNull(voiceDrafts.media)));

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ onboardingCallId: null })
      .where(and(eq(users.id, session.user.id), eq(users.onboardingCallId, call.id)));
    // Drafts are removed by the foreign key cascade.
    await tx
      .delete(voiceCalls)
      .where(and(eq(voiceCalls.id, call.id), eq(voiceCalls.userId, session.user.id)));
  });
  for (const { media: file } of draftFiles) await removeDraftMediaFile(file);
  revalidatePath("/settings/voice");
  return { success: true };
}

// Removes the phone number from the account, so Rize can't call it and calls
// from it aren't linked to the account. Accounts that sign in with their phone
// number keep it, since it's how they log in.
export async function removeMyPhoneNumber(): Promise<ActionResult> {
  const session = await requireAuth();
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!user) return { success: false, error: "Account not found" };
  if (user.email?.endsWith("@phone.rize")) {
    return {
      success: false,
      error: "You sign in with this number, so it can't be removed. Rize only calls you when you tap Call me.",
    };
  }
  const live = await db
    .select({ id: voiceCalls.id })
    .from(voiceCalls)
    .where(
      and(
        eq(voiceCalls.userId, session.user.id),
        inArray(voiceCalls.status, ["queued", "ringing", "in_progress"])
      )
    )
    .limit(1);
  if (live.length) return { success: false, error: "A call is in progress. Try again when it has ended." };

  await db
    .update(users)
    .set({ phoneNumber: null, phoneNumberVerified: false })
    .where(eq(users.id, session.user.id));
  revalidatePath("/settings/voice");
  return { success: true };
}

// --- Call history ---

export async function getMyVoiceCalls() {
  const session = await requireAuth();
  return db
    .select({
      id: voiceCalls.id,
      kind: voiceCalls.kind,
      status: voiceCalls.status,
      transcript: voiceCalls.transcript,
      hasRecording: voiceCalls.recordingKey,
      recordingExpiresAt: voiceCalls.recordingExpiresAt,
      durationSeconds: voiceCalls.durationSeconds,
      error: voiceCalls.error,
      draftsGeneratedAt: voiceCalls.draftsGeneratedAt,
      createdAt: voiceCalls.createdAt,
    })
    .from(voiceCalls)
    .where(eq(voiceCalls.userId, session.user.id))
    .orderBy(desc(voiceCalls.createdAt))
    .limit(50)
    .then((rows) =>
      rows.map((r) => ({
        ...r,
        hasRecording:
          !!r.hasRecording && (!r.recordingExpiresAt || r.recordingExpiresAt > new Date()),
      }))
    );
}

export async function retryDraftGeneration(callId: string): Promise<ActionResult> {
  const session = await requireAuth();
  const call = await db.query.voiceCalls.findFirst({
    where: and(eq(voiceCalls.id, callId), eq(voiceCalls.userId, session.user.id)),
    columns: { id: true, status: true, draftsGeneratedAt: true },
  });
  if (!call || call.status !== "completed" || call.draftsGeneratedAt) {
    return { success: false, error: "Drafts can't be generated for this call" };
  }
  try {
    await generateDraftsForCall(call.id);
  } catch {
    return { success: false, error: "Couldn't generate drafts. Try again in a bit." };
  }
  revalidatePath("/settings/voice");
  return { success: true };
}

// --- Drafts (never published without the user clicking Publish) ---

export async function getMyVoiceDrafts() {
  const { profileId, userId } = await requireAuthWithProfile();
  const rows = await db
    .select({
      id: voiceDrafts.id,
      callId: voiceDrafts.callId,
      content: voiceDrafts.content,
      status: voiceDrafts.status,
      media: voiceDrafts.media,
      postId: voiceDrafts.postId,
      createdAt: voiceDrafts.createdAt,
      transcript: voiceCalls.transcript,
    })
    .from(voiceDrafts)
    .leftJoin(voiceCalls, and(eq(voiceCalls.id, voiceDrafts.callId), eq(voiceCalls.userId, userId)))
    .where(and(eq(voiceDrafts.profileId, profileId), ne(voiceDrafts.status, "discarded")))
    .orderBy(desc(voiceDrafts.createdAt))
    .limit(100);
  // Only what the user said goes to the client, to show where each draft came from.
  return rows.map(({ transcript, ...draft }) => ({
    ...draft,
    userTurns: (transcript ?? []).filter((t) => t.role === "user").map((t) => t.text),
  }));
}

export async function updateVoiceDraft(draftId: string, content: string): Promise<ActionResult> {
  const profileId = await requireProfile();
  const parsed = draftContentSchema.safeParse(content);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const updated = await db
    .update(voiceDrafts)
    .set({ content: parsed.data })
    .where(
      and(
        eq(voiceDrafts.id, draftId),
        eq(voiceDrafts.profileId, profileId),
        eq(voiceDrafts.status, "draft")
      )
    )
    .returning({ id: voiceDrafts.id });
  if (!updated.length) return { success: false, error: "Draft not found" };
  return { success: true };
}

export async function publishVoiceDraft(draftId: string): Promise<ActionResult> {
  const profileId = await requireProfile();

  const published = await db.transaction(async (tx) => {
    const [draft] = await tx
      .update(voiceDrafts)
      .set({ status: "published" })
      .where(
        and(
          eq(voiceDrafts.id, draftId),
          eq(voiceDrafts.profileId, profileId),
          eq(voiceDrafts.status, "draft")
        )
      )
      .returning({ content: voiceDrafts.content, media: voiceDrafts.media });
    if (!draft) return false;

    const [post] = await tx
      .insert(posts)
      .values({ content: draft.content, profileId })
      .returning({ id: posts.id });

    // The attached photo or video becomes the post's media, the same way a
    // post written in the composer stores it.
    if (draft.media) {
      const [item] = await tx
        .insert(media)
        .values({
          url: draft.media.url,
          type: draft.media.type,
          width: draft.media.width,
          height: draft.media.height,
          profileId,
        })
        .returning({ id: media.id });
      await tx.insert(postMedia).values({ postId: post.id, mediaId: item.id });
    }

    await tx.update(voiceDrafts).set({ postId: post.id }).where(eq(voiceDrafts.id, draftId));
    return true;
  });

  if (!published) return { success: false, error: "Draft not found or already published" };
  revalidatePath("/[username]", "layout");
  return { success: true };
}

export async function deleteVoiceDraft(draftId: string): Promise<ActionResult> {
  const profileId = await requireProfile();
  const deleted = await db
    .delete(voiceDrafts)
    .where(
      and(
        eq(voiceDrafts.id, draftId),
        eq(voiceDrafts.profileId, profileId),
        eq(voiceDrafts.status, "draft")
      )
    )
    .returning({ id: voiceDrafts.id, media: voiceDrafts.media });
  if (!deleted.length) return { success: false, error: "Draft not found" };
  await removeDraftMediaFile(deleted[0].media);
  return { success: true };
}

// --- A photo or video on a draft ---
// Uploaded by the browser to /api/upload/files (folder fyp-stacks/posts), then
// attached here. One per draft, like a post from the composer.

const DRAFT_MEDIA_FOLDER = "fyp-stacks/posts/";
const VIDEO_URL = /\.(mp4|webm|mov)$/i;

const draftMediaSchema = z.object({
  url: z.string().url().max(1000),
  width: z.number().int().min(0).max(20000).nullable(),
  height: z.number().int().min(0).max(20000).nullable(),
});

export async function setVoiceDraftMedia(
  draftId: string,
  input: z.infer<typeof draftMediaSchema> | null
): Promise<ActionResult> {
  const profileId = await requireProfile();

  let next: TVoiceDraftMedia | null = null;
  if (input) {
    const parsed = draftMediaSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "That file can't be attached" };
    // Only files our upload route put in the posts folder.
    const key = getOwnS3KeyFromUrl(parsed.data.url);
    if (!key || !key.startsWith(DRAFT_MEDIA_FOLDER)) {
      return { success: false, error: "That file can't be attached" };
    }
    const type = isImageUrl(parsed.data.url) ? "image" : VIDEO_URL.test(parsed.data.url) ? "video" : null;
    if (!type) return { success: false, error: "Only photos and videos can be attached" };
    next = { url: parsed.data.url, type, width: parsed.data.width || null, height: parsed.data.height || null };
  }

  const [before] = await db
    .select({ media: voiceDrafts.media })
    .from(voiceDrafts)
    .where(
      and(
        eq(voiceDrafts.id, draftId),
        eq(voiceDrafts.profileId, profileId),
        eq(voiceDrafts.status, "draft")
      )
    );
  if (!before) return { success: false, error: "Draft not found" };

  const updated = await db
    .update(voiceDrafts)
    .set({ media: next })
    .where(
      and(
        eq(voiceDrafts.id, draftId),
        eq(voiceDrafts.profileId, profileId),
        eq(voiceDrafts.status, "draft")
      )
    )
    .returning({ id: voiceDrafts.id });
  if (!updated.length) return { success: false, error: "Draft not found" };

  if (before.media && before.media.url !== next?.url) {
    await removeDraftMediaFile(before.media);
  }
  return { success: true };
}

// Deletes a draft's file from S3 once nothing points at it. A file that a post
// already uses (a `media` row) is never deleted from here.
async function removeDraftMediaFile(file: TVoiceDraftMedia | null) {
  if (!file) return;
  const key = getOwnS3KeyFromUrl(file.url);
  if (!key || !key.startsWith(DRAFT_MEDIA_FOLDER)) return;
  try {
    const usedByPost = await db.query.media.findFirst({
      where: eq(media.url, file.url),
      columns: { id: true },
    });
    const usedByDraft = await db.query.voiceDrafts.findFirst({
      where: sql`${voiceDrafts.media}->>'url' = ${file.url}`,
      columns: { id: true },
    });
    if (usedByPost || usedByDraft) return;
    await deleteFromS3(key);
  } catch (error: any) {
    console.error("[voice] couldn't delete draft media", error?.message);
  }
}

// --- Profile suggestions from the onboarding call ---
// The call only suggests. Nothing reaches the profile until the person picks
// items here and adds them.

export type OnboardingSuggestions = {
  callId: string;
  createdAt: Date;
  suggestions: TProfileSuggestions;
  // Which profile fields are empty right now, so the UI can say what an item replaces.
  empty: {
    bio: boolean;
    personalMission: boolean;
    lifePhilosophy: boolean;
    experience: boolean;
    education: boolean;
    projects: boolean;
  };
};

export async function getOnboardingSuggestions(): Promise<OnboardingSuggestions | null> {
  const { userId, profileId } = await requireAuthWithProfile();
  const pending = await findPendingOnboardingSuggestions(userId);
  if (!pending) return null;

  const [current, hasExp, hasEdu, hasProj] = await Promise.all([
    db.query.profile.findFirst({
      where: and(eq(profile.id, profileId), eq(profile.userId, userId)),
      columns: { bio: true, personalMission: true, lifePhilosophy: true },
    }),
    db.query.experience.findFirst({ where: eq(experience.profileId, profileId), columns: { id: true } }),
    db.query.education.findFirst({ where: eq(education.profileId, profileId), columns: { id: true } }),
    db.query.projects.findFirst({ where: eq(projects.profileId, profileId), columns: { id: true } }),
  ]);
  if (!current) return null;

  return {
    callId: pending.id,
    createdAt: pending.createdAt,
    suggestions: pending.suggestions,
    empty: {
      bio: !current.bio?.trim(),
      personalMission: !current.personalMission?.trim(),
      lifePhilosophy: !current.lifePhilosophy?.trim(),
      experience: !hasExp,
      education: !hasEdu,
      projects: !hasProj,
    },
  };
}

const indexListSchema = z.array(z.number().int().min(0).max(99)).max(50);
const suggestionSelectionSchema = z.object({
  bio: z.boolean(),
  personalMission: z.boolean(),
  lifePhilosophy: z.boolean(),
  experience: indexListSchema,
  education: indexListSchema,
  projects: indexListSchema,
  // Optional edits to the three text fields. Everything else comes from the stored suggestions.
  edits: z
    .object({
      bio: z.string().max(SUGGESTION_TEXT_LIMITS.bio).optional(),
      personalMission: z.string().max(SUGGESTION_TEXT_LIMITS.personalMission).optional(),
      lifePhilosophy: z.string().max(SUGGESTION_TEXT_LIMITS.lifePhilosophy).optional(),
    })
    .optional(),
});

export type OnboardingSuggestionSelection = z.infer<typeof suggestionSelectionSchema>;

const pick = <T,>(items: T[], indexes: number[]) =>
  Array.from(new Set(indexes))
    .filter((i) => i < items.length)
    .sort((a, b) => a - b)
    .map((i) => items[i]);

export async function applyOnboardingSuggestions(
  callId: string,
  selection: OnboardingSuggestionSelection
): Promise<ActionResult> {
  const { userId, profileId } = await requireAuthWithProfile();
  if (!z.string().uuid().safeParse(callId).success) return { success: false, error: "Call not found" };
  const parsed = suggestionSelectionSchema.safeParse(selection);
  if (!parsed.success) return { success: false, error: "Check the text and try again" };
  const sel = parsed.data;

  // Text the person edited, falling back to what was stored. Empty means skip.
  const textFor = (field: keyof typeof SUGGESTION_TEXT_LIMITS, stored: string | null) =>
    cleanPlainText(sel.edits?.[field] ?? stored, SUGGESTION_TEXT_LIMITS[field]);

  const applied = await db.transaction(async (tx) => {
    // Claim the call first so a double click can't add everything twice.
    const [call] = await tx
      .update(voiceCalls)
      .set({ suggestionsReviewedAt: new Date() })
      .where(
        and(
          eq(voiceCalls.id, callId),
          eq(voiceCalls.userId, userId),
          eq(voiceCalls.kind, "onboarding"),
          isNotNull(voiceCalls.profileSuggestions),
          isNull(voiceCalls.suggestionsReviewedAt)
        )
      )
      .returning({ suggestions: voiceCalls.profileSuggestions });
    if (!call?.suggestions) return false;
    const s = call.suggestions;

    // Only these three profile fields can change here.
    const profileUpdates: Partial<Pick<typeof profile.$inferInsert, "bio" | "personalMission" | "lifePhilosophy">> =
      {};
    if (sel.bio && s.bio) {
      const bio = textFor("bio", s.bio);
      if (bio) profileUpdates.bio = bio;
    }
    if (sel.personalMission && s.personalMission) {
      const mission = textFor("personalMission", s.personalMission);
      if (mission) profileUpdates.personalMission = mission;
    }
    if (sel.lifePhilosophy && s.lifePhilosophy) {
      const philosophy = textFor("lifePhilosophy", s.lifePhilosophy);
      if (philosophy) profileUpdates.lifePhilosophy = philosophy;
    }
    if (Object.keys(profileUpdates).length) {
      await tx
        .update(profile)
        .set(profileUpdates)
        .where(and(eq(profile.id, profileId), eq(profile.userId, userId)));
    }

    const expRows: (typeof experience.$inferInsert)[] = pick(s.experience ?? [], sel.experience).map((e) => ({
      profileId,
      title: e.title,
      company: e.company,
      description: e.description,
      employmentType: "Full-time" as const,
      startDate: suggestionDate(e.startDate),
      endDate: suggestionDate(e.endDate),
      currentlyWorking: e.currentlyWorking,
    }));
    if (expRows.length) await tx.insert(experience).values(expRows);

    const eduRows: (typeof education.$inferInsert)[] = pick(s.education ?? [], sel.education).map((e) => ({
      profileId,
      school: e.school,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: suggestionDate(e.startDate),
      endDate: suggestionDate(e.endDate),
    }));
    if (eduRows.length) await tx.insert(education).values(eduRows);

    const projectRows: (typeof projects.$inferInsert)[] = pick(s.projects ?? [], sel.projects).map((p) => ({
      profileId,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
    }));
    if (projectRows.length) await tx.insert(projects).values(projectRows);

    return true;
  });

  if (!applied) return { success: false, error: "These suggestions were already reviewed" };
  revalidatePath("/[username]", "layout");
  revalidatePath("/settings/voice");
  return { success: true };
}

export async function dismissOnboardingSuggestions(callId: string): Promise<ActionResult> {
  const session = await requireAuth();
  if (!z.string().uuid().safeParse(callId).success) return { success: false, error: "Call not found" };
  const updated = await db
    .update(voiceCalls)
    .set({ suggestionsReviewedAt: new Date() })
    .where(
      and(
        eq(voiceCalls.id, callId),
        eq(voiceCalls.userId, session.user.id),
        eq(voiceCalls.kind, "onboarding"),
        isNull(voiceCalls.suggestionsReviewedAt)
      )
    )
    .returning({ id: voiceCalls.id });
  if (!updated.length) return { success: false, error: "These suggestions were already reviewed" };
  revalidatePath("/settings/voice");
  return { success: true };
}
