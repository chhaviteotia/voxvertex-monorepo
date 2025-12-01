"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressIndicator from "./components/ProgressIndicator";
import CoreDetailsStep from "./components/steps/CoreDetailsStep";
import BrandingContentStep from "./components/steps/BrandingContentStep";
import TicketingStep from "./components/steps/TicketingStep";
import PoliciesStep from "./components/steps/PoliciesStep";
import ReviewPublishStep from "./components/steps/ReviewPublishStep";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";

// Type for EventStep matching old project
type EventStep = 1 | 2 | 3 | 4 | 5;

// Simplified form data type matching old project structure
interface EventFormData {
  eventName: string;
  startDate: string;
  endDate: string;
  eventMode: "offline" | "online" | "hybrid";
  format: string;
  location: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
  dialInNumbers?: string;
  participantInstructions?: string;
  description: string;
  image: File | null;
  bannerImageUrl?: string;
  tags: string[];
  ticketTypes: Array<{
    name: string;
    price: string;
    quantity: string;
    features?: string[];
    discount?: {
      enabled: boolean;
      name: string;
      type: "percentage" | "fixed";
      value: string;
      maxUses: string;
      startDate: string;
      endDate: string;
      code: string;
      description: string;
    };
  }>;
  policies: {
    participantRefund: any;
    speakerCancellation: any;
    eventCancellation: any;
    eventPostponement: any;
    generalTerms: string;
  };
  status: "draft" | "published";
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Debug: Log when component mounts
  useEffect(() => {
    console.log("✅ CreateEventPage component mounted");
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    startDate: "",
    endDate: "",
    eventMode: "offline",
    format: "",
    location: "",
    description: "",
    image: null,
    tags: [],
    ticketTypes: [],
    policies: {
      participantRefund: {
        allowRefunds: false,
        refundDeadline: "",
        refundPercentage: "",
        processingTime: "48 hours",
        refundConditions: [],
      },
      speakerCancellation: {
        allowCancellation: false,
        cancellationDeadline: "",
        partialRefundPercentage: "",
        requireReplacement: false,
        paymentTerms: "",
        speakerConditions: [],
      },
      eventCancellation: {
        allowCancellation: false,
        fullRefundDeadline: "",
        partialRefundPercentage: "",
        refundMethod: "",
        processingTime: "48 hours",
        cancellationConditions: "",
      },
      eventPostponement: {
        allowPostponement: false,
        noticeRequired: "",
        maxPostponementDuration: "",
        partialRefundRequestDeadline: "",
        ticketsValidForNewDate: false,
        offerRefundOnPostponement: false,
        allowSpeakersToCancelOnPostponement: false,
        refundPercentageOnPostponement: "",
        postponementConditions: [],
      },
      generalTerms: "",
    },
    status: "draft",
  });

  const totalSteps = 5;
  const stepTitles = [
    "Core Details",
    "Branding & Content",
    "Ticketing",
    "Policies & Terms",
    "Review & Save",
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const userRole =
      (user?.role as string) || (currentUserData?.user?.role as string) || "";
    if (userRole !== "organizer") {
      router.push("/events");
      return;
    }
  }, [isAuthenticated, user, currentUserData, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateStep1 = (data: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateStep2 = (data: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateStep3 = (data: { ticketTypes: EventFormData["ticketTypes"] }) => {
    setFormData((prev) => ({ ...prev, ticketTypes: data.ticketTypes }));
  };

  const updatePolicies = (data: { policies: EventFormData["policies"] }) => {
    setFormData((prev) => ({ ...prev, policies: data.policies }));
  };

  const handleNext = () => {
    console.log("🔍 Next Button Clicked - Debug Info:", {
      canProceed: canProceedToNext(),
      currentStep,
      formData: {
        eventName: formData.eventName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        eventMode: formData.eventMode,
        format: formData.format,
        location: formData.location,
      },
    });

    if (canProceedToNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("❌ Cannot proceed to next step - validation failed");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    setLastSaved(new Date().toISOString());
    // TODO: Save draft to backend
    console.log("Draft saved successfully!");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement event creation with API
      console.log("Creating event:", formData);
      // TODO: Implement event creation with API using eventApi
      // For now, just redirect
      router.push("/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (stepNumber: number) => {
    setCurrentStep(stepNumber as EventStep);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.eventName &&
          formData.startDate &&
          formData.endDate &&
          formData.eventMode &&
          formData.format &&
          (formData.eventMode === "offline" || formData.eventMode === "hybrid"
            ? formData.location
            : true) &&
          (formData.eventMode === "online" || formData.eventMode === "hybrid"
            ? formData.meetingPlatform && formData.meetingLink
            : true)
        );
      case 2:
        return !!(formData.description && formData.image);
      case 3:
        return formData.ticketTypes.length > 0;
      case 4:
        return true; // Policies are optional
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoreDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );

      case 2:
        return (
          <BrandingContentStep
            formData={formData}
            onInputChange={handleInputChange}
            onFormDataUpdate={updateStep2}
          />
        );

      case 3:
        return (
          <TicketingStep formData={formData} onFormDataUpdate={updateStep3} />
        );

      case 4:
        return (
          <PoliciesStep
            formData={{ policies: formData.policies }}
            onFormDataUpdate={updatePolicies}
          />
        );

      case 5:
        return (
          <ReviewPublishStep
            formData={{
              eventName: formData.eventName,
              startDate: formData.startDate,
              endDate: formData.endDate,
              eventMode: formData.eventMode,
              location: formData.location,
              description: formData.description,
              image: formData.image,
              tags: formData.tags,
              ticketTypes: formData.ticketTypes,
              policies: formData.policies,
            }}
            onStepChange={handleStepChange}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  const userRole =
    (user?.role as string) || (currentUserData?.user?.role as string) || "";
  if (userRole !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Background cover to prevent content showing behind header - exact match with old project */}
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-50 z-[99] pointer-events-none"></div>
      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
      />
      <Sidebar />

      {/* Main Content - Exact match with old project */}
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32">
        {/* Main Form Content */}
        <div>
          {/* Form Card - Exact match with old project */}
          <div className="bg-white rounded-xl shadow-sm border-1 border-[#FF6B35]/50">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-[#FF6B35]">
                  Create New Event
                </h1>
                <div className="flex items-center space-x-4">
                  {isDraft && (
                    <span className="text-sm text-gray-500">
                      Draft saved{" "}
                      {lastSaved
                        ? new Date(lastSaved).toLocaleTimeString()
                        : ""}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 text-sm border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors"
                  >
                    Save Draft
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
              />
            </div>

            {/* Form Content */}
            <div className="px-2 pb-6">
              {/* Step Content */}
              <div className="w-full">{renderStepContent()}</div>

              {/* Error Display */}
              {error && (
                <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < totalSteps && (
                <div className="flex justify-center space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-sm border-2 border-[#FF6B35] text-[#FF6B35] rounded-full hover:bg-[#FF6B35]/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="px-6 py-2 text-sm bg-[#FF6B35] text-white rounded-full hover:bg-[#e55a2b] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
