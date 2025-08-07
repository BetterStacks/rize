"use client";
import { createProfile, updateProfile } from "@/actions/profile-actions";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { deleteCookie, hasCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FinishStep } from "./steps/FinishStep";
import { InterestsStep } from "./steps/Interests";
import ProfileStep from "./steps/ProfileStep";
import { ResumeStep } from "./steps/ResumeStep";
import { UsernameStep } from "./steps/UsernameStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import { bulkInsertSections } from "@/actions/general-actions";
import { processResumeData } from "@/actions/resume-actions";

export default function OnboardingFlow() {
  const router = useRouter();
  const session = useSession();
  const [formData, setFormData] = useLocalStorage({
    key: "onboarding-data",
    defaultValue: {
      username: "",
      displayName: session?.data?.user?.name || "",
      profileImage: session?.data?.user?.image || "",
      interests: [],
      resumeData: null,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createProfile,
    onSuccess: async (data) => {
      const res = await updateProfile({
        username: data?.username as string,
      });
      if (res.error) {
        toast.error(res.error as string);
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

  const { mutate: addProfileDetails, isPending: isProfileUpdatePending } =
    useMutation({
      mutationFn: async (data: {
        profileImage: string;
        displayName: string;
      }) => {
        const formData = new FormData();
        formData.append("file", data?.profileImage as string);
        formData.append("type", "avatar");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        return res.json();
      },
      onError: (error) => {
        toast.error(error?.message);
      },
      onSuccess: async (data, params) => {
        const resp = await updateProfile({
          profileImage: data.url,
          displayName: params?.displayName,
        });
        if (!resp?.success && resp.error) {
          toast.error(resp?.error as string);
          return;
        }
        toast.success("Profile picture updated successfully");
        await session?.update();
        setCurrentStep(3);
      },
    });

  const onComplete = async () => {
    try {
      await bulkInsertSections();
      
      // Process resume data if available
      if (formData?.resumeData) {
        const result = await processResumeData(formData.resumeData);
        if (result.success) {
          toast.success(`Resume data imported: ${result.stats?.experience || 0} experiences, ${result.stats?.education || 0} education entries`);
        } else {
          toast.error("Failed to import resume data, but profile was created successfully");
        }
      }
      
      // Mark onboarding as completed
      await updateProfile({
        isOnboarded: true,
      });
      await session?.update();
      
      router.push(`/${formData?.username}`);
      localStorage.removeItem("onboarding-data");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to complete onboarding");
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
    {
      id: "profile-details",
      component: (
        <ProfileStep
          isPending={isProfileUpdatePending}
          formData={formData}
          onNext={async ({ displayName, profileImage }) => {
            setFormData((prev) => ({ ...prev, displayName, profileImage }));
            addProfileDetails({ profileImage, displayName });
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
            setCurrentStep(4);
          }}
        />
      ),
    },
    {
      id: "resume",
      component: (
        <ResumeStep
          formData={formData}
          onNext={(resumeData?: any) => {
            if (resumeData) {
              setFormData((prev) => ({ ...(prev as any), resumeData }));
            }
            setCurrentStep(5);
          }}
        />
      ),
    },
    {
      id: "finish",
      component: (
        <FinishStep formData={formData} onComplete={() => onComplete()} />
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <div className="w-full max-w-md  border border-neutral-200 dark:border-dark-border/60 rounded-3xl shadow-xl dark:shadow-black/10 overflow-hidden">
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
        </div>
      </AnimatePresence>
      <div className="flex justify-center gap-2 mt-10">
        {steps.map((_, index) => (
          <div
            key={index}
            // onClick={() => setCurrentStep(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentStep === index
                ? "w-8 bg-neutral-400 dark:bg-dark-border"
                : currentStep > index
                ? "bg-neutral-300 dark:bg-neutral-800"
                : "bg-neutral-300 dark:bg-neutral-800"
            )}
          />
        ))}
      </div>
    </div>
  );
}
