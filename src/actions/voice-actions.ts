"use server";

import {
  callMemories,
  callObservations,
  education,
  experience,
  posts,
  profile,
  projects,
  users,
  voiceCalls,
  voiceDrafts,
  type TProfileSuggestions,
} from "@/db/schema";
import { auth, requireAuth, requireAuthWithProfile, requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateDraftsForCall } from "@/lib/voice/after-call";
import { findPendingOnboardingSuggestions } from "@/lib/voice/pending-suggestions";
import { SUGGESTION_TEXT_LIMITS, cleanPlainText, suggestionDate } from "@/lib/voice/profile-suggestions";
import { ABOUT_YOU_MAX, readAboutYou, rebuildAboutYou, writeAboutYou } from "@/lib/voice/memory";
import { loadCallerContext, readableProfileSummary } from "@/lib/voice/prompt";
import { linkAnswerForDraft } from "@/lib/voice/reader-questions";
import { deleteRecording } from "@/lib/voice/r2";
import {
  CALL_DAYS,
  isValidCallTime,
  isValidTimezone,
} from "@/lib/voice/schedule";
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
      .set({
        phoneNumber: parsed.data,
        phoneNumberVerified: true,
        updatedAt: new Date(),
        // Scheduled calls were agreed for the old number; a new number starts off.
        dailyCallEnabled: sql`CASE WHEN ${users.phoneNumber} IS DISTINCT FROM ${parsed.data} THEN false ELSE ${users.dailyCallEnabled} END`,
      })
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
      error: "You sign in with this number, so it can't be removed. Rize only calls you when you tap Call me or at times you scheduled.",
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
    .set({ phoneNumber: null, phoneNumberVerified: false, dailyCallEnabled: false })
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
      .returning({ content: voiceDrafts.content });
    if (!draft) return false;

    const [post] = await tx
      .insert(posts)
      .values({ content: draft.content, profileId })
      .returning({ id: posts.id });
    await tx.update(voiceDrafts).set({ postId: post.id }).where(eq(voiceDrafts.id, draftId));
    return post.id;
  });

  if (!published) return { success: false, error: "Draft not found or already published" };
  await linkAnswerForDraft(draftId, published, profileId).catch((error: any) =>
    console.error("[voice] linking answer failed", error?.message)
  );
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
    .returning({ id: voiceDrafts.id });
  if (!deleted.length) return { success: false, error: "Draft not found" };
  return { success: true };
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

// --- Scheduled calls ---

export type CallSchedule = {
  enabled: boolean;
  paused: boolean;
  days: string[];
  time: string | null;
  timezone: string | null;
};

