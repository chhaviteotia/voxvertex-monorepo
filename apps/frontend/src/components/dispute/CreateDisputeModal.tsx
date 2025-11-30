"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateDisputeMutation } from "@/store/api/disputeApi";
import { toast } from "react-hot-toast";

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateDisputeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDisputeModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    respondentIds: [] as string[],
    disputeAmount: "",
    eventId: "",
  });

  const [createDispute, { isLoading }] = useCreateDisputeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.respondentIds.length === 0) {
      toast.error("Please add at least one respondent");
      return;
    }

    try {
      await createDispute({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        respondentIds: formData.respondentIds,
        eventId: formData.eventId || undefined,
        disputeAmount: formData.disputeAmount
          ? Number(formData.disputeAmount)
          : undefined,
      }).unwrap();

      toast.success("Dispute created successfully");
      onClose();
      onSuccess?.();

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        respondentIds: [],
        disputeAmount: "",
        eventId: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create dispute");
    }
  };

  const handleAddRespondent = () => {
    const respondentId = prompt("Enter respondent ID:");
    if (respondentId && !formData.respondentIds.includes(respondentId)) {
      setFormData({
        ...formData,
        respondentIds: [...formData.respondentIds, respondentId],
      });
    }
  };

  const handleRemoveRespondent = (id: string) => {
    setFormData({
      ...formData,
      respondentIds: formData.respondentIds.filter((rId) => rId !== id),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Dispute</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                placeholder="e.g., Payment, Service, Communication"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispute Amount
            </label>
            <input
              type="number"
              value={formData.disputeAmount}
              onChange={(e) =>
                setFormData({ ...formData, disputeAmount: e.target.value })
              }
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event ID (Optional)
            </label>
            <input
              type="text"
              value={formData.eventId}
              onChange={(e) =>
                setFormData({ ...formData, eventId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Respondents *
            </label>
            <div className="space-y-2">
              {formData.respondentIds.map((id, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-900">{id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRespondent(id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddRespondent}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                + Add Respondent
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
