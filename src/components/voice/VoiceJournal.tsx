"use client";

import {
  applyOnboardingSuggestions,
  deleteVoiceCall,
  deleteVoiceDraft,
  dismissOnboardingSuggestions,
  publishVoiceDraft,
  removeMyPhoneNumber,
  retryDraftGeneration,
  updateVoiceDraft,
  type OnboardingSuggestions,
} from "@/actions/voice-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { TTranscriptTurn, TVoiceCallKind, TVoiceCallStatus, TVoiceDraftStatus } from "@/db/schema";
import { SUGGESTION_TEXT_LIMITS } from "@/lib/voice/profile-suggestions";
import { newsreader } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { draftProvenance, type ProvenancePassage, type ProvenanceWord } from "@/lib/voice/draft-provenance";
import "@/styles/rize-tokens.css";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Loader2, Lock, Pencil, Phone, Share, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, forwardRef, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import PhoneVerifyForm from "./PhoneVerifyForm";
import { startVoiceCall } from "./startVoiceCall";
import CallScheduleCard from "./CallScheduleCard";
import CallMemoryList from "./CallMemoryList";
import type { CallMemoryRow, CallSchedule } from "@/actions/voice-actions";

export type VoiceCallRow = {
  id: string;
  kind: TVoiceCallKind;
  status: TVoiceCallStatus;
  transcript: TTranscriptTurn[] | null;
  hasRecording: boolean;
  durationSeconds: number | null;
  error: string | null;
  draftsGeneratedAt: Date | null;
  createdAt: Date;
};

export type VoiceDraftRow = {
  id: string;
  callId: string;
  content: string;
  status: TVoiceDraftStatus;
  postId: string | null;
  createdAt: Date;
  // What the user said on the draft's call, for "From your call"
  userTurns: string[];
};

type Props = {
  phoneNumber: string | null;
  phoneVerified: boolean;
  calls: VoiceCallRow[];
  drafts: VoiceDraftRow[];
  suggestions: OnboardingSuggestions | null;
  schedule?: CallSchedule;
  memory?: { enabled: boolean; aboutYou: string; memories: CallMemoryRow[] };
};

const STATUS_LABEL: Record<TVoiceCallStatus, string> = {
  queued: "Calling…",
  ringing: "Ringing",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
  no_answer: "No answer",
};

const formatDuration = (s: number | null) =>
  s ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : null;

