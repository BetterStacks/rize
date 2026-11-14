import { posts, profile, profileQuestions, voiceCalls, voiceDrafts } from "@/db/schema";
import db from "@/lib/db";
import { and, asc, eq } from "drizzle-orm";

/*
 * Readers' questions in the call flow. A journaling call asks the oldest
 * question the person accepted; publishing a draft from that call answers it.
 */

export async function nextAcceptedQuestion(userId: string) {
  const [row] = await db
    .select({ id: profileQuestions.id, question: profileQuestions.question })
    .from(profileQuestions)
    .innerJoin(profile, eq(profile.id, profileQuestions.profileId))
    .where(and(eq(profile.userId, userId), eq(profileQuestions.status, "accepted")))
    .orderBy(asc(profileQuestions.createdAt))
    .limit(1);
  return row ?? null;
}

export async function markQuestionAsked(questionId: string, callId: string) {
  await Promise.all([
    db
      .update(profileQuestions)
      .set({ status: "asked", callId, updatedAt: new Date() })
      .where(and(eq(profileQuestions.id, questionId), eq(profileQuestions.status, "accepted"))),
    db.update(voiceCalls).set({ questionId }).where(eq(voiceCalls.id, callId)),
  ]);
}

/*
 * After a draft is published: if its call asked a reader's question, link the
 * post as the answer. Only the first published draft from the call answers it.
 */
export async function linkAnswerForDraft(draftId: string, postId: string, profileId: string) {
  const [row] = await db
    .select({ questionId: voiceCalls.questionId })
    .from(voiceDrafts)
    .innerJoin(voiceCalls, eq(voiceCalls.id, voiceDrafts.callId))
    .where(and(eq(voiceDrafts.id, draftId), eq(voiceDrafts.profileId, profileId)))
    .limit(1);
  if (!row?.questionId) return;
  await db
    .update(profileQuestions)
    .set({ status: "answered", answerPostId: postId, answeredAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(profileQuestions.id, row.questionId),
        eq(profileQuestions.profileId, profileId),
        eq(profileQuestions.status, "asked")
      )
    );
}

/** The question a post answers, if any. */
export async function questionForPost(postId: string) {
  const [row] = await db
    .select({ question: profileQuestions.question })
    .from(profileQuestions)
    .innerJoin(posts, eq(posts.id, profileQuestions.answerPostId))
    .where(eq(profileQuestions.answerPostId, postId))
    .limit(1);
  return row?.question ?? null;
}
