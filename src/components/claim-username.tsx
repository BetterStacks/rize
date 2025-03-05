"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { isUsernameAvailable as checkUsername } from "@/lib/server-actions";
import { UsernameFormData, usernameSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";

type ClaimUsernameFormProps = {
  onSubmit: (data: UsernameFormData) => void;
};

const ClaimUsernameForm: FC<ClaimUsernameFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  });
  // const router = useRouter();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      <div className="w-full   border mt-2 border-neutral-400/60 dark:border-dark-border rounded-3xl text-lg md:text-xl   p-1 flex items-center justify-center">
        <div className="px-4 py-1 rounded-3xl bg-neutral-200  dark:bg-dark-border">
          <span>rise.so</span>
        </div>
        <div className="w-full ml-2 ">
          <input
            className="border-none lowercase focus-visible:ring-0 focus-visible:outline-none"
            placeholder="username"
            required={true}
            {...register("username")}
          />
          <Button
            type="submit"
            size={"icon"}
            disabled={!isAvailable || !!errors.username}
            variant={"secondary"}
            className="rounded-full mr-2 size-7 bg-green-600 dark:bg-green-600"
          >
            <ArrowRight className="stroke-white" />
          </Button>
        </div>
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
