"use client";

import {
  confirmPhoneVerification,
  sendPhoneVerification,
  type PhoneVerifyErrorCode,
} from "@/actions/voice-actions";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import PhoneInput, {
  formatPhoneNumberIntl,
  getCountryCallingCode,
  isValidPhoneNumber,
  type Country,
} from "react-phone-number-input";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

type ErrorCode = PhoneVerifyErrorCode | "network";

const ERROR_COPY: Record<ErrorCode, string> = {
  invalid_number: "That number doesn't look right. Check the country and the digits.",
  rate_limited: "Too many tries. Wait a minute, then try again.",
  taken: "This number is already on another Rize account.",
  send_failed: "We couldn't text that number. Check it and try again.",
  wrong_code: "That code didn't match. Try again.",
  expired: "That code has expired. Send a new one.",
  network: "Couldn't reach Rize. Check your connection and try again.",
};

// Shared look for the call setup screens (also used by PhoneCollectionModal).
export const primaryButtonClass =
  "h-12 w-full rounded-xl border-transparent bg-main-yellow text-[15px] font-medium text-[#1F1B16] hover:bg-[#F5CD1F] dark:border-transparent dark:bg-main-yellow dark:text-[#1F1B16] dark:hover:bg-[#F5CD1F] focus-visible:ring-[#1F1B16] dark:focus-visible:ring-[#F3EEE6] disabled:opacity-60";
export const quietLinkClass =
  "rounded-md text-sm text-[#5A5248] underline-offset-4 transition-colors hover:text-[#1F1B16] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD936] dark:text-[#B3A999] dark:hover:text-[#F3EEE6] disabled:pointer-events-none disabled:opacity-50";

type Props = {
  initialPhone?: string;
  onVerified: (phone: string) => void;
  disabled?: boolean;
};

type SendState = "idle" | "sending" | "sent";

