import { voiceCalls, type TTranscriptTurn } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { applyOnboardingTranscript, generateDraftsForCall } from "./after-call";
import { runSideband } from "./openai-live";

// Timeline inside one Vercel function (maxDuration 800s on Pro, Fluid Compute).
// Measured from when the OpenAI webhook arrives, i.e. right after the user answers.
export const FUNCTION_MAX_DURATION_SECONDS = 800;
const WRAP_UP_AFTER_MS = 10 * 60 * 1000; // ask the assistant to wrap up
const CLOSE_AFTER_MS = 11 * 60 * 1000; // send session.close
const HARD_STOP_AFTER_MS = 11 * 60 * 1000 + 40 * 1000; // hang up + stop waiting (700s)
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
    wrapUpAfterMs: WRAP_UP_AFTER_MS,
    closeAfterMs: CLOSE_AFTER_MS,
    hardStopAfterMs: HARD_STOP_AFTER_MS,
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
    if (kind === "onboarding") {
      await withTimeout(applyOnboardingTranscript(callId), POST_PROCESS_BUDGET_MS / 2);
    }
    // Onboarding calls also produce drafts; the user decides what to post.
    await withTimeout(generateDraftsForCall(callId), POST_PROCESS_BUDGET_MS / 2);
  } catch (error: any) {
    // The UI offers "Generate drafts" again for calls without drafts.
    console.error("[voice] post-call processing failed", callId, error?.message);
  }
}
