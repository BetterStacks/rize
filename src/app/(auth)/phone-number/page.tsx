"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authClient, signInWithGoogle, signInWithLinkedIn } from "@/lib/auth-client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";

type Step = "phone" | "otp";

type Country = {
    name: string;
    code: string;
    flag: string;
};

const COUNTRIES: Country[] = [
    { name: "India", code: "91", flag: "🇮🇳" },
    { name: "United States", code: "1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "44", flag: "🇬🇧" },
    { name: "Canada", code: "1", flag: "🇨🇦" },
    { name: "Australia", code: "61", flag: "🇦🇺" },
];

// Zod validation schemas
const phoneSchema = z.object({
    phoneNumber: z
        .string()
        .min(6, "Phone number must be at least 6 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),
});

const otpSchema = z.object({
    otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function PhoneAuth() {
    const [step, setStep] = useState<Step>("phone");
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);
    const [number, setNumber] = useState("");
    const [otp, setOtp] = useState("");
    const router = useRouter();

    const [isSocialLoading, setIsSocialLoading] = useState<
        'google' | 'github' | 'linkedin' | null
    >(null)

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    // Form validation with react-hook-form
    const phoneForm = useForm<PhoneFormValues>({
        resolver: zodResolver(phoneSchema),
        mode: "onChange",
        defaultValues: {
            phoneNumber: "",
        },
    });

    const otpForm = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        mode: "onChange",
        defaultValues: {
            otp: "",
        },
    });

    // Load persisted state on mount
    useEffect(() => {
        const persistedStep = localStorage.getItem("phoneAuthStep") as Step | null;
        const persistedPhone = localStorage.getItem("phoneAuthNumber");
        const persistedCountryCode = localStorage.getItem("phoneAuthCountryCode");
        const persistedOtpTimestamp = localStorage.getItem("phoneAuthOtpTimestamp");

        if (persistedStep) setStep(persistedStep);
        if (persistedPhone) setNumber(persistedPhone);
        if (persistedCountryCode) {
            const foundCountry = COUNTRIES.find((c) => c.code === persistedCountryCode);
            if (foundCountry) setCountry(foundCountry);
        }
        if (persistedOtpTimestamp) {
            const otpSentTime = parseInt(persistedOtpTimestamp, 10);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - otpSentTime) / 1000);
            const remainingTime = Math.max(0, 60 - elapsedSeconds);
            setCooldown(remainingTime);
        }
    }, []);

    const phone = `+${country.code}${number}`;

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    async function sendOtp(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setError(null);

        const validation = phoneSchema.safeParse({ phoneNumber: number });
        if (!validation.success) {
            const errorMessage = validation.error.errors[0]?.message || "Invalid phone number";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await authClient.phoneNumber.sendOtp({
                phoneNumber: phone
            })
            if (error) {
                const errorMessage = error.message || "Failed to send OTP";
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
                return;
            }

            // Proceed to OTP step
            setStep("otp");
            setCooldown(60);
            const otpTimestamp = Date.now().toString();
            localStorage.setItem("phoneAuthStep", "otp");
            localStorage.setItem("phoneAuthNumber", number);
            localStorage.setItem("phoneAuthCountryCode", country.code);
            localStorage.setItem("phoneAuthOtpTimestamp", otpTimestamp);
            toast.success("OTP sent successfully!");
        } catch (e: any) {
            const errorMessage = e.message || "Failed to send OTP. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    async function verifyOtp(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setError(null);

        // Validate OTP
        const validation = otpSchema.safeParse({ otp });
        if (!validation.success) {
            const errorMessage = validation.error.errors[0]?.message || "Invalid OTP";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setLoading(true);

        try {
            const response = await authClient.phoneNumber.verify({
                phoneNumber: phone,
                code: otp
            })


            // Check for error in response
            if (response?.error) {
                const errorMessage = response.error.message || "Invalid OTP. Please try again.";
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
                return;
            }

            // Clear persisted state on successful verification
            localStorage.removeItem("phoneAuthStep");
            localStorage.removeItem("phoneAuthNumber");
            localStorage.removeItem("phoneAuthCountryCode");
            localStorage.removeItem("phoneAuthOtpTimestamp");
            toast.success("Phone number verified successfully!");
            router.push("/onboarding")
        } catch (e: any) {
            const errorMessage = e.message || "Verification failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const handleSocialSignIn = async (provider: 'google' | 'github' | 'linkedin') => {
        try {
            setIsSocialLoading(provider)
            // Social sign-in will redirect to provider, then back to app
            // better-auth handles the redirect flow automatically  
            switch (provider) {
                case 'google':
                    await signInWithGoogle()
                    break
                case 'linkedin':
                    await signInWithLinkedIn()
                    break
                default:
                    throw new Error('Unsupported provider')
            }
            // No manual redirect needed - better-auth handles the OAuth flow
        } catch (error: any) {
            console.error('Social sign-in error:', error)
            toast.error(error.message || 'Sign in failed')
            setIsSocialLoading(null)
        }
    }


    return (
        <div className="flex h-screen items-center justify-center">

            <div className="m-auto flex flex-col w-full max-w-sm">
                <div>
                    <h1 className="font-medium tracking-tight text-2xl">
                        {step === "phone" ? "Sign In with Mobile Number" : "Enter Verification Code"}
                    </h1>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm mb-4 ">
                        {step === "phone" ? "Sign in with your mobile number if you don't have an account, you will be redirected to onboarding" : `Enter the 6-digit verification code we sent to your registered phone number ending with ${number.slice(-3)}`}
                    </p>
                </div>

                <div className="space-y-6">
                    {step === "phone" && (
                        <>
                            <form onSubmit={sendOtp} className="space-y-6" >


                                <div className="flex border rounded-xl overflow-hidden border-neutral-300 dark:border-neutral-700 flex-col">
                                    <Select
                                        value={country.name}
                                        onValueChange={(value) =>
                                            setCountry(
                                                COUNTRIES.find((c) => c.name === value)!
                                            )
                                        }
                                    >
                                        <SelectTrigger className=" focus:ring-0 border-0 w-full h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 rounded-xl" >
                                            {COUNTRIES.map((c) => (
                                                <SelectItem className='font-inter' key={c.name} value={c.name} >
                                                    {c?.name} (+{c.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        className="border-t border-x-0 border-b-0  rounded-t-none rounded-b-xl focus-visible:ring-0 h-10"
                                        type="tel"
                                        placeholder="Phone number"
                                        value={number}
                                        onChange={(e) =>
                                            setNumber(e.target.value.replace(/\D/g, ""))
                                        }
                                    />
                                </div>
                                <Button
                                    className="w-full rounded-xl"
                                    variant="secondary"
                                    type="submit"
                                    disabled={loading || number.length < 6}
                                >
                                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                                </Button>
                            </form>
                        </>
                    )}

                    {step === "otp" && (
                        <form onSubmit={verifyOtp} className="gap-y-6">
                            {/* <div className=""> */}
                            <InputOTP className="w-full mx-auto " value={otp} onChange={(value: string) => setOtp(value)} maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
                                <InputOTPGroup>
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={0} />
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={1} />
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={2} />
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={3} />
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={4} />
                                    <InputOTPSlot className='border-neutral-300 w-16 h-12' index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            {/* </div> */}
                            <div className="mt-4 flex flex-col gap-y-2">


                                <Button
                                    className="w-full rounded-xl"
                                    variant="secondary"
                                    type="submit"

                                    disabled={loading || otp.length !== 6}
                                >
                                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                                </Button>

                                <Button
                                    variant="outline"
                                    disabled={cooldown > 0}
                                    type="button"
                                    onClick={sendOtp}
                                    className="w-full rounded-xl"
                                >
                                    {cooldown > 0
                                        ? `Resend OTP in ${cooldown}s`
                                        : "Resend OTP"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>
                <div className="flex items-center justify-center w-full gap-x-2 mt-4 mb-4 mx-auto">
                    <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
                    <span className="text-xs opacity-60">OR</span>
                    <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
                </div>
                <div className="flex flex-col w-full space-y-2">
                    <Button
                        variant={'outline'}
                        disabled={!!isSocialLoading}
                        onClick={() => handleSocialSignIn('google')}
                        className="rounded-xl px-6 border-neutral-300"
                    >
                        {isSocialLoading === 'google' ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Image
                                width={25}
                                height={25}
                                src="/google.svg"
                                alt="Google Logo"
                                className="size-6 mr-2"
                            />
                        )}
                        Sign in with Google
                    </Button>
                    <Button
                        variant={'outline'}
                        disabled={!!isSocialLoading}
                        onClick={() => handleSocialSignIn('linkedin')}
                        className="rounded-xl px-6 border-neutral-300"
                    >
                        {isSocialLoading === 'linkedin' ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Image
                                width={25}
                                height={25}
                                src="/linkedin.svg"
                                alt="LinkedIn Logo"
                                className="size-6 mr-2"
                            />
                        )}
                        Sign in with LinkedIn
                    </Button>
                </div>
            </div>
        </div>
    );
}
