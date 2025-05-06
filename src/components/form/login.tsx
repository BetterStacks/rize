"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Logo from "../logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type TLoginValues = z.infer<typeof LoginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  const form = useForm<TLoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      setIsSocialLoading(provider);
      const data = await signIn(provider);
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Logged in successfully");
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <div className=" w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
      <div className="flex flex-col items-center justify-center">
        <Logo className="mx-auto mb-4 size-12" />
        <h2 className="text-2xl font-medium tracking-tight leading-tight md:font-semibold">
          Welcome back
        </h2>
        <span className="opacity-80 mt-2 text-sm">
          Please enter your details to login
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
        {/* <Button
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn("github")}
          className="rounded-lg px-6"
        >
          {isSocialLoading === "github" ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image
              width={25}
              height={25}
              src="/github.svg"
              alt="Github Logo"
              className="size-6 mr-1"
            />
          )}
          Sign in with Github
        </Button> */}
      </div>
      <div className="flex items-center justify-center max-w-xs w-full gap-x-2 mt-4 mb-2">
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
        <span className="text-xs opacity-60">OR</span>
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
      </div>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setIsLoading(true);
            const res = await signIn("credentials", {
              email: values?.email,
              password: values?.password,
              redirect: false,
            });
            console.log({ res });
            if (res?.error) {
              toast.error(res.error);
              return;
            }
            toast.success("Logged in successfully");
          } finally {
            setIsLoading(false);
          }
        })}
        className="flex gap-y-2 flex-col "
      >
        <div>
          <Label className="text-sm font-medium ">Email</Label>
          <Input
            className="border-neutral-300/80"
            type="email"
            {...form.register("email")}
            placeholder="example@gmail.com"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mt-2">Password</Label>
          <Input
            className="border-neutral-300/80"
            type="password"
            placeholder="password"
            {...form.register("password")}
          />
        </div>
        <Button
          variant={"secondary"}
          disabled={!!form.formState.errors || isLoading}
          className="w-full mt-4"
        >
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in with Email
        </Button>
      </form>
      <div className="w-full mt-6 mb-10 flex items-center justify-center">
        <span className="text-sm w-full text-center font-medium opacity-80">
          {" "}
          Dont have a account yet?{" "}
          <Link href={"/signup"} className="text-indigo-500">
            Register
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Login;
