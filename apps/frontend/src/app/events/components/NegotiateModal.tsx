"use client";

import React from "react";
import { X, AlertCircle, Calendar } from "lucide-react";
import type { Event } from "@/types/event";

interface NegotiateModalProps {
  event: Event;
  postponeResponse: string;
  proposedDate: string;
  proposedTime: string;
  declineReason: string;
  onClose: () => void;
  onResponseChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}

export default function NegotiateModal({
  event,
  postponeResponse,
  proposedDate,
  proposedTime,
  declineReason,
  onClose,
  onResponseChange,
  onDateChange,
  onTimeChange,
  onReasonChange,
  onSubmit,
}: NegotiateModalProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOrganizerName = () => {
    if (typeof event.organizer === "object" && event.organizer !== null) {
      const org = event.organizer as any;
      return (
        `${org.firstName || ""} ${org.lastName || ""}`.trim() || "Organizer"
      );
    }
    return "Organizer";
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#FF6B35]">
            Negotiate New Date
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Event Postponed
                </h3>
                <p className="text-sm text-yellow-800 mb-1">
                  {event.eventName}
                </p>
                <div className="flex items-center gap-2 text-sm text-yellow-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Original Date: {formatDate(event.startDate)}</span>
                </div>
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Reason:</span> Speaker
                  availability conflict - requesting new date options
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Your Response
            </p>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="postponeResponse"
                checked={postponeResponse === "accept"}
                onChange={() => onResponseChange("accept")}
                className="w-5 h-5 text-green-600 border-gray-300 mt-0.5 focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-green-700">
                  Accept Postponement
                </p>
                <p className="text-sm text-gray-600">
                  Accept postponement and propose a new date
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="postponeResponse"
                checked={postponeResponse === "decline"}
                onChange={() => onResponseChange("decline")}
                className="w-5 h-5 text-red-600 border-gray-300 mt-0.5 focus:ring-red-500"
              />
              <div>
                <p className="font-medium text-red-700">Decline Postponement</p>
                <p className="text-sm text-gray-600">
                  Unable to accommodate the new schedule
                </p>
              </div>
            </label>
          </div>

          {postponeResponse === "accept" && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Propose New Date & Time
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={proposedTime}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="--:-- --"
                  />
                </div>
              </div>
            </div>
          )}

          {postponeResponse === "decline" && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Reason for Declining (Optional)
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Let the organizer know why you can't accommodate the postponement..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
              />
            </div>
          )}

          <div className="bg-orange-50 border border-[#FF6B35] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#FF6B35] mb-2">
              Important Notes
            </h3>
            <ul className="text-sm text-[#FF6B35] space-y-1">
              <li>• Your response will be sent to {getOrganizerName()}</li>
              <li>
                • If declining, the event may be cancelled and you can propose a
                settlement fee
              </li>
              <li>
                • If accepting, ensure the new date works with your schedule
              </li>
              <li>
                • You can provide a rating and feedback regardless of your
                decision
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={
                !postponeResponse ||
                (postponeResponse === "accept" &&
                  (!proposedDate || !proposedTime))
              }
              className={`flex-1 font-medium py-2.5 rounded-lg transition-colors ${
                postponeResponse === "accept"
                  ? "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  : postponeResponse === "decline"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              {postponeResponse === "accept"
                ? "Accept Postponement"
                : postponeResponse === "decline"
                ? "Decline Postponement"
                : "Select Response"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
