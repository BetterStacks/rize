"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { createProfile, updateProfile } from "@/actions/profile-actions";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FinishStep } from "./steps/FinishStep";
import { InterestsStep } from "./steps/Interests";
import { UsernameStep } from "./steps/UsernameStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import ProfileStep from "./steps/ProfileStep";

interface OnboardingProps {
  onComplete?: (data: any) => void;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [formData, setFormData] = useLocalStorage({
    key: "onboarding-data",
    defaultValue: {
      username: "",
      displayName: "",
      profileImage: "",
      interests: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createProfile,
    onSuccess: async (data) => {
      const res = await updateProfile({
        isOnboarded: true,
        username: data?.username!,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const usernameCookie = hasCookie("username");
      if (usernameCookie) {
        deleteCookie("username");
      }
      toast.success("Profile created successfully!");
      setCurrentStep(2);
    },
    onError: (error) => {
      toast.error("Failed to create profile: " + error.message);
    },
  });

  const onComplete = async (data: any) => {
    try {
      router.push(`/${formData?.username}`);
      localStorage.removeItem("onboarding-data");
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

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
          isPending={isPending}
          formData={formData}
          onNext={async (username) => {
            setFormData((prev) => ({ ...prev, username }));
            mutate(username);
          }}
        />
      ),
    },
    // {
    //   id: "profile-details",
    //   component: (
    //     <ProfileStep
    //       isPending={isPending}
    //       formData={formData}
    //       onNext={async ({ displayName, profileImage }) => {
    //         // setFormData((prev) => ({ ...prev, username }));
    //         // mutate(username);
    //       }}
    //     />
    //   ),
    // },

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md  border border-neutral-200 dark:border-dark-border/60 rounded-3xl shadow-xl dark:shadow-black/10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            style={{ height: "auto", minHeight: "250px" }}
            key={currentStep}
            className="bg-white dark:bg-neutral-800"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
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
            key={index}
            onClick={() => setCurrentStep(index)}
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
