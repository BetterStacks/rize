"use client";

import { skipOnboarding } from "@/actions/onboarding-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhoneVerifyForm from "@/components/voice/PhoneVerifyForm";
import { startVoiceCall } from "@/components/voice/startVoiceCall";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  isOpen: boolean;
  userName: string;
  onClose?: () => void;
};

export default function PhoneCollectionModal({
  isOpen,
  userName,
  onClose,
}: Props) {
  const { data: session } = useSession()
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // After the number is verified, GPT-Live calls the user for the onboarding interview.
  const handleVerified = async () => {
    setIsSubmitting(true);
    const result = await startVoiceCall("onboarding");
    setIsSubmitting(false);
    if (result.ok) {
      toast.success("Verified! You will receive a call shortly.");
      onClose?.();
    } else {
      toast.error(`${result.error} You can try again from Settings → Voice journal.`);
    }
    router.refresh();
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const result = await skipOnboarding();
      if (result.success) {
        toast.success("We will remind you next time! 👋");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md sm:rounded-xl dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle className="font-medium tracking-wide">
            Welcome,{" "}
            <span className="tracking-tight">{userName}</span> 👋
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We'll call you and ask a few questions to set up your profile. Hindi or English, your choice.
          </p>

          <div className="space-y-4">
            <PhoneVerifyForm
              initialPhone={session?.user?.phoneNumber || ""}
              onVerified={handleVerified}
              disabled={isSubmitting}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              I'll do this later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
