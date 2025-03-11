import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useQueryState } from "nuqs";

interface Step {
  title: string;
  description: string;
  component: React.ReactNode;
}

interface OnboardingStepsProps {
  steps: Step[];
  onComplete?: () => void;
}

export default function OnboardingSteps({
  steps,
  onComplete,
}: OnboardingStepsProps) {
  const [currentStep, setCurrentStep] = useQueryState("step", {
    defaultValue: 0,
    parse(value) {
      return parseInt(value);
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-sm  w-full">
      {/* Dots navigation */}

      {/* Content */}
      <div className="mb-8 w-full h-[250px] border border-neutral-200 dark:border-dark-border/40 rounded-3xl shadow-xl dark:shadow-md p-4">
        {/* <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {steps[currentStep].description}
        </p> */}
        <div className="">{steps[currentStep].component}</div>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, index) => (
          <div
            onClick={() => setCurrentStep(index)}
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentStep === index
                ? "w-8 bg-neutral-500 dark:bg-dark-border"
                : currentStep > index
                ? "bg-neutral-500 dark:bg-neutral-800"
                : "bg-neutral-500 dark:bg-neutral-800"
            )}
          />
        ))}
      </div>
      {/* Navigation buttons */}
      {/* <div className="flex justify-between">
        <Button
          onClick={handleBack}
          className={cn("px-4 py-2 rounded", currentStep === 0 && "invisible")}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          //   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div> */}
    </div>
  );
}
