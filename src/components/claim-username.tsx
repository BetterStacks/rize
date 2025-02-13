"use client";

import { useQueryState } from "nuqs";
import {
  isUsernameAvailable as checkUsername,
  setServerCookie,
} from "@/lib/server-actions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { useRouter } from "next/navigation";
import { UsernameFormData, usernameSchema } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";

const ClaimUsernameForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  });
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const username = watch("username");
  const debouncedUsername = useDebounce(username, 300);

  useEffect(() => {
    async function checkAvailability() {
      if (
        debouncedUsername &&
        debouncedUsername.length >= 3 &&
        debouncedUsername.length <= 15
      ) {
        setIsChecking(true);
        const available = await checkUsername(debouncedUsername);
        setIsAvailable(available?.available);
        setIsChecking(false);
      } else {
        setIsAvailable(null);
      }
    }

    checkAvailability();
  }, [debouncedUsername]);

  const onSubmit = async (data: UsernameFormData) => {
    console.log(data);
    // Handle form submission
    setServerCookie("username", data.username);

    router.push(`/login`);
  };
  //  const { register, handleSubmit, watch } = useForm<UsernameFormData>();
  //  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  //  const [isChecking, setIsChecking] = useState(false);

  //  const username = watch("username");
  //  const debouncedUsername = useDebounce(username, 300);

  //  useEffect(() => {
  //    async function checkAvailability() {
  //      if (debouncedUsername) {
  //        setIsChecking(true);
  //        const available = await checkUsername(debouncedUsername);
  //        setIsAvailable(available);
  //        setIsChecking(false);
  //      } else {
  //        setIsAvailable(null);
  //      }
  //    }

  //    checkAvailability();
  //  }, [debouncedUsername]);
  // const router = useRouter();
  // const form = useForm<z.infer<typeof ClaimUsernameFormSchema>>({
  //   resolver: zodResolver(ClaimUsernameFormSchema),
  //   mode: "all",
  //   defaultValues: {
  //     username: username || "",
  //   },
  // });
  // const { errors } = form.formState;
  // const watchUsername = form.watch("username");

  // useEffect(() => {
  //   (async () => {
  //     if (watchUsername.length < 3 || errors.username) {
  //       setSearchResult(null);
  //       return;
  //     }
  //     const { available } = await isUsernameClaimed(watchUsername);
  //     setIsUsernameAvailable(available);
  //     setSearchResult(
  //       available ? "Username is available" : "Username is taken"
  //     );
  //   })();
  // }, [watchUsername]);

  // function onSubmit(values: z.infer<typeof ClaimUsernameFormSchema>) {
  //   console.log(values);
  //   setServerCookie("username", values.username);
  //   router.push(`/login`);
  // }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      <div className="w-full  border mt-2 border-neutral-400/60 rounded-2xl text-lg md:text-xl   p-2 flex items-center justify-center">
        <div className="w-full pl-4 ">
          <span>rize.io/</span>
          <input
            className="border-none lowercase focus-visible:ring-0 focus-visible:outline-none"
            placeholder="username"
            required={true}
            {...register("username")}
          />
        </div>
        <Button
          type="submit"
          size={"icon"}
          disabled={!isAvailable || !!errors.username}
          variant={"secondary"}
          className="rounded-lg bg-green-600"
        >
          <SendHorizonal className="stroke-white" />
        </Button>
      </div>
      {errors.username && (
        <p className="text-sm text-red-500">{errors.username.message}</p>
      )}
      {isChecking && (
        <p className="text-sm text-gray-500">Checking availability...</p>
      )}
      {!isChecking && isAvailable !== null && (
        <p
          className={`text-sm ${
            isAvailable ? "text-green-500" : "text-red-500"
          }`}
        >
          {isAvailable ? "Username is available" : "Username is not available"}
        </p>
      )}
    </form>
  );
};
export default ClaimUsernameForm;
