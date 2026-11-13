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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { TTranscriptTurn, TVoiceCallKind, TVoiceCallStatus, TVoiceDraftStatus } from "@/db/schema";
import { SUGGESTION_TEXT_LIMITS } from "@/lib/voice/profile-suggestions";
import { formatDistanceToNow } from "date-fns";
import { Phone, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import PhoneVerifyForm from "./PhoneVerifyForm";
import { startVoiceCall } from "./startVoiceCall";

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
};

type Props = {
  phoneNumber: string | null;
  phoneVerified: boolean;
  calls: VoiceCallRow[];
  drafts: VoiceDraftRow[];
  suggestions: OnboardingSuggestions | null;
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

export default function VoiceJournal({ phoneNumber, phoneVerified, calls, drafts, suggestions }: Props) {
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
    <div className="w-full space-y-6">
      {suggestions && (
        <SuggestionsCard key={suggestions.callId} data={suggestions} onDone={() => router.refresh()} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Voice journal
          </CardTitle>
          <CardDescription>
            Rize's AI calls you and asks about one thing from your week, in Hindi or English. Calls take about
            five minutes. If something you said would make a good post, you'll find a draft cut from your own words.
            Nothing is posted until you publish it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  We'll call <span className="font-medium text-foreground">{phoneNumber}</span>
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setChangingNumber(true)}>
                    Change number
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        Remove number
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
              <Button className="w-full" onClick={callMe} disabled={calling || live}>
                <Phone className="mr-2 h-4 w-4" />
                {live ? "Call in progress…" : calling ? "Starting call…" : "Call me"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Calls are recorded. Recordings are deleted automatically after 7 days. Transcripts and drafts stay
                in your account until you delete them in Call history.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList>
          <TabsTrigger value="drafts">Drafts{openDrafts.length ? ` (${openDrafts.length})` : ""}</TabsTrigger>
          <TabsTrigger value="history">Call history</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-4 pt-2">
          {waitingForDrafts && (
            <p className="text-sm text-muted-foreground">Writing drafts from your last call…</p>
          )}
          {drafts.length === 0 && !waitingForDrafts && (
            <p className="text-sm text-muted-foreground">No drafts yet. Drafts appear here after a call.</p>
          )}
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} onChange={() => router.refresh()} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 pt-2">
          {calls.length === 0 && <p className="text-sm text-muted-foreground">No calls yet.</p>}
          {calls.map((call) => (
            <CallRow key={call.id} call={call} onChange={() => router.refresh()} />
          ))}
        </TabsContent>
      </Tabs>
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
    isEmpty ? null : <p className="text-xs text-muted-foreground">Added next to what's already on your profile.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>From your onboarding call</CardTitle>
        <CardDescription>
          This is what we heard on your call. None of it is on your profile yet. Tick what you want to add and
          change the wording if you like.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {TEXT_FIELDS.filter(({ field }) => s[field]).map(({ field, label, current }) => (
          <div key={field} className="space-y-2">
            <label className="flex items-start gap-3 text-sm font-medium">
              <Checkbox
                className="mt-0.5"
                checked={checked[field]}
                disabled={busy}
                onCheckedChange={(v) => setChecked((c) => ({ ...c, [field]: v === true }))}
              />
              <span>
                {label}
                {!empty[field] && (
                  <span className="block text-xs font-normal text-muted-foreground">Replaces {current}</span>
                )}
              </span>
            </label>
            <Textarea
              value={text[field]}
              onChange={(e) => setText((t) => ({ ...t, [field]: e.target.value }))}
              rows={3}
              maxLength={SUGGESTION_TEXT_LIMITS[field]}
              disabled={busy}
            />
            <p className="text-right text-xs text-muted-foreground">
              {text[field].length}/{SUGGESTION_TEXT_LIMITS[field]}
            </p>
          </div>
        ))}

        {s.experience.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Experience</p>
            {sectionNote(empty.experience)}
            {s.experience.map((e, i) => (
              <label key={i} className="flex items-start gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={exp.includes(i)}
                  disabled={busy}
                  onCheckedChange={(v) => setExp((l) => toggle(l, i, v === true))}
                />
                <span className="space-y-1">
                  <span className="block font-medium">{[e.title, e.company].filter(Boolean).join(" at ")}</span>
                  {dateRange(e.startDate, e.endDate, e.currentlyWorking) && (
                    <span className="block text-xs text-muted-foreground">
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
            <p className="text-sm font-medium">Education</p>
            {sectionNote(empty.education)}
            {s.education.map((e, i) => (
              <label key={i} className="flex items-start gap-3 text-sm">
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
                    <span className="block text-xs text-muted-foreground">{dateRange(e.startDate, e.endDate)}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}

        {s.projects.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Projects</p>
            {sectionNote(empty.projects)}
            {s.projects.map((p, i) => (
              <label key={i} className="flex items-start gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={proj.includes(i)}
                  disabled={busy}
                  onCheckedChange={(v) => setProj((l) => toggle(l, i, v === true))}
                />
                <span className="space-y-1">
                  <span className="block font-medium">
                    {p.name}
                    <Badge variant="outline" className="ml-2 align-middle font-normal">
                      {p.status === "completed" ? "Finished" : "In progress"}
                    </Badge>
                  </span>
                  {p.tagline && <span className="block text-muted-foreground">{p.tagline}</span>}
                  {p.description && <span className="block whitespace-pre-wrap">{p.description}</span>}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={add} disabled={busy || selectedCount === 0}>
            Add selected to my profile
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss} disabled={busy}>
            Dismiss
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dismiss keeps your profile as it is. The call and its transcript stay in Call history until you delete them.
        </p>
      </CardContent>
    </Card>
  );
}

function DraftCard({ draft, onChange }: { draft: VoiceDraftRow; onChange: () => void }) {
  const [content, setContent] = useState(draft.content);
  const [busy, setBusy] = useState(false);
  const dirty = content.trim() !== draft.content.trim();
  const isPublished = draft.status === "published";

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.success) {
      toast.error(result.error || "Something went wrong");
      return;
    }
    toast.success(ok);
    onChange();
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}</span>
          {isPublished && <Badge variant="secondary">Published</Badge>}
        </div>
        {isPublished ? (
          <p className="whitespace-pre-wrap text-sm">{draft.content}</p>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={5000}
            disabled={busy}
          />
        )}
        {!isPublished && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !dirty}
              onClick={() => run(() => updateVoiceDraft(draft.id, content), "Draft saved")}
            >
              Save
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={busy || !content.trim()}>
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    It will appear on your profile and in the feed.
                  </AlertDialogDescription>
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
                      }, "Published")
                    }
                  >
                    Publish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-red-600" disabled={busy}>
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
        )}
      </CardContent>
    </Card>
  );
}

function CallRow({ call, onChange }: { call: VoiceCallRow; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const canRetry = call.status === "completed" && !call.draftsGeneratedAt;

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {call.kind === "onboarding" ? "Onboarding call" : "Journal call"}
              <Badge variant={call.status === "completed" ? "secondary" : "outline"}>
                {STATUS_LABEL[call.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
              {formatDuration(call.durationSeconds) ? ` · ${formatDuration(call.durationSeconds)}` : ""}
              {call.error ? ` · ${call.error}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {canRetry && (
              <Button
                size="sm"
                variant="outline"
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
              <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
                {open ? "Hide transcript" : "Transcript"}
              </Button>
            )}
            {!["queued", "ringing", "in_progress"].includes(call.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-red-600">
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
          <audio controls preload="none" className="w-full" src={`/api/voice/calls/${call.id}/recording`} />
        )}
        {open && call.transcript && (
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg bg-muted/50 p-3 text-sm">
            {call.transcript.map((turn, i) => (
              <p key={i}>
                <span className="font-medium">{turn.role === "user" ? "You" : "Rize"}: </span>
                {turn.text}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
