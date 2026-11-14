"use client";

import { saveCallSchedule } from "@/actions/voice-actions";
import { cn } from "@/lib/utils";
import type { CallDay } from "@/lib/voice/schedule";
import { Check } from "lucide-react";
import { useState } from "react";

const DAY_OPTIONS: { id: string; label: string; days: CallDay[] }[] = [
  { id: "mwf", label: "3 days a week", days: ["mon", "wed", "fri"] },
  { id: "weekdays", label: "Weekdays", days: ["mon", "tue", "wed", "thu", "fri"] },
  { id: "daily", label: "Every day", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
];

const TIME_OPTIONS = [
  { id: "09:00", label: "Morning", hint: "9 AM" },
  { id: "13:00", label: "Afternoon", hint: "1 PM" },
  { id: "19:00", label: "Evening", hint: "7 PM" },
  { id: "21:00", label: "Night", hint: "9 PM" },
];

const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
};

const chip = (on: boolean) =>
  cn(
    "min-h-11 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
    on ? "border-ink/10 bg-brand text-brand-ink" : "border-hairline bg-surface text-ink-secondary hover:text-ink"
  );

/*
 * Asked once, during the first call: should Rize call again on a schedule?
 * Choosing "Yes" is the person's consent; the exact days, time and number are
 * spelled out before they tap it. They can change or stop it in Settings.
 */
export default function QuickSchedulePrompt({
  phoneNumber,
  onDone,
}: {
  phoneNumber?: string | null;
  onDone: () => void;
}) {
  const [dayId, setDayId] = useState("mwf");
  const [time, setTime] = useState("19:00");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = DAY_OPTIONS.find((d) => d.id === dayId)!;
  const timeLabel = TIME_OPTIONS.find((t) => t.id === time)!.hint;

  const save = async () => {
    setBusy(true);
    setError(null);
    const result = await saveCallSchedule({ enabled: true, days: days.days, time, timezone: browserTimezone() });
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-highlight px-4 py-4 text-sm leading-relaxed text-ink">
        <p className="flex items-center gap-2 font-medium">
          <Check className="size-4" aria-hidden /> Scheduled
        </p>
        <p className="mt-1 text-ink-secondary">
          Rize will call {days.label.toLowerCase()} at {timeLabel}. Change or stop it any time in Settings, or say
          &ldquo;stop calling me&rdquo; on a call.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-on-ink"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="quick-schedule" className="mt-6 border-t border-hairline pt-5">
      <h3 id="quick-schedule" className="text-[15px] font-medium text-ink">
        Want Rize to call you again?
      </h3>
      <p className="mt-1 text-sm text-ink-secondary">
        A few minutes about your week, so your journal fills up without you remembering.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="How often">
        {DAY_OPTIONS.map((d) => (
          <button key={d.id} type="button" role="radio" aria-checked={dayId === d.id} onClick={() => setDayId(d.id)} className={chip(dayId === d.id)}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="What time">
        {TIME_OPTIONS.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={time === t.id} onClick={() => setTime(t.id)} className={chip(time === t.id)}>
            {t.label} <span className="opacity-70">· {t.hint}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-secondary">
        Rize&apos;s AI will call {phoneNumber ? <span className="tabular-nums">{phoneNumber}</span> : "your number"}{" "}
        {days.label.toLowerCase()} at {timeLabel}, your time. Calls are recorded for your private journal.
      </p>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-ink ring-1 ring-ink/10 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Yes, call me then"}
        </button>
        <button type="button" onClick={onDone} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ink-secondary hover:text-ink">
          Not now
        </button>
      </div>
    </section>
  );
}
