"use client";

import { isUsernameAvailable } from "@/lib/server-actions";
import { usernameSchema } from "@/lib/types";
import { useDebouncedCallback } from "@mantine/hooks";
import { Loader } from "lucide-react";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

type ClaimUsernameFormProps = {
  onSubmit: (data: string) => void;
};

const ClaimUsernameForm: FC<ClaimUsernameFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      toast.error(result.error?.flatten()?.fieldErrors?.username?.[0]);
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
      className="w-full "
    >
      <div className="w-full border mt-2 border-neutral-300 dark:border-none rounded-3xl text-lg md:text-xl   p-1 flex items-center justify-center bg-neutral-50 dark:bg-dark-border/60">
        <div className="px-4 border border-neutral-300/60 dark:border-none py-1 bg-white dark:bg-neutral-700 rounded-3xl shadow-md ">
          <span className="tracking-tight opacity-70 dark:opacity-60">
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
              setUsername(e.target.value);
              handleCheck(e.target.value);
            }}
            className="text-lg w-full dark:text-opacity-80 bg-transparent dark:placeholder:text-neutral-500 focus-visible:outline-none"
          />
        </div>
        {isSearching ? (
          <Loader className="animate-spin size-6 mr-2" />
        ) : (
          <Button
            type="submit"
            disabled={!isAvailable || isSearching!}
            className="rounded-3xl   bg-green-600 dark:bg-green-600 hover:dark:bg-green-700"
          >
            Claim
            {/* <ArrowRight className="stroke-white" /> */}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 leading-tight px-3 mt-2">{error}</p>
      )}
      {/* {errors.username && (
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
      )} */}
    </form>
  );
};
export default ClaimUsernameForm;