export default function PhoneVerifyForm({ initialPhone, onVerified, disabled }: Props) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const verifyingRef = useRef(false);
  const sendIdRef = useRef(0);
  // Latest typed code, for a code entered while the SMS request is finishing.
  const codeRef = useRef("");
  const otpRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const phoneLabelId = useId();

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Optimistic: the code step shows right away while the SMS request runs.
  // A failed first send goes back to the number with an inline message.
  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sendState === "sending") return;
    if (!phone || !isValidPhoneNumber(phone)) {
      setError("invalid_number");
      return;
    }
    const isResend = step === "code";
    setError(null);
    setCode("");
    codeRef.current = "";
    setStep("code");
    setSendState("sending");
    const sendId = ++sendIdRef.current;

    let result: Awaited<ReturnType<typeof sendPhoneVerification>> | null = null;
    try {
      result = await sendPhoneVerification(phone);
    } catch {
      result = null;
    }
    // The person changed the number while this was in flight.
    if (sendId !== sendIdRef.current) return;

    if (!result?.success) {
      setError(result ? result.code : "network");
      if (isResend) {
        setSendState("sent");
      } else {
        setSendState("idle");
        setStep("phone");
      }
      return;
    }
    setSendState("sent");
    setResendIn(RESEND_SECONDS);
    if (codeRef.current.length === CODE_LENGTH) void verify(codeRef.current);
  };

  const verify = async (value: string) => {
      if (verifyingRef.current || value.length !== CODE_LENGTH) return;
      verifyingRef.current = true;
      setChecking(true);
      setError(null);
      let result: Awaited<ReturnType<typeof confirmPhoneVerification>> | null = null;
      try {
        result = await confirmPhoneVerification(phone, value);
      } catch {
        result = null;
      }
      setChecking(false);
      verifyingRef.current = false;
      if (!result?.success) {
        setError(result ? result.code : "network");
        setCode("");
        codeRef.current = "";
        // After the input is re-enabled, so the phone keyboard stays up.
        setTimeout(() => otpRef.current?.focus(), 0);
        return;
      }
      onVerified(phone);
  };

  const errorLine = error ? (
    <p id={errorId} role="alert" className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{ERROR_COPY[error]}</span>
    </p>
  ) : null;

  if (step === "code") {
    const shownNumber = formatPhoneNumberIntl(phone) || phone;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void verify(code);
        }}
        className="space-y-5"
      >
        <div aria-live="polite" className="text-sm text-[#5A5248] dark:text-[#B3A999]">
          {sendState === "sending" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
              Code on its way to <span className="font-medium text-[#1F1B16] dark:text-[#F3EEE6]">{shownNumber}</span>
            </span>
          ) : (
            <span>
              Enter the code we texted to{" "}
              <span className="whitespace-nowrap font-medium text-[#1F1B16] dark:text-[#F3EEE6]">{shownNumber}</span>
            </span>
          )}
        </div>

        <InputOTP
          ref={otpRef}
          maxLength={CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(v) => {
            setCode(v);
            codeRef.current = v;
            if (error === "wrong_code" || error === "expired") setError(null);
            // Auto-submit once all six digits are in (typed, pasted or autofilled).
            if (v.length === CODE_LENGTH && sendState === "sent") void verify(v);
          }}
          pasteTransformer={(text) => text.replace(/\D/g, "").slice(0, CODE_LENGTH)}
          disabled={checking || disabled}
          aria-label="Verification code"
          aria-describedby={error ? errorId : undefined}
          containerClassName="justify-center sm:justify-start"
        >
          <InputOTPGroup className="gap-1.5 sm:gap-2">
            {Array.from({ length: CODE_LENGTH }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  "h-12 w-10 rounded-lg border bg-white text-xl font-medium text-[#1F1B16] first:rounded-lg last:rounded-lg sm:h-14 sm:w-12",
                  "border-[#E7E2D8] dark:border-[#2E2923] dark:bg-[#141210] dark:text-[#F3EEE6]",
                  error && "border-red-300 dark:border-red-900"
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="min-h-5" aria-live="polite">
          {checking ? (
            <p className="inline-flex items-center gap-2 text-sm text-[#5A5248] dark:text-[#B3A999]">
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
              Checking
            </p>
          ) : (
            errorLine
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className={cn(quietLinkClass, "min-h-11 px-1")}
            onClick={() => {
              sendIdRef.current++;
              setStep("phone");
              setSendState("idle");
              setCode("");
              codeRef.current = "";
              setError(null);
            }}
            disabled={checking}
          >
            Change number
          </button>
          <button
            type="button"
            className={cn(quietLinkClass, "min-h-11 px-1 tabular-nums")}
            onClick={() => sendCode()}
            disabled={checking || disabled || sendState === "sending" || resendIn > 0}
          >
            {resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, "0")}` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label id={phoneLabelId} className="text-sm font-medium text-[#1F1B16] dark:text-[#F3EEE6]">
          Your phone number
        </label>
        <PhoneInput
          defaultCountry="IN"
          value={phone}
          onChange={(value) => {
            setPhone(value || "");
            if (error) setError(null);
          }}
          disabled={disabled}
          addInternationalOption={false}
          countrySelectComponent={CountrySelect}
          inputComponent={NumberInput}
          numberInputProps={{
            "aria-labelledby": phoneLabelId,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? errorId : undefined,
            autoFocus: !initialPhone,
          }}
          className={cn(
            "flex h-14 w-full items-center rounded-xl border bg-white transition-colors",
            "border-[#E7E2D8] focus-within:border-[#1F1B16] focus-within:ring-2 focus-within:ring-main-yellow/60",
            "dark:border-[#2E2923] dark:bg-[#141210] dark:focus-within:border-[#F3EEE6]",
            error && "border-red-300 dark:border-red-900"
          )}
        />
        {errorLine}
      </div>
      <Button type="submit" className={primaryButtonClass} disabled={disabled || !phone}>
        Text me a code
      </Button>
    </form>
  );
}

type CountrySelectProps = {
  value?: Country;
  onChange: (value?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  disabled?: boolean;
  readOnly?: boolean;
};

// Country picker inside the number field: a native select (the system
// picker on phones) laid over a compact "IN +91" label.
function CountrySelect({ value, onChange, options, disabled, readOnly }: CountrySelectProps) {
  return (
    <div className="relative flex h-full shrink-0 items-center gap-1 border-r border-[#E7E2D8] pl-4 pr-3 text-[15px] text-[#1F1B16] dark:border-[#2E2923] dark:text-[#F3EEE6]">
      <span className="tabular-nums">
        {value ? (
          <>
            <span className="text-[#5A5248] dark:text-[#B3A999]">{value}</span> +{getCountryCallingCode(value)}
          </>
        ) : (
          "+"
        )}
      </span>
      <ChevronDown className="h-4 w-4 text-[#5A5248] dark:text-[#B3A999]" aria-hidden />
      <select
        aria-label="Country"
        value={value || ""}
        onChange={(e) => onChange((e.target.value || undefined) as Country | undefined)}
        disabled={disabled || readOnly}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
      >
        {options
          .filter((o) => !o.divider && o.value)
          .map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} +{getCountryCallingCode(o.value as Country)}
            </option>
          ))}
      </select>
    </div>
  );
}

const NumberInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function NumberInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className={cn(
          "h-full min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-lg tracking-wide text-[#1F1B16] outline-none placeholder:text-[#B3A999] disabled:opacity-60 dark:text-[#F3EEE6] dark:placeholder:text-[#5A5248]",
          className
        )}
      />
    );
  }
);
