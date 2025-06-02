"use client";

import { isUsernameAvailable } from "@/actions/profile-actions";
import { usernameSchema } from "@/lib/types";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { Loader } from "lucide-react";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type ClaimUsernameFormProps = {
  onSubmit: (data: string) => void;
  className?: string;
  badgeClassName?: string;
  buttonClassName?: string;
};

const ClaimUsernameForm: FC<ClaimUsernameFormProps> = ({
  onSubmit,
  className,
  badgeClassName,
  buttonClassName,
}) => {
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const handleCheck = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) {
      setIsAvailable(null);
      setIsSearching(false);
      setError(null);
      return;
    }
    const result = usernameSchema.safeParse({ username });
    if (!result.success) {
      toast.dismiss();
      toast.error(
        result.error?.flatten()?.fieldErrors?.username?.[0] as string
      );
      setError(result.error?.flatten()?.fieldErrors?.username?.[0] as string);
      setIsSearching(false);
      setIsAvailable(false);
      return;
    }
    setIsSearching(true);
    const check = await isUsernameAvailable(username);
    if (!check.available) {
      toast.dismiss();
      toast.error("Username already taken");
      setIsSearching(false);
      setIsAvailable(false);
    } else {
      toast.dismiss();
      toast.success("Username is available");
      setIsSearching(false);
      setIsAvailable(true);
    }
    setIsSearching(false);
  }, 500);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}
      className={cn("w-full ")}
    >
      <div
        className={cn(
          "w-full border mt-2 border-neutral-400/60 overflow-hidden dark:border-none rounded-3xl text-lg md:text-xl  p-1 flex items-center justify-center bg-neutral-50 dark:bg-dark-border",
          className
        )}
      >
        <div
          className={cn(
            "px-4 ml-0.5 border border-neutral-300/80 dark:border-none py-1 bg-white dark:bg-neutral-700 rounded-3xl shadow-lg ",
            badgeClassName
          )}
        >
          <span className="tracking-tight opacity-80 dark:opacity-60">
            rize.so
          </span>
        </div>
        <div className="w-full flex items-center justify-center mx-1">
          <span className="dark:text-neutral-500 opacity-50 pr-0.5">/</span>
          <input
            type="text"
            placeholder="your-username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value?.trim());
              handleCheck(e.target.value?.trim());
            }}
            className="text-lg w-full dark:text-opacity-80 bg-transparent dark:placeholder:text-neutral-500 focus-visible:outline-none"
          />
        </div>
        {isSearching ? (
          <Loader className="animate-spin size-6 mr-4" />
        ) : (
          <Button
            type="submit"
            disabled={!isAvailable || isSearching!}
            size={isDesktop ? "default" : "sm"}
            className={cn(
              "rounded-3xl  bg-black text-white dark:bg-white dark:text-neutral-800 hover:dark:bg-neutral-100 dark:hover:bg-neutral-300",
              buttonClassName
            )}
          >
            Claim
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 leading-tight px-3 mt-2">{error}</p>
      )}
    </form>
  );
};
export default ClaimUsernameForm;
