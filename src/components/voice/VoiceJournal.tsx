"use client";

import {
  deleteVoiceDraft,
  publishVoiceDraft,
  retryDraftGeneration,
  updateVoiceDraft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { TTranscriptTurn, TVoiceCallKind, TVoiceCallStatus, TVoiceDraftStatus } from "@/db/schema";
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

export default function VoiceJournal({ phoneNumber, phoneVerified, calls, drafts }: Props) {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Voice journal
          </CardTitle>
          <CardDescription>
            We call you, ask about what you've been working on (Hindi or English), and turn it into 2–3
            draft posts in your own words. Calls last up to 12 minutes. Nothing is posted until you publish it.
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
                <Button variant="ghost" size="sm" onClick={() => setChangingNumber(true)}>
                  Change number
                </Button>
              </div>
              <Button className="w-full" onClick={callMe} disabled={calling || live}>
                <Phone className="mr-2 h-4 w-4" />
                {live ? "Call in progress…" : calling ? "Starting call…" : "Call me"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Calls are recorded. Recordings are deleted automatically after 7 days; transcripts and drafts stay
                in your account.
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
