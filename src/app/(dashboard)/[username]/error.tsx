"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-2xl font-semibold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="default">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
