"use client";
import { Button } from "@/components/ui/button";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="p-8 flex flex-col gap-y-4 text-center">
      <h1 className="text-4xl font-instrument font-semibold mb-4">
        Welcome to
        <span className="italic ml-2">Rize ✨</span>
      </h1>
      <Button className="w-full self-end" onClick={onNext}>
        Get Started
      </Button>
    </div>
  );
}
