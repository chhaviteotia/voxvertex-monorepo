"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProgressIndicatorProps } from "../types";

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  const stepNames = ["Personal Info", "Security", "Password", "Professional"];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center space-x-16">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center relative">
            <div className="relative">
              <motion.div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  step < currentStep
                    ? "bg-orange-500 border-orange-500 text-white"
                    : step === currentStep
                    ? "border-orange-500 text-orange-500 bg-white"
                    : "border-gray-300 text-gray-300 bg-white"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {step < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="font-medium text-xs">{step}</span>
                )}
              </motion.div>
            </div>

            <span className="text-xs text-gray-500 mt-1.5 text-center h-6 flex items-center justify-center">
              {stepNames[index]}
            </span>

            {index < steps.length - 1 && (
              <div className="absolute left-full top-4 w-16 h-0.5 -translate-y-1/2">
                <motion.div
                  className={`h-full transition-colors duration-300 ${
                    step < currentStep ? "bg-orange-500" : "bg-gray-300"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
