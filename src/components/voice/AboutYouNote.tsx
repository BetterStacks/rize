"use client";

import { saveAboutYou } from "@/actions/voice-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MAX = 600;

/*
 * The short "about you" note Rize reads before every journaling call. Rize
 * rebuilds it after calls; the person can rewrite or clear it, and their
 * edits are kept on the next rebuild.
 */
export default function AboutYouNote({ initial }: { initial: string }) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = text.trim() !== initial.trim();

  const save = async (value: string) => {
    setBusy(true);
    const result = await saveAboutYou(value);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setText(value);
    toast.success(value.trim() ? "Saved" : "Cleared");
    router.refresh();
  };

  return (
    <div className="rounded-[20px] border border-paper-border bg-paper p-5">
      <Label htmlFor="about-you" className="text-[15px] font-medium text-ink">
        About you
      </Label>
      <p className="mt-1 text-sm text-ink-secondary">
        What Rize keeps in mind on every call. It updates after calls; change anything that&apos;s wrong.
      </p>
      <textarea
        id="about-you"
        value={text}
        maxLength={MAX}
        rows={4}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nothing yet. After a few calls, Rize writes a short note here, like what you're studying and what you're working on."
        className="mt-3 w-full resize-y rounded-xl border border-hairline bg-surface px-3 py-2 font-instrument text-lg leading-snug text-ink placeholder:font-sans placeholder:text-sm placeholder:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-ink-secondary">
          {text.length}/{MAX}
        </span>
        <div className="flex gap-2">
          {initial && (
            <Button variant="ghost" size="sm" className="h-11" disabled={busy} onClick={() => save("")}>
              Clear
            </Button>
          )}
          <Button variant="brand" size="sm" className="h-11" disabled={busy || !dirty} onClick={() => save(text)}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
