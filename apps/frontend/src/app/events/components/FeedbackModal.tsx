"use client";

import React, { useState } from "react";
import { X, Star } from "lucide-react";
import type { Event } from "@/types/event";

export interface Ratings {
  organization: number;
  communication: number;
  engagement: number;
  timing: number;
}

interface FeedbackModalProps {
  event: Event;
  ratings: Ratings;
  workAgain: string;
  additionalComments: string;
  onClose: () => void;
  onRatingClick: (category: string, value: number) => void;
  onWorkAgainChange: (value: string) => void;
  onCommentsChange: (value: string) => void;
  onSubmit: () => void;
}

export default function FeedbackModal({
  event,
  ratings,
  workAgain,
  additionalComments,
  onClose,
  onRatingClick,
  onWorkAgainChange,
  onCommentsChange,
  onSubmit,
}: FeedbackModalProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number>(0);

  const getOrganizerName = () => {
    if (typeof event.organizer === "object" && event.organizer !== null) {
      const org = event.organizer as any;
      return (
        `${org.firstName || ""} ${org.lastName || ""}`.trim() || "Organizer"
      );
    }
    return "Organizer";
  };

  const renderStarRating = (category: string, label: string) => {
    return (
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">{label}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const isHovered =
              hoveredCategory === category && value <= hoveredValue;
            const isFilled = ratings[category as keyof Ratings] >= value;

            return (
              <button
                key={value}
                onClick={() => onRatingClick(category, value)}
                onMouseEnter={() => {
                  setHoveredCategory(category);
                  setHoveredValue(value);
                }}
                onMouseLeave={() => {
                  setHoveredCategory(null);
                  setHoveredValue(0);
                }}
                className="focus:outline-none transition-colors"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    isFilled
                      ? "fill-[#FF6B35] text-[#FF6B35]"
                      : isHovered
                      ? "text-[#FF6B35]"
                      : "text-gray-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#FF6B35]">
            Session Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              {event.eventName}
            </h3>
            <p className="text-sm text-gray-600">
              Organized by {getOrganizerName()}
            </p>
          </div>

          {renderStarRating(
            "organization",
            "How well-organized was the event overall?"
          )}
          {renderStarRating(
            "communication",
            "How clear and timely was the communication before and during the session?"
          )}
          {renderStarRating(
            "engagement",
            "How engaged and responsive was the audience during your session?"
          )}
          {renderStarRating(
            "timing",
            "Did the session start and end on time with proper facilitation?"
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              Would You Work With This Organizer Again?
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={workAgain === "yes"}
                  onChange={() =>
                    onWorkAgainChange(workAgain === "yes" ? "" : "yes")
                  }
                  className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={workAgain === "no"}
                  onChange={() =>
                    onWorkAgainChange(workAgain === "no" ? "" : "no")
                  }
                  className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-2">
              Additional Comments (Optional)
            </p>
            <textarea
              value={additionalComments}
              onChange={(e) => onCommentsChange(e.target.value)}
              placeholder="Share any additional insights about your event experience..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-sm resize-none"
            />
          </div>

          <button
            onClick={onSubmit}
            className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
