import { Button } from "@/components/ui/button";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-5xl font-instrument font-semibold mb-4">
        Welcome to
        <span className="italic ml-2">Rise ✨</span>
      </h1>
      {/* <p className="text-gray-600 dark:text-gray-300 mb-8">
        Let's create your unique space in just a few steps
      </p> */}
    </div>
  );
}
