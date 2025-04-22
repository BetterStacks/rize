"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Logo from "../logo";

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
    <div className=" w-full bg-gradient-to-b from-transparent to-indigo-400/60 shadow-2xl space-y-4 rounded-3xl p-6">
      <div className="flex flex-col items-center justify-center">
        <Logo className="mx-auto mb-4 size-12" />
        <h2 className="text-3xl font-medium tracking-tight leading-tight md:font-semibold">
          Welcome back
        </h2>
        <span className="opacity-80">Please enter your details to login</span>
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

      <div className="flex items-center justify-center">
        <hr className="h-[0.5px] w-full bg-neutral-400" />
        <span className="text-xs opacity-80 mx-1">OR</span>
        <hr className="h-[0.5px] w-full bg-neutral-400" />
      </div>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setIsLoading(true);
            const res = await signIn("credentials", {
              email: values?.email,
              password: values?.password,
              redirect: false,
              // redirectTo: "/",
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
        className="space-y-2 pb-8"
      >
        <Label>
          E-Mail Address
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
        <Button
          variant={"secondary"}
          disabled={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in with Email
        </Button>
      </form>
    </div>
  );
};

export default Login;
