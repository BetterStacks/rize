"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import Image from "next/image";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signIn } from "next-auth/react";
import { register } from "@/lib/server-actions";
import toast from "react-hot-toast";
import { Loader, Loader2 } from "lucide-react";

const RegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type TLoginValues = z.infer<typeof RegisterSchema>;
const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "github" | null
  >(null);
  const form = useForm<TLoginValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setIsSocialLoading(provider);
      await signIn(provider);
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <div className=" w-full space-y-4">
      <div>
        <span className="text-3xl md:text-4xl font-instrument font-semibold">
          Signup and create your Account
        </span>
      </div>

      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setIsLoading(true);
            console.log(values);
            const { data, error } = await register(values);
            if (error) {
              toast.error(error);
              return;
            }
            const res = await signIn("credentials", {
              email: data?.email,
              password: data?.password,
              redirect: false,
            });

            if (!res?.ok) {
              toast.error(res?.error);
              return;
            }
            toast.success("Account created successfully");
          } finally {
            setIsLoading(false);
          }
        })}
        className="space-y-2"
      >
        <Label>
          Name
          <Input
            className="border-neutral-400/80"
            type="text"
            {...form.register("name")}
          />
        </Label>
        <Label>
          Email
          <Input
            className="border-neutral-400/80"
            type="email"
            {...form.register("email")}
          />
        </Label>
        <Label className="mt-2">
          Password
          <Input
            className="border-neutral-400/80"
            type="password"
            {...form.register("password")}
          />
        </Label>
        <Button disabled={isLoading} type="submit" className="w-full mt-2">
          {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
          Create Account
        </Button>
      </form>
      <div className="flex items-center justify-center">
        <hr className="h-[0.5px] w-full bg-neutral-400" />
        <span className="text-xs opacity-80 mx-1">OR</span>
        <hr className="h-[0.5px] w-full bg-neutral-400" />
      </div>
      <div className="flex flex-col space-y-2">
        {/* <span className="my-2 text-sm opacity-80 tracking-tight leading-tight">
          By clicking "Create Profile" you agree to our Code of Conduct, Terms
          of Service and Privacy Policy.
        </span> */}
        <Button
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn("google")}
          className="rounded-lg px-6"
        >
          {isSocialLoading === "google" ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Image
              width={25}
              className="aspect-square size-6 mr-1"
              height={25}
              src={"/google.svg"}
              alt="Google Logo"
            />
          )}
          SignIn with Google
        </Button>
        <Button
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn("github")}
          className="rounded-lg px-6"
        >
          {isSocialLoading === "github" ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Image
              width={25}
              className="aspect-square size-6 mr-1"
              height={25}
              src={"/github.svg"}
              alt="Github Logo"
            />
          )}
          SignIn with Github
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
