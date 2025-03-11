import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FinishStep } from "./steps/FinishStep";
import { InterestsStep } from "./steps/Interests";
import { UsernameStep } from "./steps/UsernameStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import { useLocalStorage } from "@mantine/hooks";

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingProps) {
  const [formData, setFormData] = useLocalStorage({
    key: "onboarding-data",
    defaultValue: {
      username: "",
      interests: [],
    },
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "welcome",
      component: <WelcomeStep onNext={() => setCurrentStep(1)} />,
    },
    {
      id: "username",
      component: (
        <UsernameStep
          formData={formData}
          onNext={(username) => {
            setFormData((prev) => ({ ...prev, username }));
            setCurrentStep(2);
          }}
        />
      ),
    },

    {
      id: "interests",
      component: (
        <InterestsStep
          formData={formData}
          onNext={(interests: string[]) => {
            setFormData((prev) => ({ ...(prev as any), interests }));
            setCurrentStep(3);
          }}
        />
      ),
    },
    {
      id: "finish",
      component: (
        <FinishStep
          formData={formData}
          onComplete={() => onComplete(formData)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <div className="w-full max-w-md  border border-neutral-200 dark:border-dark-border/60 rounded-3xl shadow-xl dark:shadow-black/10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            style={{ height: "auto", minHeight: "250px" }}
            key={currentStep}
            className="bg-white dark:bg-[#111111]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-2 mt-10">
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
    </div>
  );
}