export async function getMyCallSchedule(): Promise<CallSchedule> {
  const userId = await requireUserId();
  const [row] = await db
    .select({
      enabled: users.dailyCallEnabled,
      consentedAt: users.scheduledCallsConsentedAt,
      pausedAt: users.scheduledCallsPausedAt,
      days: users.callDays,
      time: users.preferredCallTime,
      timezone: users.callTimezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    enabled: !!row?.enabled && !!row?.consentedAt,
    paused: !!row?.pausedAt,
    days: row?.days ?? [],
    time: row?.time ?? null,
    timezone: row?.timezone ?? null,
  };
}

const scheduleSchema = z.object({
  enabled: z.boolean(),
  days: z.array(z.enum(CALL_DAYS)).min(1, "Pick at least one day").max(7),
  time: z.string().refine(isValidCallTime, "Pick a time between 8am and 10pm"),
  timezone: z.string().refine(isValidTimezone, "Unknown timezone"),
});

/*
 * Saves the person's schedule. Switching it on records their consent and
 * clears any pause; switching it off keeps their days and time for later.
 */
export async function saveCallSchedule(input: z.input<typeof scheduleSchema>): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid schedule" };
  const { enabled, days, time, timezone } = parsed.data;

  if (enabled) {
    const [user] = await db
      .select({ phoneNumber: users.phoneNumber, verified: users.phoneNumberVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user?.phoneNumber || !user.verified) {
      return { success: false, error: "Verify your phone number first" };
    }
  }

  const ordered = CALL_DAYS.filter((d) => days.includes(d));
  await db
    .update(users)
    .set({
      dailyCallEnabled: enabled,
      callDays: ordered,
      preferredCallTime: time,
      callTimezone: timezone,
      ...(enabled
        ? { scheduledCallsConsentedAt: new Date(), scheduledCallsPausedAt: null, missedScheduledCalls: 0 }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  revalidatePath("/settings/voice");
  return { success: true };
}

// --- Call memory: what Rize keeps between calls ---

export type CallMemoryRow = {
  id: string;
  note: string;
  status: "active" | "completed" | "superseded";
  createdAt: string;
  closedAt: string | null;
  outcome: string | null;
  quotes: { quote: string; date: string }[];
};

export async function getMyCallMemories(): Promise<{
  enabled: boolean;
  aboutYou: string;
  profileSummary: string;
  memories: CallMemoryRow[];
}> {
  const userId = await requireUserId();
  const [[user], rows, obs, ctx] = await Promise.all([
    db
      .select({ enabled: users.callMemoryEnabled, raw: users.memoryContext })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    db
      .select({
        id: callMemories.id,
        note: callMemories.note,
        status: callMemories.status,
        createdAt: callMemories.createdAt,
        closedAt: callMemories.closedAt,
        outcome: callMemories.outcome,
        observationIds: callMemories.observationIds,
        outcomeObservationId: callMemories.outcomeObservationId,
      })
      .from(callMemories)
      .where(eq(callMemories.userId, userId))
      .orderBy(desc(callMemories.lastReinforcedAt))
      .limit(200),
    db
      .select({ id: callObservations.id, quote: callObservations.quote, createdAt: callObservations.createdAt })
      .from(callObservations)
      .where(eq(callObservations.userId, userId))
      .orderBy(desc(callObservations.createdAt))
      .limit(1000),
    loadCallerContext(userId, { full: true }),
  ]);
  const byId = new Map(obs.map((o) => [o.id, o]));
  return {
    enabled: user?.enabled ?? true,
    aboutYou: readAboutYou(user?.raw),
    profileSummary: readableProfileSummary(ctx),
    memories: rows.map((r) => ({
      id: r.id,
      note: r.note,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      closedAt: r.closedAt ? r.closedAt.toISOString() : null,
      outcome: r.outcome,
      quotes: [...r.observationIds, ...(r.outcomeObservationId ? [r.outcomeObservationId] : [])]
        .map((id) => byId.get(id))
        .filter((o): o is NonNullable<typeof o> => !!o)
        .map((o) => ({ quote: o.quote, date: o.createdAt.toISOString() })),
    })),
  };
}

/** Really deletes one memory and the observations behind it. Only the owner's. */
export async function deleteCallMemory(memoryId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!z.string().uuid().safeParse(memoryId).success) return { success: false, error: "Not found" };
  const [memory] = await db
    .delete(callMemories)
    .where(and(eq(callMemories.id, memoryId), eq(callMemories.userId, userId)))
    .returning({
      note: callMemories.note,
      observationIds: callMemories.observationIds,
      outcomeObservationId: callMemories.outcomeObservationId,
    });
  if (!memory) return { success: false, error: "Not found" };
  const obsIds = [...memory.observationIds, ...(memory.outcomeObservationId ? [memory.outcomeObservationId] : [])];
  if (obsIds.length) {
    await db
      .delete(callObservations)
      .where(and(eq(callObservations.userId, userId), inArray(callObservations.id, obsIds)));
  }
  // Take it out of the "about you" note too.
  await rebuildAboutYou(userId, { forget: memory.note }).catch((error: any) =>
    console.error("[voice] about-you rebuild failed", error?.message)
  );
  revalidatePath("/settings/voice");
  return { success: true };
}

/** Deletes everything Rize remembers for this person: memories and observations. */
export async function forgetAllCallMemories(): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.delete(callMemories).where(eq(callMemories.userId, userId));
  await db.delete(callObservations).where(eq(callObservations.userId, userId));
  await db.update(users).set({ memoryContext: null }).where(eq(users.id, userId));
  revalidatePath("/settings/voice");
  return { success: true };
}

/** Saves the person's own edit of their "about you" note. Empty clears it. */
export async function saveAboutYou(text: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.string().max(ABOUT_YOU_MAX, `Keep it under ${ABOUT_YOU_MAX} characters`).safeParse(text ?? "");
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Too long" };
  const clean = cleanPlainText(parsed.data, ABOUT_YOU_MAX);
  await db
    .update(users)
    .set({ memoryContext: clean ? writeAboutYou(clean) : null, updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/settings/voice");
  return { success: true };
}

/** Turns memory between calls on or off. Off also stops using existing notes. */
export async function setCallMemoryEnabled(enabled: boolean): Promise<ActionResult> {
  const userId = await requireUserId();
  await db
    .update(users)
    .set({ callMemoryEnabled: Boolean(enabled), updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/settings/voice");
  return { success: true };
}
