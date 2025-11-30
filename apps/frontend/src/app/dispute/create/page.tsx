"use client";

import { useMemo, useState } from "react";
import { DisputeFormData, UrgencyLevel } from "../types/disputeTypes";
import ProgressIndicator from "../components/ProgressIndicator";
import { useCreateDisputeMutation } from "@/store/api/disputeApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Placeholder step components - we'll create these next
const EventSelectionStep = () => (
  <div className="space-y-6">
    <p className="text-gray-600">Event Selection Step - Coming Soon</p>
  </div>
);

const PartiesInvolvedStep = () => (
  <div className="space-y-6">
    <p className="text-gray-600">Parties Involved Step - Coming Soon</p>
  </div>
);

const DisputeDetailsStep = ({ formData, onInputChange }: any) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-orange-500">Dispute Details</h3>
    <div>
      <label className="block text-sm font-medium text-orange-500">
        Dispute Title
      </label>
      <input
        type="text"
        name="disputeTitle"
        value={formData.disputeTitle || ""}
        onChange={onInputChange}
        className="w-full border-0 border-b border-gray-300 focus:border-orange-500 focus:ring-0 placeholder-gray-400"
        placeholder="Enter Title"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-orange-500">
        Dispute Amount
      </label>
      <input
        type="number"
        name="amount"
        value={formData.amount || ""}
        onChange={onInputChange}
        className="w-full border-0 border-b border-gray-300 focus:border-orange-500 focus:ring-0 placeholder-gray-400"
        placeholder="Enter Amount"
      />
    </div>
  </div>
);

const DescriptionStep = ({ formData, onInputChange }: any) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-orange-500">
      Description & Evidence
    </h3>
    <div>
      <label className="block text-sm font-semibold mb-1">
        Detailed Description
      </label>
      <textarea
        name="description"
        value={formData.description || ""}
        onChange={onInputChange}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        placeholder="Please provide a detailed description of the dispute..."
        rows={4}
      />
    </div>
  </div>
);

const ReviewStep = ({ formData, onStepChange, onSubmit, isLoading }: any) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-orange-500 mb-4">
      Review & Submit
    </h3>
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <h4 className="font-medium text-orange-500 mb-2">Dispute Summary</h4>
      <p>
        <strong>Title:</strong> {formData.disputeTitle || "-"}
      </p>
      <p>
        <strong>Amount:</strong> {formData.amount || "-"}
      </p>
      <p>
        <strong>Description:</strong> {formData.description || "-"}
      </p>
    </div>
    <div className="flex justify-center items-center gap-4 pt-6">
      <button
        type="button"
        onClick={() => onStepChange(4)}
        className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting..." : "Submit Dispute"}
      </button>
    </div>
  </div>
);

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
      const respondentIds =
        formData.partiesInvolved?.map((p) => p.userId) || [];

      const payload = {
        title: formData.disputeTitle || "",
        description: formData.description || "",
        category: formData.disputeReason || "",
        priority: "medium" as "low" | "medium" | "high" | "urgent",
        respondentIds: respondentIds,
        disputeAmount: formData.amount || 0,
        eventId: formData.eventId || undefined,
      };

      await createDispute(payload).unwrap();
      toast.success("Dispute created successfully!");
      router.push("/dispute");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create dispute");
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
            onInputChange={(e: any) =>
              updateFormData({ [e.target.name]: e.target.value })
            }
          />
        );
      case 4:
        return (
          <DescriptionStep
            formData={formData}
            onInputChange={(e: any) =>
              updateFormData({ [e.target.name]: e.target.value })
            }
            onFormDataUpdate={updateFormData}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit}
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
