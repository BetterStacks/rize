"use client";

import { saveCallSchedule, type CallSchedule } from "@/actions/voice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CallDay } from "@/lib/voice/schedule";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const describeDays = (days: string[]) => {
  if (days.length === 7) return "every day";
  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  if (days.length === 5 && weekdays.every((d) => days.includes(d))) return "on weekdays";
  return "on " + DAYS.filter((d) => days.includes(d.id)).map((d) => d.label).join(", ");
};

type Props = { schedule: CallSchedule; phoneNumber: string };

/*
 * "Call me on a schedule". Off by default. Turning it on is the person's
 * consent to be called on these days at this time; they can turn it off here
 * at any time, or by saying "stop calling me" on a call.
 */
export default function CallScheduleCard({ schedule, phoneNumber }: Props) {
  const router = useRouter();
  const [days, setDays] = useState<string[]>(schedule.days.length ? schedule.days : ["mon", "wed", "fri"]);
  const [time, setTime] = useState(schedule.time ?? "19:00");
  const timezone = useMemo(() => schedule.timezone ?? browserTimezone(), [schedule.timezone]);
  const [enabled, setEnabled] = useState(schedule.enabled);
  const [busy, setBusy] = useState(false);

  const dirty =
    enabled !== schedule.enabled ||
    time !== (schedule.time ?? "19:00") ||
    days.join() !== (schedule.days.length ? schedule.days : ["mon", "wed", "fri"]).join();

  const save = async (nextEnabled: boolean) => {
    setBusy(true);
    const result = await saveCallSchedule({
      enabled: nextEnabled,
      days: days as CallDay[],
      time,
      timezone: browserTimezone(),
    });
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      setEnabled(schedule.enabled);
      return;
    }
    setEnabled(nextEnabled);
    toast.success(nextEnabled ? "Scheduled calls are on" : "Scheduled calls are off");
    router.refresh();
  };

  const toggleDay = (id: string) =>
    setDays((current) => (current.includes(id) ? current.filter((d) => d !== id) : [...current, id]));

  return (
    <div className="rounded-[20px] border border-hairline bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor="schedule-switch" className="text-[15px] font-medium text-ink">
            Call me on a schedule
          </Label>
          <p className="mt-1 text-sm text-ink-secondary">
            Rize calls you at a time you pick, so you don&apos;t have to remember.
          </p>
        </div>
        <Switch
          id="schedule-switch"
          checked={enabled}
          disabled={busy}
          onCheckedChange={(checked) => {
            if (!checked) {
              save(false);
            } else {
              setEnabled(true);
            }
          }}
        />
      </div>

      {schedule.paused && !enabled && (
        <p role="status" className="mt-4 rounded-xl bg-subtle px-4 py-3 text-sm text-ink">
          We paused your scheduled calls after a few missed ones. Turn them back on any time.
        </p>
      )}

      {enabled && (
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-ink">Days</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = days.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(d.id)}
                    className={cn(
                      "min-h-11 min-w-12 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                      on
                        ? "border-ink/10 bg-brand text-brand-ink"
                        : "border-hairline bg-surface text-ink-secondary hover:text-ink"
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <Label htmlFor="schedule-time" className="text-sm font-medium text-ink">
              Time
            </Label>
            <Input
              id="schedule-time"
              type="time"
              min="08:00"
              max="21:55"
              step={300}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 h-11 w-40"
            />
            <p className="mt-1 text-xs text-ink-secondary">Between 8am and 10pm, {timezone.replace("_", " ")} time.</p>
          </div>

          {days.length > 0 && (
            <p className="rounded-xl bg-highlight px-4 py-3 text-sm leading-relaxed text-ink">
              Rize&apos;s AI will call <span className="font-medium tabular-nums">{phoneNumber}</span>{" "}
              {describeDays(days)} at {formatTime(time)}. Calls are recorded and go to your private journal. Turn
              this off here any time, or say &ldquo;stop calling me&rdquo; on a call.
            </p>
          )}

          <Button
            variant="brand"
            onClick={() => save(true)}
            disabled={busy || days.length === 0 || (!dirty && schedule.enabled)}
          >
            {schedule.enabled ? "Save changes" : "Turn on scheduled calls"}
          </Button>
        </div>
      )}
    </div>
  );
}
