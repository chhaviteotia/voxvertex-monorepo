"use client";

import React from "react";
import { X, AlertCircle } from "lucide-react";
import type { Event } from "@/types/event";

interface SettlementModalProps {
  event: Event;
  settlementAmount: string;
  settlementReason: string;
  onClose: () => void;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onQuickSelect: (percentage: number) => void;
  onSubmit: () => void;
}

export default function SettlementModal({
  event,
  settlementAmount,
  settlementReason,
  onClose,
  onAmountChange,
  onReasonChange,
  onQuickSelect,
  onSubmit,
}: SettlementModalProps) {
  const reasons = [
    "Preparation time and research completed",
    "Materials and presentation development",
    "Calendar blocking and opportunity cost",
    "Travel arrangements and cancellation fees",
    "Custom presentation development",
    "Other (please specify)",
  ];

  const getOrganizerName = () => {
    if (typeof event.organizer === "object" && event.organizer !== null) {
      const org = event.organizer as any;
      return (
        `${org.firstName || ""} ${org.lastName || ""}`.trim() || "Organizer"
      );
    }
    return "Organizer";
  };

  // Get booking amount - this would come from booking data when backend is ready
  const bookingAmount = 5000; // Placeholder - should come from booking data

  return (
    <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#FF6B35]">
            Propose Settlement Fee
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">
                  Event Cancelled
                </h3>
                <p className="text-sm text-red-700 mb-1">
                  {event.eventName} organized by {getOrganizerName()}
                </p>
                <p className="text-sm text-red-700">
                  Original fee: ₹{bookingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#FF6B35] mb-2">
              Settlement Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                value={settlementAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-[#FF6B35] mb-2">Quick select:</p>
            <div className="flex gap-2">
              <button
                onClick={() => onQuickSelect(10)}
                className="px-4 py-2 bg-gray-100 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                10% (₹{(bookingAmount * 0.1).toLocaleString()})
              </button>
              <button
                onClick={() => onQuickSelect(25)}
                className="px-4 py-2 bg-gray-100 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                25% (₹{(bookingAmount * 0.25).toLocaleString()})
              </button>
              <button
                onClick={() => onQuickSelect(50)}
                className="px-4 py-2 bg-gray-100 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                50% (₹{(bookingAmount * 0.5).toLocaleString()})
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#FF6B35] mb-2">
              Reason for Settlement
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="settlementReason"
                    checked={settlementReason === reason}
                    onChange={() => onReasonChange(reason)}
                    className="w-4 h-4 text-[#FF6B35] border-gray-300 mt-0.5 focus:ring-[#FF6B35]"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-[#FF6B35] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#FF6B35] mb-2">
              Settlement Guidelines
            </h3>
            <ul className="text-sm text-[#FF6B35] space-y-1">
              <li>
                • Settlement fees typically range from 10-50% of the original
                fee
              </li>
              <li>
                • Consider preparation time, materials developed, and
                opportunity cost
              </li>
              <li>• Be reasonable and professional in your request</li>
              <li>• The organizer will review your proposal</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-3 rounded-lg transition-colors"
            >
              Submit Settlement Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
