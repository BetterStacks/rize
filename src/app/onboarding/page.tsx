"use client";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const MAX_STEPS = 5;
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-3 mb-6 max-w-3xl w-full">
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
      </div>
      <AnimatePresence>
        <motion.div className="w-28 relative h-28 overflow-hidden flex bg-gray-600 justify-center">
          <motion.div
            initial={{ x: direction == -1 ? 100 : -100 }}
            animate={{ x: 0 }}
            exit={{ x: direction == -1 ? -100 : 100 }}
            key={currentStep}
            transition={{ duration: 0.2, type: "tween" }}
            className="w-24 h-24 bg-blue-700 absolute"
          >
            {currentStep}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Page;
