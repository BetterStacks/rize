"use server";

import { posts, users, voiceCalls, voiceDrafts } from "@/db/schema";
import { requireAuth, requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateDraftsForCall } from "@/lib/voice/after-call";
import { twilioClient } from "@/lib/voice/twilio";
import { and, desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter the number with country code");
const draftContentSchema = z.string().trim().min(1, "Draft can't be empty").max(5000);

type ActionResult = { success: true } | { success: false; error: string };

// --- Phone number verification (Twilio Verify, same service as phone login) ---

export async function sendPhoneVerification(phoneNumber: string): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = phoneSchema.safeParse(phoneNumber);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { success } = await checkRateLimit("auth", `voice-otp:${session.user.id}`);
  if (!success) return { success: false, error: "Too many attempts. Wait a minute and try again." };

  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phoneNumber, parsed.data), ne(users.id, session.user.id)))
    .limit(1);
  if (taken.length) {
    return { success: false, error: "This number is linked to another account" };
  }

  try {
    await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: parsed.data, channel: "sms" });
    return { success: true };
  } catch (error: any) {
    console.error("[voice] send verification failed", error?.code, error?.message);
    return { success: false, error: "Couldn't send the code. Check the number and try again." };
  }
}

export async function confirmPhoneVerification(
  phoneNumber: string,
  code: string
): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = phoneSchema.safeParse(phoneNumber);
  if (!parsed.success || !/^\d{4,10}$/.test(code)) {
    return { success: false, error: "Invalid code" };
  }

  const { success } = await checkRateLimit("auth", `voice-otp:${session.user.id}`);
  if (!success) return { success: false, error: "Too many attempts. Wait a minute and try again." };

  try {
    const check = await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: parsed.data, code });
    if (check.status !== "approved") return { success: false, error: "Wrong code" };
  } catch (error: any) {
    console.error("[voice] verification check failed", error?.code, error?.message);
    return { success: false, error: "Code expired or invalid. Request a new one." };
  }

  try {
    await db
      .update(users)
      .set({ phoneNumber: parsed.data, phoneNumberVerified: true, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  } catch {
    return { success: false, error: "This number is linked to another account" };
  }

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
  const profileId = await requireProfile();
  return db
    .select({
      id: voiceDrafts.id,
      callId: voiceDrafts.callId,
      content: voiceDrafts.content,
      status: voiceDrafts.status,
      postId: voiceDrafts.postId,
      createdAt: voiceDrafts.createdAt,
    })
    .from(voiceDrafts)
    .where(and(eq(voiceDrafts.profileId, profileId), ne(voiceDrafts.status, "discarded")))
    .orderBy(desc(voiceDrafts.createdAt))
    .limit(100);
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
    .returning({ id: voiceDrafts.id });
  if (!deleted.length) return { success: false, error: "Draft not found" };
  return { success: true };
}
