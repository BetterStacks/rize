"use client";
import ClaimUsernameForm from "@/components/claim-username";
import { Button } from "@/components/ui/button";
import { createProfile, setUserIsOnboarded } from "@/lib/server-actions";
import { UsernameFormData } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const handleSubmit = async (data: UsernameFormData) => {
    const { data: res, error } = await createProfile(data?.username);
    if (error && !data) {
      toast.error(error);
      return;
    }
    const { success } = await setUserIsOnboarded();
    if (!success && error) {
      toast.error(error);
      return;
    }
    toast.success("Profile created successfully");
    router.push(`/${data?.username}`);
  };
  const steps = [
    { id: 1, component: <ClaimUsernameForm onSubmit={handleSubmit} /> },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const MAX_STEPS = 2;
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      {/* <div className="flex items-center justify-center gap-3 mb-6 max-w-3xl w-full">
        <Button
          disabled={currentStep === 1}
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
              setDirection(-1);
            }
          }}
        >
          Prev
        </Button>
        <Button
          disabled={currentStep === MAX_STEPS}
          onClick={() => {
            if (currentStep < MAX_STEPS) {
              setCurrentStep(currentStep + 1);
              setDirection(1);
            }
          }}
        >
          Next
        </Button>
      </div> */}
      <AnimatePresence>
        {/* <motion.div className="max-w-lg relative  w-full h-[550px]">
          <motion.div
            initial={{ x: direction == -1 ? 100 : -100 }}
            animate={{ x: 0 }}
            exit={{ x: direction == -1 ? -100 : 100 }}
            key={currentStep}
            transition={{ duration: 0.2, type: "tween" }}
            className=""
          > */}
        {/* {steps[currentStep]?.component}
         */}
        <div className="max-w-md">
          <ClaimUsernameForm onSubmit={handleSubmit} />
        </div>
        {/* </motion.div>
        </motion.div> */}
      </AnimatePresence>
    </div>
  );
};

export default Page;
