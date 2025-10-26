"use client";
import { register } from "@/actions/user-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import {
  signInWithGoogle,
  signInWithLinkedIn,
  signInWithCredentials,
} from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { getCookie } from "cookies-next";
import Logo from "../logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const RegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type TLoginValues = z.infer<typeof RegisterSchema>;
const SignUp = () => {
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "github" | "linkedin" | null
  >(null);

  // Log claimed username for debugging
  useEffect(() => {
    const claimedUsername = getCookie("username");
    if (claimedUsername) {
      console.log("Claimed username found in signup:", claimedUsername);
    }
  }, []);
  const form = useForm<TLoginValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const { mutate: signup, isPending } = useMutation({
    mutationFn: register,
    onSuccess: async (data, payload) => {
      if (payload?.email && payload?.password) {
        await signInWithCredentials(payload.email, payload.password);
      }
      // Redirect to onboarding after successful signup
      window.location.href = "/onboarding";

      toast.dismiss();
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error?.message as string);
    },
  });
  const handleSocialSignIn = async (
    provider: "google" | "github" | "linkedin"
  ) => {
    try {
      setIsSocialLoading(provider);
      // Social sign-in will redirect to provider, then back to app
      // better-auth handles the redirect flow automatically
      switch (provider) {
        case "google":
          await signInWithGoogle();
          break;
        case "linkedin":
          await signInWithLinkedIn();
          break;
        default:
          throw new Error("Unsupported provider");
      }
      // No manual redirect needed - better-auth handles the OAuth flow
    } catch (error: any) {
      console.error("Social sign-in error:", error);
      toast.error(error.message || "Sign up failed");
      setIsSocialLoading(null);
    }
    // Note: setIsSocialLoading(null) not called on success because the page will redirect
  };

  return (
    <div className=" w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
      <div className="flex flex-col items-center justify-center">
        <Logo className="mx-auto mb-4 size-12" />
        <h2 className="text-2xl font-medium tracking-tight leading-tight md:font-semibold">
          Create Account
        </h2>
        <span className="mt-2 text-sm opacity-80">
          Please enter your details to register
        </span>
      </div>
      <div className="flex flex-col space-y-2">
        <Button
          variant={"outline"}
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn("google")}
          className="rounded-lg px-6"
        >
          {isSocialLoading === "google" ? (
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
          variant={"outline"}
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn("linkedin")}
          className="rounded-lg px-6"
        >
          {isSocialLoading === "linkedin" ? (
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

      <div className="flex items-center justify-center max-w-xs w-full gap-x-2 mt-4 mb-2">
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
        <span className="text-xs opacity-60">OR</span>
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
      </div>
      <form
        onSubmit={form.handleSubmit(async (values) => signup(values))}
        className="gap-y-2 flex flex-col "
      >
        <div>
          <Label className="text-sm font-medium ">Name</Label>

          <Input
            className="border-neutral-300/80"
            type="text"
            placeholder="name"
            {...form.register("name")}
          />
        </div>
        <div>
          <Label className="text-sm font-medium ">Email Address</Label>
          <Input
            className="border-neutral-300/80"
            type="email"
            placeholder="example@gmail.com"
            {...form.register("email")}
          />
        </div>
        <div>
          <Label className="text-sm font-medium ">Password</Label>
          <Input
            className="border-neutral-300/80"
            type="password"
            placeholder="password"
            {...form.register("password")}
          />
        </div>
        {form.formState.errors && (
          <div className="text-red-500 text-sm mt-2">
            {Object.values(form.formState.errors).map((error) => (
              <span key={error?.message} className="block">
                {error?.message}
              </span>
            ))}
          </div>
        )}
        <Button
          variant={"secondary"}
          disabled={
            Object?.entries(form.formState.errors)?.length > 0 || isPending
          }
          className="w-full mt-2"
        >
          {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>
      </form>
      <div className="w-full mt-6 mb-10 flex items-center justify-center">
        <span className="text-sm w-full text-center font-medium opacity-80">
          {" "}
          Already have a account?{" "}
          <Link href={"/login"} className="text-amber-500">
            Login
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignUp;
