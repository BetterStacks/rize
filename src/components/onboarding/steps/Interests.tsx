"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InterestsStep({
  onNext,
  formData,
}: {
  formData: any;
  onNext: (interests: string[]) => void;
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    formData?.interests || []
  );

  const interests = [
    { emoji: "🎵", tag: "Music" },
    { emoji: "🎨", tag: "Art" },
    { emoji: "🎮", tag: "Gaming" },
    { emoji: "📱", tag: "Tech" },
    { emoji: "🌱", tag: "Nature" },
    { emoji: "✈️", tag: "Travel" },
    { emoji: "📚", tag: "Books" },
    { emoji: "🎬", tag: "Movies" },
    { emoji: "🏃", tag: "Fitness" },
    { emoji: "🍜", tag: "Food" },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl tracking-tight mb-6 font-semibold ">
        Pick your interests 🎯
      </h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {interests.map((interest) => (
          <Button
            key={interest.tag}
            variant={
              selectedInterests.includes(interest.tag) ? "default" : "outline"
            }
            onClick={() => {
              setSelectedInterests((prev) =>
                prev.includes(interest.tag)
                  ? prev.filter((i) => i !== interest.tag)
                  : [...prev, interest.tag]
              );
            }}
            className="rounded-full"
          >
            {interest.emoji} {interest.tag}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onNext(selectedInterests)}
        disabled={selectedInterests.length < 3}
        className="w-full bg-green-600 disabled:bg-green-700 dark:bg-green-600 dark:text-white hover:bg-green-700 dark:hover:bg-green-700 dark:disabled:bg-green-700"
      >
        Next ({selectedInterests.length}/3)
      </Button>
    </div>
  );
}
