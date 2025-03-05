"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import Image from "next/image";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type TLoginValues = z.infer<typeof LoginSchema>;

const Login = () => {
  //   const usernameCookie = getCookie("username");
  const router = useRouter();
  const s = useSession();
  if (s.status === "authenticated" && !s?.data?.user?.isOnboarded) {
    router.push("/onboarding");
  }
  const form = useForm<TLoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSocialSignIn = async (provider: "google" | "github") => {
    const data = await signIn(provider);
    if (data?.error) {
      toast.error(data.error);
      return;
    }
    toast.success("Logged in successfully");
    // router.push(`/${s?.data?.user?.username}`);
  };
  return (
    <div className=" w-full space-y-4">
      <div>
        <span className="text-3xl md:text-4xl font-instrument font-semibold">
          Login to your Account
        </span>
      </div>

      <form
        onSubmit={form.handleSubmit(async (values) => {
          const res = await signIn("credentials", {
            email: values?.email,
            password: values?.password,
            redirect: false,
          });
          console.log(res);
          if (res?.error) {
            toast.error(res.error);
          }
          toast.success("Logged in successfully");
          router.push(`/${s?.data?.user?.username}`);
        })}
        className="space-y-2"
      >
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
        <Button className="w-full mt-2">SignIn with Email</Button>
      </form>
      <div className="flex items-center justify-center">
        <hr className="h-[0.5px] w-full bg-neutral-400" />
        <span className="text-xs opacity-80 mx-1">OR</span>
        <hr className="h-[0.5px] w-full bg-neutral-400" />
      </div>
      <div className="flex flex-col space-y-2">
        {/* <span className="my-2 text-sm opacity-80 tracking-tight leading-tight">
          By clicking "Create Profile“ you agree to our Code of Conduct, Terms
          of Service and Privacy Policy.
        </span> */}
        <Button
          onClick={() => handleSocialSignIn("google")}
          className="rounded-lg px-6 "
        >
          <Image
            width={25}
            className="aspect-square size-6 mr-1"
            height={25}
            src={"/google.svg"}
            alt="Google Logo"
          />{" "}
          SignIn with Google
        </Button>
        <Button
          onClick={() => handleSocialSignIn("github")}
          className="rounded-lg px-6 "
        >
          <Image
            width={25}
            className="aspect-square size-6 mr-1"
            height={25}
            src={"/github.svg"}
            alt="Github Logo"
          />{" "}
          SignIn with Github
        </Button>
      </div>
    </div>
  );
};

export default Login;
