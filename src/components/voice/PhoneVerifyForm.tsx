"use client";

import { confirmPhoneVerification, sendPhoneVerification } from "@/actions/voice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

type Props = {
  initialPhone?: string;
  onVerified: (phone: string) => void;
  disabled?: boolean;
};

export default function PhoneVerifyForm({ initialPhone, onVerified, disabled }: Props) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidPhoneNumber(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setBusy(true);
    const result = await sendPhoneVerification(phone);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setStep("code");
    setCode("");
    setResendIn(30);
    toast.success("Code sent by SMS");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result = await confirmPhoneVerification(phone, code.trim());
    setBusy(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Phone number verified");
    onVerified(phone);
  };

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-3">
        <p className="text-sm text-muted-foreground">Enter the code we sent to {phone}</p>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
          disabled={busy || disabled}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" className="flex-1" disabled={busy || disabled || code.length < 4}>
            {busy ? "Checking..." : "Verify"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setStep("phone")} disabled={busy}>
            Change number
          </Button>
        </div>
        <button
          type="button"
          onClick={() => sendCode()}
          disabled={busy || disabled || resendIn > 0}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-3">
      <div className="flex h-10 w-full items-center rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm">
        <PhoneInput
          international
          defaultCountry="IN"
          value={phone}
          onChange={(value) => setPhone(value || "")}
          disabled={busy || disabled}
          flagComponent={() => <span className="hidden" />}
          internationalIconComponent={() => <></>}
          addInternationalOption={false}
          countrySelectProps={{ className: "w-24 focus:outline-none dark:bg-neutral-900" }}
          numberInputProps={{ className: "flex-1 ml-3 outline-none bg-transparent dark:bg-neutral-900" }}
          className="flex w-full items-center [&_.PhoneInputCountryIcon]:hidden"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={busy || disabled || !phone || !isValidPhoneNumber(phone)}
      >
        {busy ? "Sending..." : "Send verification code"}
      </Button>
    </form>
  );
}
