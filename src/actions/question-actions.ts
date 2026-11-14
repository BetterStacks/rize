"use server";

import { profile, profileQuestionBlocks, profileQuestions, users } from "@/db/schema";
import { getServerSession, requireProfile } from "@/lib/auth";
import { profileIsClaimed } from "@/lib/claimed-profiles";
import db from "@/lib/db";
import { checkQuestionLocally, checkQuestionWithModeration, suggestQuestions } from "@/lib/questions";
import { checkRateLimit } from "@/lib/rate-limit";
import { loadCallerContext } from "@/lib/voice/prompt";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

/* ------------------------------------------------------------------------ */
/* Asking (a visitor on someone else's profile)                              */
/* ------------------------------------------------------------------------ */

export type QuestionComposer = {
  firstName: string;
  signedIn: boolean;
  /** Why asking isn't possible right now, if it isn't. */
  blocked: string | null;
  suggestions: string[];
};

async function targetProfile(username: string) {
  const [row] = await db
    .select({ id: profile.id, userId: profile.userId, displayName: profile.displayName, name: users.name })
    .from(profile)
    .innerJoin(users, eq(users.id, profile.userId))
    .where(and(eq(profile.username, username.toLowerCase()), profileIsClaimed()))
    .limit(1);
  return row ?? null;
}

const OPEN_STATUSES = ["pending", "accepted", "asked"] as const;

export async function getQuestionComposer(username: string): Promise<QuestionComposer | null> {
  const target = await targetProfile(username);
  if (!target) return null;
  const firstName = (target.displayName || target.name || "them").split(" ")[0];
  const session = await getServerSession();
  const askerProfileId = session?.user?.profileId ?? null;
  if (askerProfileId === target.id) return null; // your own profile

  const ctx = await loadCallerContext(target.userId);
  const suggestions = suggestQuestions(ctx);
  if (!askerProfileId) return { firstName, signedIn: false, blocked: null, suggestions };

  const [open] = await db
    .select({ id: profileQuestions.id })
    .from(profileQuestions)
    .where(
      and(
        eq(profileQuestions.profileId, target.id),
        eq(profileQuestions.askerProfileId, askerProfileId),
        inArray(profileQuestions.status, [...OPEN_STATUSES])
      )
    )
    .limit(1);
  return {
    firstName,
    signedIn: true,
    blocked: open ? `You've asked ${firstName} something already. You can ask again once they've answered or passed.` : null,
    suggestions,
  };
}

export async function askQuestion(username: string, question: string): Promise<ActionResult> {
  const askerProfileId = await requireProfile().catch(() => null);
  if (!askerProfileId) return { success: false, error: "Sign in to ask a question." };

  const target = await targetProfile(String(username || ""));
  if (!target) return { success: false, error: "Profile not found." };
  if (target.id === askerProfileId) return { success: false, error: "You can't ask yourself." };

  const local = checkQuestionLocally(String(question || ""));
  if (!local.ok) return { success: false, error: local.error };

  const [[blocked], [open]] = await Promise.all([
    db
      .select({ at: profileQuestionBlocks.createdAt })
      .from(profileQuestionBlocks)
      .where(
        and(
          eq(profileQuestionBlocks.profileId, target.id),
          eq(profileQuestionBlocks.blockedProfileId, askerProfileId)
        )
      )
      .limit(1),
    db
      .select({ id: profileQuestions.id })
      .from(profileQuestions)
      .where(
        and(
          eq(profileQuestions.profileId, target.id),
          eq(profileQuestions.askerProfileId, askerProfileId),
          inArray(profileQuestions.status, [...OPEN_STATUSES])
        )
      )
      .limit(1),
  ]);
  // A block looks like success to the asker, so it can't be probed.
  if (blocked) return { success: true };
  if (open) return { success: false, error: "You've already asked them something. Wait for them to answer or pass." };

  const { success } = await checkRateLimit("question", askerProfileId);
  if (!success) return { success: false, error: "You've asked a lot today. Try again tomorrow." };

  const moderated = await checkQuestionWithModeration(local.text);
  if (!moderated.ok) return { success: false, error: moderated.error };

  await db.insert(profileQuestions).values({
    profileId: target.id,
    askerProfileId,
    question: moderated.text,
  });
  return { success: true };
}

/* ------------------------------------------------------------------------ */
/* Answering (the owner)                                                     */
/* ------------------------------------------------------------------------ */

export type IncomingQuestion = {
  id: string;
  question: string;
  status: "pending" | "accepted" | "asked";
  createdAt: string;
  asker: { name: string; username: string | null };
};

export async function getMyIncomingQuestions(): Promise<IncomingQuestion[]> {
  const profileId = await requireProfile();
  const rows = await db
    .select({
      id: profileQuestions.id,
      question: profileQuestions.question,
      status: profileQuestions.status,
      createdAt: profileQuestions.createdAt,
      askerName: profile.displayName,
      askerUsername: profile.username,
    })
    .from(profileQuestions)
    .innerJoin(profile, eq(profile.id, profileQuestions.askerProfileId))
    .where(and(eq(profileQuestions.profileId, profileId), inArray(profileQuestions.status, [...OPEN_STATUSES])))
    .orderBy(asc(profileQuestions.createdAt))
    .limit(50);
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    status: r.status as IncomingQuestion["status"],
    createdAt: r.createdAt.toISOString(),
    asker: { name: r.askerName?.trim() || r.askerUsername || "Someone", username: r.askerUsername },
  }));
}

const respondSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["accept", "skip", "block"]),
});

/*
 * accept: a Rize call will ask it. skip: pass on it (the asker isn't told).
 * block: pass, and quietly drop anything else this person asks.
 */
export async function respondToQuestion(id: string, action: "accept" | "skip" | "block"): Promise<ActionResult> {
  const profileId = await requireProfile();
  const parsed = respondSchema.safeParse({ id, action });
  if (!parsed.success) return { success: false, error: "Not found" };

  const [row] = await db
    .update(profileQuestions)
    .set({ status: parsed.data.action === "accept" ? "accepted" : "skipped", updatedAt: new Date() })
    .where(
      and(
        eq(profileQuestions.id, parsed.data.id),
        eq(profileQuestions.profileId, profileId),
        inArray(profileQuestions.status, ["pending", "accepted"])
      )
    )
    .returning({ askerProfileId: profileQuestions.askerProfileId });
  if (!row) return { success: false, error: "Not found" };

  if (parsed.data.action === "block") {
    await db
      .insert(profileQuestionBlocks)
      .values({ profileId, blockedProfileId: row.askerProfileId })
      .onConflictDoNothing();
    await db
      .update(profileQuestions)
      .set({ status: "skipped", updatedAt: new Date() })
      .where(
        and(
          eq(profileQuestions.profileId, profileId),
          eq(profileQuestions.askerProfileId, row.askerProfileId),
          inArray(profileQuestions.status, ["pending", "accepted"])
        )
      );
  }
  revalidatePath("/settings/voice");
  return { success: true };
}
