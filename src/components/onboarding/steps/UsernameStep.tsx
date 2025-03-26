"use client";
import { Button } from "@/components/ui/button";
import { isUsernameAvailable } from "@/lib/server-actions";
import { usernameSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { Check, Loader, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export function UsernameStep({
  onNext,
  formData,
}: {
  formData: any;
  onNext: (username: string) => void;
}) {
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
      toast.error(result.error?.flatten()?.fieldErrors?.username?.[0]);
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
    <div className="p-8">
      <h2 className="text-2xl tracking-tight mb-2 font-semibold ">
        Claim your username
      </h2>
      <p className="leading-snug text-sm opacity-80 mb-4">
        Embark your creative journey with a username that resonates with you.
      </p>
      <div className="space-y-4">
        <div className="border border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden px-3 py-1.5 rounded-md">
          <input
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              handleCheck(e.target.value);
            }}
            className="text-lg w-full focus-visible:outline-none"
          />
          {isSearching && <Loader className="animate-spin size-4" />}

          {isAvailable !== null && !isSearching && (
            <div
              className={cn(
                isAvailable ? "bg-green-500" : "bg-red-500",
                "size-6 rounded-full flex items-center justify-center"
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
          onClick={() => onNext(username)}
          disabled={!username || !isAvailable}
          className="w-full bg-green-600 disabled:bg-green-700 dark:bg-green-500 dark:text-white hover:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-600"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
