import { applyScheduleSignalsAfterCall } from "./schedule";
import { voiceCalls, type TTranscriptTurn } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { saveOnboardingSuggestions, generateDraftsForCall } from "./after-call";
import { updateMemoriesAfterCall } from "./memory";
import { runSideband } from "./openai-live";

// Timeline inside one Vercel function (maxDuration 800s on Pro, Fluid Compute).
// Measured from when the OpenAI webhook arrives, i.e. right after the user answers.
export const FUNCTION_MAX_DURATION_SECONDS = 800;
// Journal calls aim for about 4.5 minutes (Rize Call Script); onboarding runs
// a little longer. The wrap-up nudge does the real work; session.close and the
// hard stop are backstops for calls that run on.
const TIMINGS = {
  journal: {
    wrapUpAfterMs: 4 * 60 * 1000 + 30 * 1000,
    closeAfterMs: 8 * 60 * 1000,
    hardStopAfterMs: 8 * 60 * 1000 + 40 * 1000,
  },
  onboarding: {
    wrapUpAfterMs: 6 * 60 * 1000 + 30 * 1000,
    closeAfterMs: 11 * 60 * 1000,
    hardStopAfterMs: 11 * 60 * 1000 + 40 * 1000, // 700s, the longest any call can hold the function
  },
} as const;

const WRAP_UP_MESSAGE =
  "Time is almost up. If they're mid-story, let them finish the thought. Then reflect back one line in their own words, thank them, say nothing goes public unless they say so, and say goodbye. If they're upset or in distress, don't rush them: stay kind, make sure they have the helpline, and close gently.";
// Leaves ~100s for saving the transcript and generating drafts.
const POST_PROCESS_BUDGET_MS = 80 * 1000;
const TRANSCRIPT_FLUSH_MS = 20 * 1000;

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    ),
  ]);

export async function holdCallSession(callId: string, sessionId: string, kind: "journal" | "onboarding") {
  let latest: TTranscriptTurn[] = [];
  let lastFlush = 0;
  let flushing: Promise<unknown> | null = null;

  // Save the transcript as it grows so a crash still leaves most of it.
  const flush = () => {
    if (flushing) return;
    lastFlush = Date.now();
    flushing = db
      .update(voiceCalls)
      .set({ transcript: latest.map((t) => ({ ...t })) })
      .where(eq(voiceCalls.id, callId))
      .catch((e) => console.error("[voice] transcript flush failed", e?.message))
      .finally(() => {
        flushing = null;
      });
  };

  const result = await runSideband({
    sessionId,
    ...TIMINGS[kind],
    wrapUpMessage: WRAP_UP_MESSAGE,
    onTranscript: (transcript) => {
      latest = transcript;
      if (Date.now() - lastFlush > TRANSCRIPT_FLUSH_MS) flush();
    },
  });
  if (flushing) await flushing;

  const hasUserSpeech = result.transcript.some((t) => t.role === "user" && t.text.trim());
  await db
    .update(voiceCalls)
    .set({
      transcript: result.transcript,
      status: hasUserSpeech ? "completed" : "failed",
      closeReason: result.finalized ? result.closeReason : `${result.closeReason ?? "unknown"} (not finalized)`,
      durationSeconds: result.durationSeconds,
      endedAt: new Date(),
      error: hasUserSpeech ? null : "No conversation was captured",
    })
    .where(eq(voiceCalls.id, callId));

  if (!hasUserSpeech) return;

  try {
    await applyScheduleSignalsAfterCall(callId, result.transcript);
  } catch (error: any) {
    console.error("[voice] schedule update after call failed", callId, error?.message);
  }

  try {
    if (kind === "onboarding") {
      await withTimeout(saveOnboardingSuggestions(callId), POST_PROCESS_BUDGET_MS / 2);
    }
    // Onboarding calls also produce drafts; the user decides what to post.
    // Memory notes are written alongside, from the same transcript.
    await Promise.all([
      withTimeout(generateDraftsForCall(callId), POST_PROCESS_BUDGET_MS / 2),
      withTimeout(updateMemoriesAfterCall(callId), POST_PROCESS_BUDGET_MS / 2).catch((error: any) => {
        console.error("[voice] memory update failed", callId, error?.message);
      }),
    ]);
  } catch (error: any) {
    // The UI offers "Generate drafts" again for calls without drafts.
    console.error("[voice] post-call processing failed", callId, error?.message);
  }
}
