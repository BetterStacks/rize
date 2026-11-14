"use client";

import { respondToQuestion, type IncomingQuestion } from "@/actions/question-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/*
 * Questions readers asked from your profile. Only you see them. Take one and
 * your next call asks it; pass and the asker isn't told; block and nothing
 * else from them reaches you.
 */
export default function QuestionsInbox({ questions }: { questions: IncomingQuestion[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  if (questions.length === 0) return null;

  const respond = async (id: string, action: "accept" | "skip" | "block") => {
    setBusy(id);
    const result = await respondToQuestion(id, action);
    setBusy(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      action === "accept" ? "Your next call will ask it" : action === "block" ? "Blocked. You won't get questions from them" : "Passed"
    );
    router.refresh();
  };

  return (
    <section aria-labelledby="questions-title" className="border-t border-hairline py-10">
      <h2 id="questions-title" className="font-instrument text-[28px] leading-none text-ink">
        Questions for you
      </h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-secondary">
        People who read your profile asked these. Only you can see them. Take one and your next call asks it; your answer
        becomes a draft you can post or skip.
      </p>
      <ul className="mt-6 max-w-[640px] divide-y divide-hairline border-y border-hairline">
        {questions.map((q) => (
          <li key={q.id} className="py-4">
            <p className="font-instrument text-lg leading-snug text-ink">&ldquo;{q.question}&rdquo;</p>
            <p className="mt-1 text-xs text-ink-secondary">
              {q.asker.username ? `@${q.asker.username}` : q.asker.name} · {dateLabel(q.createdAt)}
              {q.status === "accepted" ? " · your next call will ask this" : ""}
              {q.status === "asked" ? " · asked on a call; publish a draft from it to answer" : ""}
            </p>
            {q.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === q.id}
                  onClick={() => respond(q.id, "accept")}
                  className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-medium text-brand-ink ring-1 ring-ink/10"
                >
                  Ask me on my next call
                </button>
                <button
                  type="button"
                  disabled={busy === q.id}
                  onClick={() => respond(q.id, "skip")}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ink-secondary hover:text-ink"
                >
                  Pass
                </button>
                <button
                  type="button"
                  disabled={busy === q.id}
                  onClick={() => respond(q.id, "block")}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ink-secondary hover:text-danger"
                >
                  Block this person
                </button>
              </div>
            )}
            {q.status === "accepted" && (
              <button
                type="button"
                disabled={busy === q.id}
                onClick={() => respond(q.id, "skip")}
                className="mt-2 inline-flex min-h-11 items-center rounded-full px-3 text-sm text-ink-secondary hover:text-ink"
              >
                Don&apos;t ask it after all
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
