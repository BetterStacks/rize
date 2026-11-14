"use client";

import {
  deleteCallMemory,
  forgetAllCallMemories,
  setCallMemoryEnabled,
  type CallMemoryRow,
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/*
 * "What Rize remembers": the notes kept between calls, each with the
 * person's own words and when they said it. Deleting really deletes.
 */
export default function CallMemoryList({ enabled, memories }: { enabled: boolean; memories: CallMemoryRow[] }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (next: boolean) => {
    setOn(next);
    const result = await setCallMemoryEnabled(next);
    if (!result.success) {
      setOn(!next);
      toast.error(result.error);
      return;
    }
    toast.success(next ? "Rize will remember things between calls" : "Rize won't use or keep notes between calls");
    router.refresh();
  };

  const remove = async (id: string) => {
    setBusyId(id);
    const result = await deleteCallMemory(id);
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-[20px] border border-hairline bg-surface p-5">
        <div>
          <Label htmlFor="memory-switch" className="text-[15px] font-medium text-ink">
            Remember things between calls
          </Label>
          <p className="mt-1 max-w-[52ch] text-sm text-ink-secondary">
            So a later call can ask how something went. Only you see these, and they&apos;re only used on your own calls.
          </p>
        </div>
        <Switch id="memory-switch" checked={on} onCheckedChange={toggle} />
      </div>

      {memories.length === 0 ? (
        <p className="text-[15px] text-ink-secondary">
          Nothing yet. After a call, a few things worth following up on show up here.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {memories.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-xs text-ink-secondary">
                    {dateLabel(m.createdAt)}
                    {m.status === "resolved" ? " · followed up" : ""}
                  </p>
                  <p className="mt-1 font-instrument text-lg leading-snug text-ink">&ldquo;{m.quote}&rdquo;</p>
                  <p className="mt-1 text-sm text-ink-secondary">{m.note}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Forget this"
                  className="touch-target h-11 shrink-0 px-3 text-ink-secondary hover:text-ink"
                  disabled={busyId === m.id}
                  onClick={() => remove(m.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-11 px-3 text-sm text-ink-secondary hover:text-ink">
                Forget everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Forget everything Rize remembers?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes all {memories.length} notes for good. Your calls, transcripts and drafts stay.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    const result = await forgetAllCallMemories();
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Forgotten");
                    router.refresh();
                  }}
                >
                  Forget everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
