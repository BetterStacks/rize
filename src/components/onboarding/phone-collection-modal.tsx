"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  initiateOnboardingCall,
  skipOnboarding,
} from "@/actions/onboarding-actions";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import axios from "axios";
import { VAPI_ASSISTANT_CONFIG } from "@/lib/vapi-config";
import { useSession } from "@/lib/auth-client";

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
  const [phone, setPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      //   const result = await initiateOnboardingCall(phone);
      const vapiResponse = await axios.post(
        "https://api.vapi.ai/call",
        {
          phoneNumberId: "1622de54-b23a-4e05-88db-cff2cee4b15c",
          customer: { number: phone },
          assistant: {
            ...VAPI_ASSISTANT_CONFIG,
            firstMessage: VAPI_ASSISTANT_CONFIG.firstMessage.replace(
              "{userName}",
              session?.user?.displayName || "there"
            ),
          },
          metadata: {
            userId: session?.user?.id,
            userName: session?.user?.name,
          },
        },
        {
          headers: {
            Authorization: `Bearer 3a6eb457-3e67-450d-a5cf-0e0d0b5db882`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(vapiResponse);
      if (vapiResponse.status === 200) {
        toast.success("Phone number saved! You will receive a call shortly.");
        onClose?.();
      } else {
        toast.error("Failed to save phone number");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const result = await skipOnboarding();
      if (result.success) {
        toast.info("We will remind you next time! 👋");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium tracking-wide">
            Welcome,{" "}
            <span className="font-normal tracking-tight">{userName}</span> 👋
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We'll ask you a few questions to understand you better
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex h-10 w-full items-center rounded-md border border-gray-300 bg-background px-3 py-2 text-sm">
              <PhoneInput
                international
                defaultCountry="IN"
                value={phone}
                onChange={(value) => setPhone(value || "")}
                disabled={isSubmitting}
                flagComponent={() => <span className="hidden" />}
                internationalIconComponent={() => <></>}
                addInternationalOption={false}
                countrySelectProps={{
                  className: "w-24 focus:outline-none bg-transparent",
                }}
                numberInputProps={{
                  className: "flex-1 ml-3 outline-none bg-transparent",
                }}
                className="flex w-full items-center [&_.PhoneInputCountryIcon]:hidden"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={!phone || !isValidPhoneNumber(phone) || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue →"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              I'll do this later
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
