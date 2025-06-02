"use client";
import { isUsernameAvailable } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { usernameSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { getCookie } from "cookies-next";
import { Check, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function UsernameStep({
  onNext,
  isPending,
  formData,
}: {
  formData: any;
  isPending: boolean;
  onNext: (username: string) => void;
}) {
  const usernameCookie = getCookie("username");

  const [username, setUsername] = useState(formData?.username || "");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState<boolean | null>(null);

  const handleCheck = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) {
      setIsAvailable(null);
      setIsSearching(false);
      return;
    }
    const result = usernameSchema.safeParse({ username });
    if (!result.success) {
      toast.dismiss();
      toast.error(
        result.error?.flatten()?.fieldErrors?.username?.[0] as string
      );
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

  useEffect(() => {
    if (usernameCookie) {
      setUsername(usernameCookie as string);
      handleCheck(usernameCookie as string);
    }
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl tracking-tight mb-2 font-semibold ">
        Claim your username
      </h2>
      <p className="leading-snug text-sm opacity-80 mb-4">
        Embark your creative journey with a username that resonates with you.
      </p>
      <div className="space-y-4">
        <div className="border border-neutral-300 dark:border-dark-border flex overflow-hidden px-3 py-1.5 rounded-lg">
          {/* <span className="opacity-70 text-lg">rize.so/</span> */}
          <input
            type="text"
            placeholder="your-username"
            value={username}
            className="text-lg w-full dark:text-opacity-80 bg-transparent dark:placeholder:text-neutral-500 focus-visible:outline-none"
            onChange={(e) => {
              setUsername(e.target.value);
              handleCheck(e.target.value);
            }}
          />
          {isSearching && (
            <div className="flex items-center justify-center ">
              <Loader className="animate-spin size-4 opacity-80" />
            </div>
          )}

          {isAvailable !== null && !isSearching && (
            <div
              className={cn(
                isAvailable ? "bg-green-500" : "bg-red-500",
                "size-6 rounded-full flex items-center aspect-square justify-center"
              )}
            >
              {isAvailable ? (
                <Check className="text-white size-4" />
              ) : (
                <X className="text-white size-4" />
              )}
            </div>
          )}
        </div>

        <Button
          variant={"secondary"}
          onClick={() => onNext(username)}
          disabled={!username || !isAvailable || isPending}
          className="w-full"
        >
          {isPending && <Loader className="animate-spin size-4 mr-2" />}{" "}
          Continue
        </Button>
      </div>
    </div>
  );
}
