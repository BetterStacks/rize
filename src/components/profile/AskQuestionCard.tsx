"use client";

import { askQuestion, getQuestionComposer } from "@/actions/question-actions";
import { QUESTION_MAX } from "@/lib/questions-shared";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/*
 * "Ask them something" on someone else's profile. The question goes privately
 * to them; if they choose, a Rize call asks it and they answer in their own
 * words. Suggested questions come from their profile so it's easy to start.
 */
export default function AskQuestionCard({ username }: { username: string }) {
  const { data: composer } = useQuery({
    queryKey: ["question-composer", username],
    queryFn: () => getQuestionComposer(username),
    staleTime: 60_000,
  });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!composer) return null;
  const { firstName, signedIn, blocked, suggestions } = composer;

  const send = async () => {
    setBusy(true);
    setError(null);
    const result = await askQuestion(username, text);
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <section aria-labelledby="ask-title" className="mt-2 rounded-[20px] border border-paper-border bg-paper p-5">
      <h2 id="ask-title" className="flex items-center gap-2 font-instrument text-2xl leading-tight text-ink">
        <MessageCircleQuestion aria-hidden className="size-5" strokeWidth={1.6} />
        Ask {firstName} something
      </h2>
      <p className="mt-1 max-w-[56ch] text-sm text-ink-secondary">
        Only {firstName} sees it. If they want to answer, Rize asks them on their next call and they reply in their own
        words. You&apos;ll hear when it&apos;s up.
      </p>

      {sent ? (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-highlight px-4 py-3 text-sm text-ink">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
          Sent privately to {firstName}. If they answer, you&apos;ll get a notification.
        </p>
      ) : !signedIn ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.slice(0, 2).map((q) => (
            <span key={q} className="rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-ink-secondary">
              {q}
            </span>
          ))}
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-on-ink"
          >
            Sign in to ask
          </Link>
        </div>
      ) : blocked ? (
        <p className="mt-4 text-sm text-ink-secondary">{blocked}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setText(q)}
                aria-pressed={text === q}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                  text === q
                    ? "border-ink/10 bg-brand text-brand-ink"
                    : "border-hairline bg-surface text-ink-secondary hover:text-ink"
                )}
              >
                {q}
              </button>
            ))}
          </div>
          <label htmlFor="ask-text" className="sr-only">
            Your question
          </label>
          <textarea
            id="ask-text"
            value={text}
            maxLength={QUESTION_MAX}
            rows={2}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or write your own. Ask about a moment, a choice or something they made."
            className="mt-3 w-full resize-none rounded-xl border border-hairline bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          />
          {error && (
            <p role="alert" className="mt-1 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs tabular-nums text-ink-secondary">
              {text.length}/{QUESTION_MAX}
            </span>
            <button
              type="button"
              onClick={send}
              disabled={busy || text.trim().length < 10}
              className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-ink ring-1 ring-ink/10 disabled:bg-subtle disabled:text-ink-secondary"
            >
              {busy ? "Sending…" : "Send privately"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
