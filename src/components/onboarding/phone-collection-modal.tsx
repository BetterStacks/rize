"use client";

import { skipOnboarding } from "@/actions/onboarding-actions";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhoneVerifyForm, {
  primaryButtonClass,
  quietLinkClass,
} from "@/components/voice/PhoneVerifyForm";
import QuickSchedulePrompt from "@/components/voice/QuickSchedulePrompt";
import { startVoiceCall } from "@/components/voice/startVoiceCall";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, PhoneCall, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  userName?: string;
  onClose?: () => void;
  /** Offer "call me again on a schedule" while the first call rings. */
  scheduleAvailable?: boolean;
};

type Stage = "setup" | "placing" | "calling" | "call_failed";

const ink = "text-[#1F1B16] dark:text-[#F4F4F5]";
const muted = "text-[#5A5248] dark:text-[#A9A9AE]";

export default function PhoneCollectionModal({ isOpen, onClose, scheduleAvailable = false }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  // Local state, so a server refresh after verification (which stops the
  // profile page rendering this dialog) can't cut the "calling" screen short.
  const [open, setOpen] = useState(isOpen);
  const [stage, setStage] = useState<Stage>("setup");
  const [howOpen, setHowOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onClose?.();
    if (stage === "setup") {
      // Esc, the close button and "Later" all count as "not now", remembered
      // for this account on this browser.
      void skipOnboarding().catch(() => undefined);
    } else {
      router.refresh();
    }
  };

  const placeCall = async () => {
    setStage("placing");
    const result = await startVoiceCall("onboarding");
    setStage(result.ok ? "calling" : "call_failed");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        showCloseButton
        className="max-w-[420px] gap-0 p-6 sm:p-8"
        // A stray tap on the backdrop (common when dismissing the phone
        // keyboard) shouldn't count as "Later". Esc, the X and Later do.
        onInteractOutside={(e) => e.preventDefault()}
      >

        {stage === "setup" && (
          <>
            <DialogHeader className="space-y-3 pr-8 text-left">
              <DialogTitle className={cn("font-instrument text-[34px] font-normal leading-[1.05] tracking-normal", ink)}>
                Rize calls you
              </DialogTitle>
              <DialogDescription className={cn("text-[15px] leading-relaxed", muted)}>
                A short call with Rize&apos;s AI to set up your profile. It&apos;s recorded, and you choose what goes on your profile.
              </DialogDescription>
            </DialogHeader>

            <Collapsible open={howOpen} onOpenChange={setHowOpen} className="mt-3">
              <CollapsibleTrigger className={cn(quietLinkClass, "inline-flex min-h-11 items-center gap-1 -ml-1 px-1")}>
                How it works
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200 motion-reduce:transition-none", howOpen && "rotate-180")}
                  aria-hidden
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ol className={cn("mb-2 space-y-2 border-l border-[#E7E2D8] pl-4 text-sm leading-relaxed dark:border-[#2C2C31]", muted)}>
                  <li>We text you a code to confirm the number.</li>
                  <li>Rize&apos;s AI calls right away and asks about you, in Hindi or English.</li>
                  <li>Afterwards you see what it heard. Nothing goes on your profile until you add it.</li>
                  <li>You can delete the recording any time in Settings.</li>
                </ol>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-5">
              <PhoneVerifyForm
                initialPhone={session?.user?.phoneNumber || ""}
                onVerified={() => void placeCall()}
              />
            </div>

            <div className="mt-3 flex justify-center">
              <button type="button" onClick={close} className={cn(quietLinkClass, "min-h-11 px-4")}>
                Later
              </button>
            </div>
          </>
        )}

        {(stage === "placing" || stage === "calling") && (
          <div className="pr-8">
            <span
              className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-main-yellow text-[#1F1B16]"
              aria-hidden
            >
              {stage === "placing" ? (
                <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
              ) : (
                <PhoneCall className="h-5 w-5" />
              )}
            </span>
            <DialogHeader className="space-y-3 text-left" aria-live="polite">
              <DialogTitle className={cn("font-instrument text-[34px] font-normal leading-[1.05] tracking-normal", ink)}>
                {stage === "placing" ? "Number confirmed" : "Calling you now"}
              </DialogTitle>
              <DialogDescription className={cn("text-[15px] leading-relaxed", muted)}>
                {stage === "placing"
                  ? "Placing your call."
                  : "Your phone should ring in a few seconds."}
              </DialogDescription>
            </DialogHeader>
            {stage === "calling" && (
              <>
                <ul className={cn("mt-6 space-y-3 border-t border-[#E7E2D8] pt-5 text-sm leading-relaxed dark:border-[#2C2C31]", muted)}>
                  <li>
                    <span className={cn("font-medium", ink)}>On the call.</span> A few questions about you, in Hindi or English.
                  </li>
                  <li>
                    <span className={cn("font-medium", ink)}>After.</span> You&apos;ll see what Rize heard and pick what goes on your profile.
                  </li>
                </ul>
                {scheduleAvailable ? (
                  <QuickSchedulePrompt phoneNumber={session?.user?.phoneNumber} onDone={close} />
                ) : (
                  <Button type="button" onClick={close} className={cn(primaryButtonClass, "mt-7")}>
                    Got it
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {stage === "call_failed" && (
          <div className="pr-8">
            <span
              className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFE7] text-[#5A5248] dark:bg-[#2C2C31] dark:text-[#A9A9AE]"
              aria-hidden
            >
              <PhoneOff className="h-5 w-5" />
            </span>
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className={cn("font-instrument text-[34px] font-normal leading-[1.05] tracking-normal", ink)}>
                The call didn&apos;t go through
              </DialogTitle>
              <DialogDescription className={cn("text-[15px] leading-relaxed", muted)}>
                Your number is confirmed. Try again now, or start the call later from Settings.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" onClick={() => void placeCall()} className={cn(primaryButtonClass, "mt-7")}>
              Try again
            </Button>
            <div className="mt-3 flex justify-center">
              <Link href="/settings/voice" onClick={close} className={cn(quietLinkClass, "inline-flex min-h-11 items-center px-4")}>
                Go to Settings
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
