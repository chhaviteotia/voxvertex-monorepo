"use client";

import { DisputeFormData } from "../types/disputeTypes";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateDisputeMutation } from "@/store/api/disputeApi";
import { toast } from "react-hot-toast";

interface ReviewStepProps {
  formData: DisputeFormData;
  onStepChange: (step: number) => void;
  onClose?: () => void;
  onSubmit?: () => Promise<void>;
  isLoading?: boolean;
}

export default function ReviewStep({
  formData,
  onStepChange,
  onClose,
  onSubmit,
  isLoading: externalIsLoading,
}: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [createDispute] = useCreateDisputeMutation();

  const safeText = (value?: string | number) =>
    typeof value === "string" ? value.trim() || "-" : value ?? "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("=== ReviewStep handleSubmit START ===");
    console.log("Form data:", {
      formData,
      partiesInvolved: formData.partiesInvolved,
      disputeTitle: formData.disputeTitle,
      description: formData.description,
      disputeReason: formData.disputeReason,
      eventId: formData.eventId,
      amount: formData.amount,
    });

    setIsLoading(true);

    try {
      const respondentIds =
        (formData.partiesInvolved
          ?.map((p) => p.userId?.toString())
          .filter(Boolean) as string[]) || [];

      console.log("Respondent IDs:", respondentIds);
      console.log("Parties involved:", formData.partiesInvolved);

      if (respondentIds.length === 0) {
        toast.error("Please select at least one respondent.");
        setIsLoading(false);
        return;
      }

      if (!formData.disputeTitle?.trim()) {
        toast.error("Please provide a dispute title.");
        setIsLoading(false);
        return;
      }

      if (!formData.description?.trim()) {
        toast.error("Please provide a dispute description.");
        setIsLoading(false);
        return;
      }

      if (!formData.disputeReason?.trim()) {
        toast.error("Please select a dispute reason.");
        setIsLoading(false);
        return;
      }

      const payload = {
        title: formData.disputeTitle.trim(),
        description: formData.description.trim(),
        category: formData.disputeReason.trim(),
        priority: "medium" as "low" | "medium" | "high" | "urgent",
        respondentIds: respondentIds,
        eventId: formData.eventId || undefined,
        disputeAmount:
          typeof formData.amount === "string"
            ? parseFloat(formData.amount) || 0
            : formData.amount || 0,
        disputeCurrency: "INR",
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));
      console.log("Calling createDispute mutation...");

      const result = await createDispute(payload).unwrap();
      console.log("=== Dispute created successfully ===");
      console.log("Result:", result);

      toast.success(result?.message ?? "Dispute created successfully");

      if (onClose) {
        onClose();
      }

      // Navigate to dispute page - the query should auto-refetch due to invalidatesTags
      setTimeout(() => {
        router.push("/dispute");
      }, 500);
    } catch (err: any) {
      console.error("Submit dispute error:", err);
      console.error("Error details:", {
        message: err?.data?.message,
        status: err?.status,
        data: err?.data,
        error: err,
      });
      toast.error(
        err?.data?.message ??
          err?.message ??
          "Failed to submit dispute. Please check the console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-orange-500 mb-4">
        Review & Submit
      </h3>

      <SectionCard
        title="Event Information"
        step={1}
        onStepChange={onStepChange}
        content={
          <>
            <h5 className="font-medium text-gray-900">
              {safeText(formData.eventName)}
            </h5>
            {formData.eventDate && (
              <p className="text-sm text-gray-600">
                Date: {new Date(formData.eventDate).toLocaleDateString()}
              </p>
            )}
          </>
        }
      />

      <SectionCard
        title="Parties Involved"
        step={2}
        onStepChange={onStepChange}
        content={
          <p className="text-gray-900">
            {formData.partiesInvolved?.length
              ? formData.partiesInvolved
                  .map((p) => `${p.name} (${p.role})`)
                  .join(", ")
              : "-"}
          </p>
        }
      />

      <SectionCard
        title="Dispute Details"
        step={3}
        onStepChange={onStepChange}
        content={
          <div className="space-y-1">
            <InfoRow label="Title" value={formData.disputeTitle} />
            <InfoRow label="Reason" value={formData.disputeReason} />
            <InfoRow label="Amount" value={formData.amount ?? 0} />
          </div>
        }
      />

      <SectionCard
        title="Description & Evidence"
        step={4}
        onStepChange={onStepChange}
        content={
          <div className="space-y-2">
            <p className="text-sm text-gray-900">
              {safeText(formData.description)}
            </p>
            <div>
              <h5 className="font-medium text-gray-700 mb-1">
                Requested Resolution
              </h5>
              <p className="text-sm text-gray-900">
                {safeText(formData.preferredResolution)}
              </p>
            </div>
            {(formData as any).supportingDocument && (
              <div className="mt-2">
                <h5 className="font-medium text-gray-700 mb-1">
                  Supporting Document
                </h5>
                <p className="text-sm text-gray-900">
                  {(formData as any).supportingDocument.name}
                </p>
              </div>
            )}
            {(formData as any).preferredContact && (
              <div>
                <span className="text-sm text-gray-600">Preferred Contact</span>{" "}
                <span className="text-sm text-gray-900">
                  {(formData as any).preferredContact}
                </span>
              </div>
            )}
          </div>
        }
      />

      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          type="button"
          onClick={() => onStepChange(4)}
          className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={isLoading || externalIsLoading}
          className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            console.log("Submit button clicked - form will handle submission");
          }}
        >
          {isLoading || externalIsLoading ? "Submitting..." : "Submit Dispute"}
        </button>
      </div>
    </form>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">
        {typeof value === "string" ? value || "-" : value ?? "-"}
      </span>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  content: React.ReactNode;
  step: number;
  onStepChange: (step: number) => void;
}

function SectionCard({ title, content, step, onStepChange }: SectionCardProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-orange-500">{title}</h4>
        <button
          type="button"
          onClick={() => onStepChange(step)}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-600 flex items-center gap-1"
        >
          <Edit size={16} /> Edit
        </button>
      </div>
      {content}
    </div>
  );
}
