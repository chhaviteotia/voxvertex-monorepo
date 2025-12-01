import { Check } from "lucide-react";
import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressIndicatorProps) {
  return (
    <div className="text-center mb-8 w-full">
      {/* Step Progress Indicator */}
      <div className="relative mt-12 mb-8 w-full">
        {/* Steps */}
        <div className="flex justify-between items-start relative w-full">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  index + 1 === currentStep
                    ? "bg-[#FF6B35] text-white"
                    : index + 1 < currentStep
                    ? "bg-[#FF6B35] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs text-center whitespace-nowrap">
                {title}
              </span>
            </div>
          ))}
        </div>

        <div
          className="absolute top-4 h-0.5 bg-gray-200 z-0"
          style={{
            left: `calc(${100 / (totalSteps * 2)}%)`,
            right: `calc(${100 / (totalSteps * 2)}%)`,
          }}
        >
          <div
            className="h-full bg-[#FF6B35] transition-all duration-300"
            style={{
              width:
                currentStep === 1
                  ? "0%"
                  : `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current Step Title */}
      <div className="mb-6 mt-10">
        <h2 className="text-lg text-left font-semibold text-gray-900">
          {stepTitles[currentStep - 1]}
        </h2>
        <p className="text-gray-600 text-md text-left mt-1">
          {currentStep === 1 && "Basic event information"}
          {currentStep === 2 && "Visual elements and content"}
          {currentStep === 3 && "Ticket types and pricing"}
          {currentStep === 4 && "Review policies and terms"}
          {currentStep === 5 && "Final review and saving"}
        </p>
      </div>
    </div>
  );
}