export default function VoiceJournal({ phoneNumber, phoneVerified, calls, drafts, suggestions, schedule, memory }: Props) {
  const router = useRouter();
  const [changingNumber, setChangingNumber] = useState(!phoneVerified);
  const [calling, setCalling] = useState(false);

  const live = calls.some((c) => ["queued", "ringing", "in_progress"].includes(c.status));
  const waitingForDrafts = calls.some(
    (c) => c.status === "completed" && !c.draftsGeneratedAt && Date.now() - new Date(c.createdAt).getTime() < 20 * 60 * 1000
  );

  // Poll while a call is live or its drafts are still being written.
  useEffect(() => {
    if (!live && !waitingForDrafts) return;
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [live, waitingForDrafts, router]);

  const callMe = async () => {
    setCalling(true);
    const result = await startVoiceCall();
    setCalling(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Calling you now. Pick up!");
    router.refresh();
  };

  const openDrafts = drafts.filter((d) => d.status === "draft");

  return (
    <div className="w-full">
      {suggestions && (
        <SuggestionsCard key={suggestions.callId} data={suggestions} onDone={() => router.refresh()} />
      )}

      <section aria-labelledby="call-title" className="border-t border-hairline py-10">
        <h2 id="call-title" className="font-instrument text-[28px] leading-none text-ink">
          Calls
        </h2>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-secondary">
          Rize&apos;s AI calls you and asks about one thing from your week, in Hindi or English. Calls take about
          five minutes. If something you said would make a good post, you&apos;ll find a draft cut from your own words.
          Nothing is posted until you publish it.
        </p>

        <div className="mt-6 max-w-[640px] space-y-4">
          {changingNumber ? (
            <PhoneVerifyForm
              initialPhone={phoneNumber || ""}
              onVerified={() => {
                setChangingNumber(false);
                router.refresh();
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-hairline py-2 text-sm">
                <span className="text-ink-secondary">
                  We&apos;ll call <span className="font-medium tabular-nums text-ink">{phoneNumber}</span>
                </span>
                <div className="-mr-2 flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="touch-target h-11 px-3 text-sm text-ink-secondary hover:text-ink"
                    onClick={() => setChangingNumber(true)}
                  >
                    Change
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="touch-target h-11 px-3 text-sm text-ink-secondary hover:text-ink"
                      >
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove your number?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Rize won't be able to call you, and calls from this number won't reach your journal.
                          Your past calls and drafts stay until you delete them.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const result = await removeMyPhoneNumber();
                            if (!result.success) {
                              toast.error(result.error);
                              return;
                            }
                            toast.success("Number removed");
                            router.refresh();
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <Button
                variant="brand"
                size="lg"
                className="w-full sm:w-auto sm:min-w-40"
                onClick={callMe}
                disabled={calling || live}
              >
                <Phone className="mr-2 size-4" aria-hidden />
                {live ? "Call in progress…" : calling ? "Starting call…" : "Call me"}
              </Button>
              {schedule && phoneNumber && (
                <CallScheduleCard schedule={schedule} phoneNumber={phoneNumber} />
              )}
              <p className="text-xs leading-relaxed text-ink-secondary">
                Calls are recorded. Recordings are deleted automatically after 7 days. Transcripts and drafts stay
                in your account until you delete them in Call history.
              </p>
            </>
          )}
        </div>
      </section>

      <section aria-label="Drafts and call history" className="border-t border-hairline pt-8">
        <Tabs defaultValue="drafts" className="w-full">
          <TabsList>
            <TabsTrigger value="drafts">Drafts{openDrafts.length ? ` (${openDrafts.length})` : ""}</TabsTrigger>
            <TabsTrigger value="history">Call history</TabsTrigger>
            {memory && <TabsTrigger value="memory">What Rize remembers</TabsTrigger>}
          </TabsList>

          <TabsContent value="drafts" className="space-y-4 pt-4">
            {waitingForDrafts && (
              <p role="status" className="flex items-center gap-2 text-sm text-ink-secondary">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                Writing drafts from your last call…
              </p>
            )}
            {drafts.length === 0 && !waitingForDrafts && (
              <p className="text-[15px] text-ink-secondary">No drafts yet. They show up here after a call.</p>
            )}
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onChange={() => router.refresh()} />
            ))}
          </TabsContent>

          {memory && (
            <TabsContent value="memory" className="pt-4">
              <CallMemoryList enabled={memory.enabled} aboutYou={memory.aboutYou} memories={memory.memories} />
            </TabsContent>
          )}

          <TabsContent value="history" className="pt-4">
            {calls.length === 0 ? (
              <p className="text-[15px] text-ink-secondary">No calls yet.</p>
            ) : (
              <ul className="divide-y divide-hairline border-y border-hairline">
                {calls.map((call) => (
                  <CallRow key={call.id} call={call} onChange={() => router.refresh()} />
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

type TextField = "bio" | "personalMission" | "lifePhilosophy";
const TEXT_FIELDS: { field: TextField; label: string; current: string }[] = [
  { field: "bio", label: "Bio", current: "your current bio" },
  { field: "personalMission", label: "Personal mission", current: "your current personal mission" },
  { field: "lifePhilosophy", label: "Life philosophy", current: "your current life philosophy" },
];

const formatMonth = (value: string | null) => {
  if (!value) return null;
  const [y, m] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });
};
const dateRange = (start: string | null, end: string | null, current = false) => {
  const from = formatMonth(start);
  const to = current ? "Now" : formatMonth(end);
  if (!from && !to) return null;
  return [from, to].filter(Boolean).join(" – ");
};
const allIndexes = (items: unknown[], on: boolean) => (on ? items.map((_, i) => i) : []);

// Shows what the onboarding call heard. Nothing is on the profile until the
// person ticks items and adds them.
function SuggestionsCard({ data, onDone }: { data: OnboardingSuggestions; onDone: () => void }) {
  const { suggestions: s, empty } = data;
  const [text, setText] = useState<Record<TextField, string>>({
    bio: s.bio ?? "",
    personalMission: s.personalMission ?? "",
    lifePhilosophy: s.lifePhilosophy ?? "",
  });
  const [checked, setChecked] = useState<Record<TextField, boolean>>({
    bio: !!s.bio && empty.bio,
    personalMission: !!s.personalMission && empty.personalMission,
    lifePhilosophy: !!s.lifePhilosophy && empty.lifePhilosophy,
  });
  const [exp, setExp] = useState<number[]>(allIndexes(s.experience, empty.experience));
  const [edu, setEdu] = useState<number[]>(allIndexes(s.education, empty.education));
  const [proj, setProj] = useState<number[]>(allIndexes(s.projects, empty.projects));
  const [busy, setBusy] = useState(false);

  const toggle = (list: number[], i: number, on: boolean) =>
    on ? Array.from(new Set([...list, i])) : list.filter((x) => x !== i);

  const selectedCount =
    TEXT_FIELDS.filter(({ field }) => checked[field] && text[field].trim()).length + exp.length + edu.length + proj.length;

  const add = async () => {
    setBusy(true);
    const result = await applyOnboardingSuggestions(data.callId, {
      bio: checked.bio,
      personalMission: checked.personalMission,
      lifePhilosophy: checked.lifePhilosophy,
      experience: exp,
      education: edu,
      projects: proj,
      edits: text,
    });
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Added to your profile");
    onDone();
  };

  const dismiss = async () => {
    setBusy(true);
    const result = await dismissOnboardingSuggestions(data.callId);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onDone();
  };

  const sectionNote = (isEmpty: boolean) =>
    isEmpty ? null : <p className="text-xs text-ink-secondary">Added next to what&apos;s already on your profile.</p>;

  const groupTitle = "text-xs font-medium uppercase tracking-[0.08em] text-ink-secondary";

  return (
    <section aria-labelledby="suggestions-title" className="border-t border-hairline py-10">
      <h2 id="suggestions-title" className="font-instrument text-[28px] leading-none text-ink">
        From your onboarding call
      </h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-secondary">
        This is what we heard on your call. None of it is on your profile yet. Tick what you want to add and
        change the wording if you like. Anything you leave unticked won&apos;t be shown again.
      </p>

      <div className="mt-6 max-w-[640px] space-y-8">
        {TEXT_FIELDS.filter(({ field }) => s[field]).map(({ field, label, current }) => (
          <div key={field} className="space-y-2">
            <label className="flex min-h-11 items-start gap-3 text-sm font-medium text-ink">
              <Checkbox
                className="mt-0.5"
                checked={checked[field]}
                disabled={busy}
                onCheckedChange={(v) => setChecked((c) => ({ ...c, [field]: v === true }))}
              />
              <span>
                {label}
                {!empty[field] && (
                  <span className="block text-xs font-normal text-ink-secondary">Replaces {current}</span>
                )}
              </span>
            </label>
            <Textarea
              value={text[field]}
              onChange={(e) => setText((t) => ({ ...t, [field]: e.target.value }))}
              rows={3}
              maxLength={SUGGESTION_TEXT_LIMITS[field]}
              disabled={busy}
              aria-label={label}
            />
            <p className="text-right text-xs tabular-nums text-ink-secondary">
              {text[field].length}/{SUGGESTION_TEXT_LIMITS[field]}
            </p>
          </div>
        ))}

        {s.experience.length > 0 && (
          <div className="space-y-3">
            <p className={groupTitle}>Experience</p>
            {sectionNote(empty.experience)}
            {s.experience.map((e, i) => (
              <label key={i} className="flex items-start gap-3 text-sm text-ink">
                <Checkbox
                  className="mt-0.5"
                  checked={exp.includes(i)}
                  disabled={busy}
                  onCheckedChange={(v) => setExp((l) => toggle(l, i, v === true))}
                />
                <span className="space-y-1">
                  <span className="block font-medium">{[e.title, e.company].filter(Boolean).join(" at ")}</span>
                  {dateRange(e.startDate, e.endDate, e.currentlyWorking) && (
                    <span className="block text-xs text-ink-secondary">
                      {dateRange(e.startDate, e.endDate, e.currentlyWorking)}
                    </span>
                  )}
                  {e.description && <span className="block whitespace-pre-wrap">{e.description}</span>}
                </span>
              </label>
            ))}
          </div>
        )}

        {s.education.length > 0 && (
          <div className="space-y-3">
            <p className={groupTitle}>Education</p>
            {sectionNote(empty.education)}
            {s.education.map((e, i) => (
              <label key={i} className="flex items-start gap-3 text-sm text-ink">
                <Checkbox
                  className="mt-0.5"
                  checked={edu.includes(i)}
                  disabled={busy}
                  onCheckedChange={(v) => setEdu((l) => toggle(l, i, v === true))}
                />
                <span className="space-y-1">
                  <span className="block font-medium">{e.school}</span>
                  {(e.degree || e.fieldOfStudy) && (
                    <span className="block">{[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")}</span>
                  )}
                  {dateRange(e.startDate, e.endDate) && (
                    <span className="block text-xs text-ink-secondary">{dateRange(e.startDate, e.endDate)}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}

        {s.projects.length > 0 && (
          <div className="space-y-3">
            <p className={groupTitle}>Projects</p>
            {sectionNote(empty.projects)}
            {s.projects.map((p, i) => (
              <label key={i} className="flex items-start gap-3 text-sm text-ink">
                <Checkbox
                  className="mt-0.5"
                  checked={proj.includes(i)}
                  disabled={busy}
                  onCheckedChange={(v) => setProj((l) => toggle(l, i, v === true))}
                />
                <span className="space-y-1">
                  <span className="block font-medium">
                    {p.name}
                    <span className="ml-2 text-xs font-normal text-ink-secondary">
                      {p.status === "completed" ? "Finished" : "In progress"}
                    </span>
                  </span>
                  {p.tagline && <span className="block text-ink-secondary">{p.tagline}</span>}
                  {p.description && <span className="block whitespace-pre-wrap">{p.description}</span>}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-hairline pt-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={add} disabled={busy || selectedCount === 0}>
              Add selected to my profile
            </Button>
            <Button variant="ghost" className="text-ink-secondary hover:text-ink" onClick={dismiss} disabled={busy}>
              Dismiss
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Dismiss keeps your profile as it is. The call and its transcript stay in Call history until you delete
            them.
          </p>
        </div>
      </div>
    </section>
  );
}

// Draft review: one draft per card, on warm paper, in the person's own words.
// Colours, radius and the display face come from src/styles/rize-tokens.css.
const paperText = "text-[var(--rize-ink)]";
const paperMuted = "text-[var(--rize-ink-secondary)]";

function DraftCard({ draft, onChange }: { draft: VoiceDraftRow; onChange: () => void }) {
  const [content, setContent] = useState(draft.content);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  // "Not now" only folds the card away on this screen; nothing is stored.
  const [folded, setFolded] = useState(false);
  const dirty = content.trim() !== draft.content.trim();
  const isPublished = draft.status === "published";
  const provenance = useMemo(
    () => draftProvenance(draft.content, draft.userTurns),
    [draft.content, draft.userTurns]
  );

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.success) {
      toast.error(result.error || "Something went wrong");
      return false;
    }
    toast.success(ok);
    onChange();
    return true;
  };

  const date = formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true });

  if (folded) {
    return (
      <div
        className={cn(
          newsreader.variable,
          "flex items-center gap-3 rounded-[var(--rize-radius-card)] border border-[var(--rize-paper-border)] bg-[var(--rize-paper)] py-2 pl-5 pr-2",
          paperText
        )}
      >
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs", paperMuted)}>Not now · still private · {date}</p>
          <p className="rize-display truncate text-base">{draft.content}</p>
        </div>
        <Button
          variant="ghost"
          className={cn("h-11 shrink-0 rounded-full px-4 hover:bg-transparent dark:hover:bg-transparent", paperText)}
          onClick={() => setFolded(false)}
        >
          Show
        </Button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        newsreader.variable,
        "space-y-5 rounded-[var(--rize-radius-card)] border border-[var(--rize-paper-border)] bg-[var(--rize-paper)] p-5 sm:p-7",
        paperText
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-[11px] font-medium uppercase tracking-[0.12em]", paperMuted)}>In your words</p>
        <div className={cn("flex items-center gap-2 text-xs", paperMuted)}>
          <span>{date}</span>
          {isPublished && <Badge variant="secondary">Published</Badge>}
        </div>
      </div>

      {editing && !isPublished ? (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            maxLength={5000}
            disabled={busy}
            autoFocus
            aria-label="Edit your draft"
            className="rize-display rounded-xl border-[var(--rize-paper-border)] bg-transparent text-lg leading-snug text-[var(--rize-ink)] dark:border-[var(--rize-paper-border)] dark:bg-transparent"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-full px-5"
              disabled={busy || !dirty}
              onClick={async () => {
                if (await run(() => updateVoiceDraft(draft.id, content), "Draft saved")) setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              className={cn("h-11 rounded-full px-5", paperMuted)}
              disabled={busy}
              onClick={() => {
                setContent(draft.content);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="rize-display whitespace-pre-wrap text-[23px] leading-[1.3] sm:text-[26px]">{draft.content}</p>
      )}

      {provenance && !editing && <FromYourCall passages={provenance} />}

      {!isPublished && (
        <>
          <div className="grid grid-cols-3 justify-items-center gap-2 pt-1">
            <RoundAction
              icon={Lock}
              label="Not now"
              ariaLabel="Not now: fold this draft away. It stays private."
              disabled={busy}
              onClick={() => setFolded(true)}
            />
            <RoundAction
              icon={Pencil}
              label="Edit"
              ariaLabel="Edit this draft"
              pressed={editing}
              disabled={busy}
              onClick={() => setEditing(true)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <RoundAction
                  icon={Share}
                  label="Share"
                  ariaLabel="Share this draft as a post"
                  primary
                  disabled={busy || !content.trim()}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Share this post?</AlertDialogTitle>
                  <AlertDialogDescription>It will appear on your profile and in the feed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      run(async () => {
                        if (dirty) {
                          const saved = await updateVoiceDraft(draft.id, content);
                          if (!saved.success) return saved;
                        }
                        return publishVoiceDraft(draft.id);
                      }, "Shared on your profile")
                    }
                  >
                    Share
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--rize-paper-border)] pt-3">
            <p className={cn("text-xs", paperMuted)}>Nothing goes public unless you say so.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-11 shrink-0 px-3 hover:text-red-700 dark:hover:text-red-400", paperMuted)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                  <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => run(() => deleteVoiceDraft(draft.id), "Draft deleted")}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </article>
  );
}

type RoundActionProps = React.ComponentPropsWithoutRef<typeof Button> & {
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
  primary?: boolean;
  pressed?: boolean;
};

// Round icon button with its label underneath; the label is part of the button
// so the whole thing is one touch target.
const RoundAction = forwardRef<HTMLButtonElement, RoundActionProps>(
  ({ icon: Icon, label, ariaLabel, primary, pressed, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={cn(
        "group h-auto flex-col gap-2 rounded-2xl p-1 hover:bg-transparent dark:hover:bg-transparent",
        "text-[var(--rize-ink)]",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border transition-colors",
          primary
            ? "border-transparent bg-[var(--rize-button-fill)] text-[var(--rize-button-ink)] group-hover:opacity-90"
            : "border-[var(--rize-paper-border)] bg-[var(--rize-paper)] group-hover:bg-[var(--rize-paper-border)]",
          pressed && !primary && "bg-[var(--rize-paper-border)]"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-xs font-medium">{label}</span>
    </Button>
  )
);
RoundAction.displayName = "RoundAction";

// The passages of the call the draft was cut from: kept words highlighted,
// dropped words struck out, unused sentences in between left plain.
function FromYourCall({ passages }: { passages: ProvenancePassage[] }) {
  return (
    <details open className="group/call">
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden",
          paperMuted
        )}
      >
        <ChevronRight className="h-4 w-4 transition-transform group-open/call:rotate-90" aria-hidden="true" />
        From your call
      </summary>
      <div className="space-y-3 pt-1">
        {passages.map((p) => (
          <p key={p.turnIndex} className="text-[15px] leading-relaxed">
            {p.cutBefore && <span className={paperMuted}>… </span>}
            {wordRuns(p).map((r, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                {r.kind === "kept" ? (
                  <mark className="rounded-[3px] bg-[var(--rize-highlight)] px-0.5 text-[var(--rize-ink)]">{r.text}</mark>
                ) : r.kind === "dropped" ? (
                  <s className={paperMuted}>{r.text}</s>
                ) : (
                  <span className={paperMuted}>{r.text}</span>
                )}
              </Fragment>
            ))}
            {p.cutAfter && <span className={paperMuted}> …</span>}
          </p>
        ))}
        <p className={cn("text-xs", paperMuted)}>
          Highlighted words are in your draft. Struck-out words were left out.
        </p>
      </div>
    </details>
  );
}

// Joins neighbouring words of the same kind so a kept phrase is one highlight.
function wordRuns(passage: ProvenancePassage) {
  const runs: { kind: ProvenanceWord["kind"]; text: string }[] = [];
  for (const sentence of passage.sentences) {
    for (const w of sentence.words) {
      const last = runs[runs.length - 1];
      if (last && last.kind === w.kind) last.text += ` ${w.text}`;
      else runs.push({ kind: w.kind, text: w.text });
    }
  }
  return runs;
}

function CallRow({ call, onChange }: { call: VoiceCallRow; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const canRetry = call.status === "completed" && !call.draftsGeneratedAt;
  const failed = call.status === "failed" || call.status === "no_answer";
  const rowButton = "touch-target h-9 px-3 text-sm";

  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-ink">
            {call.kind === "onboarding" ? "Onboarding call" : "Journal call"}
            <span className={cn("ml-2 font-normal", failed ? "text-danger" : "text-ink-secondary")}>
              {STATUS_LABEL[call.status]}
            </span>
          </p>
          <p className="text-xs text-ink-secondary">
            {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
            {formatDuration(call.durationSeconds) ? ` · ${formatDuration(call.durationSeconds)}` : ""}
            {call.error ? ` · ${call.error}` : ""}
          </p>
        </div>
        <div className="-mr-3 flex flex-wrap items-center">
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              className={cn(rowButton, "mr-1")}
              disabled={retrying}
              onClick={async () => {
                setRetrying(true);
                const result = await retryDraftGeneration(call.id);
                setRetrying(false);
                if (!result.success) toast.error(result.error);
                onChange();
              }}
            >
              {retrying ? "Writing…" : "Generate drafts"}
            </Button>
          )}
          {!!call.transcript?.length && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(rowButton, "text-ink-secondary hover:text-ink")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Hide transcript" : "Transcript"}
            </Button>
          )}
          {!["queued", "ringing", "in_progress"].includes(call.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className={cn(rowButton, "text-ink-secondary hover:text-danger")}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this call?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This deletes the recording, the transcript and any drafts from this call. Posts you already
                    published stay on your profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={async () => {
                      const result = await deleteVoiceCall(call.id);
                      if (!result.success) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success("Call deleted");
                      onChange();
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      {call.hasRecording && (
        <audio
          controls
          preload="none"
          className="h-10 w-full"
          aria-label="Call recording"
          src={`/api/voice/calls/${call.id}/recording`}
        />
      )}
      {open && call.transcript && (
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl bg-subtle p-4 text-sm leading-relaxed text-ink">
          {call.transcript.map((turn, i) => (
            <p key={i}>
              <span className="font-medium">{turn.role === "user" ? "You" : "Rize"}: </span>
              {turn.text}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}
