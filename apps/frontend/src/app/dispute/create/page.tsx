"use client";

import { useMemo, useState } from "react";
import { DisputeFormData, UrgencyLevel } from "../types/disputeTypes";
import ProgressIndicator from "../components/ProgressIndicator";
import { useCreateDisputeMutation } from "@/store/api/disputeApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import EventSelectionStep from "../components/EventSelectionStep";
import PartiesInvolvedStep from "../components/PartiesInvolvedStep";
import DisputeDetailsStep from "../components/DisputeDetailsStep";
import DescriptionStep from "../components/DescriptionStep";
import ReviewStep from "../components/ReviewStep";

/**
 * Create Dispute Page - Multi-step wizard matching old project
 */
export default function CreateDisputePage() {
  const router = useRouter();
  const [createDispute, { isLoading }] = useCreateDisputeMutation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<DisputeFormData>({
    eventName: "",
    eventId: "",
    respondentId: [],
    disputeReason: "",
    disputeTitle: "",
    amount: 0,
    description: "",
    evidence: null,
    attachments: [],
    partiesInvolved: [],
    preferredResolution: "",
    urgencyLevel: UrgencyLevel.Medium,
    addons: {
      requestMediation: false,
      escalateToLegal: false,
      notifyAllParties: true,
    },
  });

  const totalSteps = 5;
  const stepTitles = useMemo(
    () => [
      "Event Selection",
      "Parties Involved",
      "Dispute Details",
      "Description",
      "Review",
    ],
    []
  );

  const updateFormData = (data: Partial<DisputeFormData>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.eventId && formData.eventName);
      case 2:
        return !!(
          formData.partiesInvolved && formData.partiesInvolved.length > 0
        );
      case 3:
        return !!(
          formData.disputeTitle?.trim() && formData.disputeReason?.trim()
        );
      case 4:
        return !!formData.description?.trim();
      default:
        return true;
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.eventId || !formData.eventName) {
          toast.error("Please select an event to continue.");
          return false;
        }
        break;
      case 2:
        if (
          !formData.partiesInvolved ||
          formData.partiesInvolved.length === 0
        ) {
          toast.error("Please add at least one party involved in the dispute.");
          return false;
        }
        break;
      case 3:
        if (!formData.disputeTitle?.trim() || !formData.disputeReason?.trim()) {
          toast.error("Please provide the dispute title and reason.");
          return false;
        }
        if (formData.amount < 0) {
          toast.error("Refund/claim amount cannot be negative.");
          return false;
        }
        break;
      case 4:
        if (!formData.description?.trim()) {
          toast.error("Please describe the dispute in detail.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      console.log("Create page handleSubmit called", { formData });

      const respondentIds =
        formData.partiesInvolved
          ?.map((p) => p.userId?.toString())
          .filter(Boolean) || [];

      console.log("Respondent IDs:", respondentIds);
      console.log("Parties involved:", formData.partiesInvolved);

      if (respondentIds.length === 0) {
        toast.error("Please select at least one respondent.");
        return;
      }

      if (!formData.disputeTitle?.trim()) {
        toast.error("Please provide a dispute title.");
        return;
      }

      if (!formData.description?.trim()) {
        toast.error("Please provide a dispute description.");
        return;
      }

      if (!formData.disputeReason?.trim()) {
        toast.error("Please select a dispute reason.");
        return;
      }

      const payload = {
        title: formData.disputeTitle.trim(),
        description: formData.description.trim(),
        category: formData.disputeReason.trim(),
        priority: "medium" as "low" | "medium" | "high" | "urgent",
        respondentIds: respondentIds,
        disputeAmount: formData.amount || 0,
        eventId: formData.eventId || undefined,
        disputeCurrency: "INR",
      };

      console.log("Submitting payload:", payload);

      const result = await createDispute(payload).unwrap();
      console.log("Dispute created successfully:", result);

      toast.success(result?.message || "Dispute created successfully!");

      // Small delay to ensure the toast is visible, then navigate
      setTimeout(() => {
        router.push("/dispute");
      }, 1000);
    } catch (error: any) {
      console.error("Create dispute error:", error);
      console.error("Error details:", {
        message: error?.data?.message,
        status: error?.status,
        data: error?.data,
        error: error,
      });
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to create dispute. Please check the console for details."
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventSelectionStep
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <PartiesInvolvedStep
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        );
      case 3:
        return (
          <DisputeDetailsStep
            formData={formData}
            onInputChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => updateFormData({ [e.target.name]: e.target.value })}
          />
        );
      case 4:
        return (
          <DescriptionStep
            formData={formData}
            onInputChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => updateFormData({ [e.target.name]: e.target.value })}
            onFormDataUpdate={updateFormData}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onStepChange={setCurrentStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="px-6">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />
      </div>

      <div className="px-6 mt-10">{renderStepContent()}</div>

      {currentStep < totalSteps && (
        <div className="flex justify-center items-center gap-4 mt-10 pt-6 border-t px-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            className={`px-8 py-2 rounded-full font-medium transition ${
              isCurrentStepValid()
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
