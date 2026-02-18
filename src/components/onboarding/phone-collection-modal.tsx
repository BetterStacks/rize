"use client";

import {
  initiateOnboardingCall,
  skipOnboarding,
} from "@/actions/onboarding-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";

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
  const [phone, setPhone] = useState<string>(session?.user?.phoneNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await initiateOnboardingCall(phone);
      if (!result.error && result.success) {
        toast.success("Phone number saved! You will receive a call shortly.");
        onClose?.();
      } else {
        toast.error(result.error || "Failed to save phone number");
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
      <DialogContent className="sm:max-w-md sm:rounded-xl dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle className="font-medium tracking-wide">
            Welcome,{" "}
            <span className="tracking-tight">{userName}</span> 👋
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We'll ask you a few questions to understand you better
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex h-10 w-full items-center rounded-lg border border-gray-300 dark:border-neutral-800  px-3 py-2 text-sm">
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
                  className: "w-24 focus:outline-none dark:bg-neutral-900",
                }}
                numberInputProps={{
                  className: "flex-1 ml-3 outline-none dark:bg-neutral-900",
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
