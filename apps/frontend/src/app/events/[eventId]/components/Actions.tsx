"use client";

import React, { useState } from "react";
import { Clock, X, AlertTriangle, Calendar, Eye } from "lucide-react";
// TODO: Add these API hooks when backend endpoints are ready
// import { usePostponeEventMutation, useGetPostponementOptionsQuery } from "@/store/api/eventApi";

interface ActionsProps {
  eventId: string;
}

// Simple Success Modal Component (inline)
const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: Array<{ label: string; value: string }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: string;
  };
}> = ({
  isOpen,
  onClose,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#FF6B35]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">{message}</p>
        {details && details.length > 0 && (
          <div className="space-y-2 mb-4">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700 font-medium">
                  {detail.label}:
                </span>
                <span className="text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Actions: React.FC<ActionsProps> = ({ eventId }) => {
  // TODO: Replace with actual API hooks when backend endpoints are ready
  // const [postponeEvent, { isLoading: isPostponing }] = usePostponeEventMutation();
  // const { data: postponementOptions } = useGetPostponementOptionsQuery(eventId, {
  //   skip: !showPostponeModal
  // });

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [checkboxes, setCheckboxes] = useState({
    newDates: false,
    offerRefund: false,
    sendNotification: false,
  });
  const [newEventData, setNewEventData] = useState({
    startDate: "",
    endDate: "",
    location: "",
    eventUrl: "",
  });
  const [newMeetingData, setNewMeetingData] = useState({
    meetingPlatform: "",
    meetingLink: "",
    meetingId: "",
    passcode: "",
    dialInNumbers: "",
    participantInstructions: "",
  });
  const [refundPercentage, setRefundPercentage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [postponementResult, setPostponementResult] = useState<{
    eventId: string;
    postponedAt: string;
    reason: string;
    newDates: {
      startDate: string;
      endDate: string;
    };
    newLocation: string | null;
    refundOffered: boolean;
    refundPercentage: number;
    warnings: string[];
  } | null>(null);

  // Placeholder for postponement options
  const postponementOptions = {
    data: {
      noticeRequired: 7,
      maxPostponementDuration: 90,
      offerRefundOnPostponement: true,
      maxRefundPercentage: 100,
    },
  };

  const handlePostponeClick = () => {
    setShowPostponeModal(true);
  };

  const handleModalClose = () => {
    setShowPostponeModal(false);
    setSelectedReason("");
    setCheckboxes({
      newDates: false,
      offerRefund: false,
      sendNotification: false,
    });
    setNewEventData({
      startDate: "",
      endDate: "",
      location: "",
      eventUrl: "",
    });
    setNewMeetingData({
      meetingPlatform: "",
      meetingLink: "",
      meetingId: "",
      passcode: "",
      dialInNumbers: "",
      participantInstructions: "",
    });
    setRefundPercentage(50);
    setError(null);
    setShowSuccessModal(false);
    setPostponementResult(null);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReason(e.target.value);
  };

  const handleCheckboxChange = (checkbox: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({
      ...prev,
      [checkbox]: !prev[checkbox],
    }));
  };

  const handleNewEventDataChange = (
    field: keyof typeof newEventData,
    value: string
  ) => {
    setNewEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewMeetingDataChange = (
    field: keyof typeof newMeetingData,
    value: string
  ) => {
    setNewMeetingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePostponeEvent = async () => {
    if (!selectedReason) {
      setError("Please select a reason for postponement");
      return;
    }

    if (
      checkboxes.newDates &&
      (!newEventData.startDate || !newEventData.endDate)
    ) {
      setError("Please provide both start and end dates");
      return;
    }

    // Check if datetime values are properly formatted (include time)
    if (checkboxes.newDates) {
      const startDate = new Date(newEventData.startDate);
      const endDate = new Date(newEventData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError("Please provide valid start and end dates with time");
        return;
      }

      // Check if time component is missing (datetime-local returns empty time as 00:00)
      if (newEventData.startDate && !newEventData.startDate.includes("T")) {
        setError("Please select both date and time for start date");
        return;
      }

      if (newEventData.endDate && !newEventData.endDate.includes("T")) {
        setError("Please select both date and time for end date");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call when backend endpoint is ready
      // const postponementData: {
      //   eventId: string;
      //   reason: string;
      //   refundOffered?: boolean;
      //   refundPercentage?: number;
      //   newDates?: { startDate: string; endDate: string };
      //   newLocation?: string;
      //   newMeetingDetails?: {
      //     meetingPlatform: string;
      //     meetingLink: string;
      //     meetingId?: string;
      //     passcode?: string;
      //     dialInNumbers?: string;
      //     participantInstructions?: string;
      //   };
      // } = {
      //   eventId,
      //   reason: selectedReason,
      //   refundOffered: checkboxes.offerRefund,
      //   refundPercentage: checkboxes.offerRefund ? refundPercentage : undefined,
      // };

      // if (checkboxes.newDates) {
      //   postponementData.newDates = {
      //     startDate: new Date(newEventData.startDate).toISOString(),
      //     endDate: new Date(newEventData.endDate).toISOString(),
      //   };
      // }

      // if (newEventData.location) {
      //   postponementData.newLocation = newEventData.location;
      // }

      // if (newMeetingData.meetingPlatform || newMeetingData.meetingLink) {
      //   postponementData.newMeetingDetails = {
      //     meetingPlatform: newMeetingData.meetingPlatform,
      //     meetingLink: newMeetingData.meetingLink,
      //     meetingId: newMeetingData.meetingId || undefined,
      //     passcode: newMeetingData.passcode || undefined,
      //     dialInNumbers: newMeetingData.dialInNumbers || undefined,
      //     participantInstructions: newMeetingData.participantInstructions || undefined,
      //   };
      // }

      // const result = await postponeEvent(postponementData).unwrap();

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success response
      const result = {
        success: true,
        data: {
          eventId,
          postponedAt: new Date().toISOString(),
          reason: selectedReason,
          newDates: checkboxes.newDates
            ? {
                startDate: new Date(newEventData.startDate).toISOString(),
                endDate: new Date(newEventData.endDate).toISOString(),
              }
            : undefined,
          newLocation: newEventData.location || null,
          refundOffered: checkboxes.offerRefund,
          refundPercentage: checkboxes.offerRefund ? refundPercentage : 0,
          warnings: [],
        },
      };

      if (result.success) {
        // Success! Store result and show success modal
        setPostponementResult(result.data || null);
        setShowSuccessModal(true);
        // Close the postpone modal but keep success modal open
        setShowPostponeModal(false);
        setSelectedReason("");
        setCheckboxes({
          newDates: false,
          offerRefund: false,
          sendNotification: false,
        });
        setNewEventData({
          startDate: "",
          endDate: "",
          location: "",
          eventUrl: "",
        });
        setNewMeetingData({
          meetingPlatform: "",
          meetingLink: "",
          meetingId: "",
          passcode: "",
          dialInNumbers: "",
          participantInstructions: "",
        });
        setRefundPercentage(50);
        setError(null);
      } else {
        setError("Failed to postpone event");
      }
    } catch (error: unknown) {
      console.error("Postponement error:", error);

      // Extract specific error message from backend
      let errorMessage = "Failed to postpone event. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = (
          error as {
            data?: { errors?: string[]; message?: string };
          }
        ).data;

        if (
          errorData?.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          // Use the first specific error from backend
          const specificError = errorData.errors[0];
          errorMessage = specificError;

          // Add helpful guidance for common errors
          if (specificError.includes("Cannot postpone more than")) {
            errorMessage +=
              "\n\n💡 Tip: Please select a date within the allowed postponement period.";
          } else if (
            specificError.includes("Minimum") &&
            specificError.includes("days notice")
          ) {
            errorMessage +=
              "\n\n💡 Tip: Please select a date that gives enough advance notice to participants.";
          } else if (specificError.includes("must be on or after start date")) {
            errorMessage +=
              "\n\n💡 Tip: Please ensure the end date is the same day or after the start date.";
          } else if (specificError.includes("must be in the future")) {
            errorMessage +=
              "\n\n💡 Tip: Please select a date that is in the future.";
          }
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAffectedParticipants = () => {
    return checkboxes.newDates ||
      checkboxes.offerRefund ||
      checkboxes.sendNotification
      ? Math.floor(Math.random() * 50) + 10
      : 0; // Random number for demo
  };

  return (
    <>
      <div className="p-4">
        {/* Main orange border card - full width */}
        <div className="bg-white rounded-2xl border border-[#FF6B35] p-6 w-full">
          {/* Middle card with light border - not full width, aligned left */}
          <div className="bg-white rounded-xl border border-[#FF6B35]/30 p-6 max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-[#FF6B35]">
                Event Management
              </h3>
            </div>

            {/* Inner card with full orange border */}
            <div className="bg-white border border-[#FF6B35] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-gray-900 mb-1">
                  Postpone Event
                </div>
                <div className="text-sm text-gray-600">
                  Reschedule the event to a new date
                </div>
              </div>
              <button
                onClick={handlePostponeClick}
                className="px-4 py-1 text-sm font-medium text-[#FF6B35] bg-[#FF6B35]/10 border border-[#FF6B35] rounded-md hover:bg-[#FF6B35] hover:text-white transition-colors flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                Postponed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B35]" />
                  <h2 className="text-lg font-semibold text-[#FF6B35]">
                    Postpone Event
                  </h2>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Postpone this event to a new date. Participants will be notified
                automatically.
              </p>

              {/* Policy Constraints Display */}
              {postponementOptions?.data && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Policy Constraints
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
                    <div>
                      • Minimum notice:{" "}
                      {postponementOptions.data.noticeRequired} days
                    </div>
                    <div>
                      • Max duration:{" "}
                      {postponementOptions.data.maxPostponementDuration} days
                    </div>
                    <div>
                      • Refund allowed:{" "}
                      {postponementOptions.data.offerRefundOnPostponement
                        ? "Yes"
                        : "No"}
                    </div>
                    <div>
                      • Max refund:{" "}
                      {postponementOptions.data.maxRefundPercentage}%
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 mb-1">
                        Unable to Postpone Event
                      </h4>
                      <div className="text-sm text-red-700 whitespace-pre-line leading-relaxed">
                        {error}
                      </div>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Reason Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Postponed *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={handleReasonChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-[#FF6B35]/5"
                  >
                    <option value="">Select reason</option>
                    <option value="venue">Venue unavailable</option>
                    <option value="speaker">Speaker scheduling conflict</option>
                    <option value="low-registration">
                      Low registration numbers
                    </option>
                    <option value="technical">Technical issues</option>
                    <option value="weather">
                      External factors (Weather, etc.)
                    </option>
                    <option value="force-majeure">Force majeure</option>
                    <option value="organizational">
                      Organizational changes
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.newDates}
                        onChange={() => handleCheckboxChange("newDates")}
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">
                        I have new dates for this event
                      </span>
                    </label>

                    {/* New dates fields */}
                    {checkboxes.newDates && (
                      <div className="mt-4 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="relative">
                            <input
                              type="datetime-local"
                              value={newEventData.startDate}
                              onChange={(e) =>
                                handleNewEventDataChange(
                                  "startDate",
                                  e.target.value
                                )
                              }
                              placeholder="dd-mm-yyyy"
                              className="w-full px-3 py-3 pr-10 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New Start Date & Time *
                            </label>
                            <Calendar className="absolute right-3 top-3 w-4 h-4 text-[#FF6B35] pointer-events-none" />
                          </div>
                          <div className="relative">
                            <input
                              type="datetime-local"
                              value={newEventData.endDate}
                              onChange={(e) =>
                                handleNewEventDataChange(
                                  "endDate",
                                  e.target.value
                                )
                              }
                              placeholder="dd-mm-yyyy"
                              className="w-full px-3 py-3 pr-10 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New End Date & Time *
                            </label>
                            <Calendar className="absolute right-3 top-3 w-4 h-4 text-[#FF6B35] pointer-events-none" />
                          </div>
                        </div>

                        {/* Helper text for datetime inputs */}
                        <div className="mt-2 text-xs text-gray-600">
                          💡 <strong>Tip:</strong> Click on the date field and
                          select both date AND time. Make sure to set a specific
                          time, not just the date.
                        </div>

                        {/* Policy reminders */}
                        {postponementOptions?.data && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Policy Reminders:</strong>
                            <ul className="mt-1 space-y-1">
                              <li>
                                • Minimum notice:{" "}
                                {postponementOptions.data.noticeRequired} days
                                from today
                              </li>
                              <li>
                                • Maximum postponement:{" "}
                                {
                                  postponementOptions.data
                                    .maxPostponementDuration
                                }{" "}
                                days from today
                              </li>
                              <li>
                                • End date must be same day or after start date
                              </li>
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter"
                              value={newEventData.location}
                              onChange={(e) =>
                                handleNewEventDataChange(
                                  "location",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              New Location
                            </label>
                          </div>
                          <div className="relative">
                            <select
                              value={newMeetingData.meetingPlatform}
                              onChange={(e) =>
                                handleNewMeetingDataChange(
                                  "meetingPlatform",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            >
                              <option value="">Select Platform</option>
                              <option value="Zoom">Zoom</option>
                              <option value="Google Meet">Google Meet</option>
                              <option value="Microsoft Teams">
                                Microsoft Teams
                              </option>
                              <option value="Cisco Webex">Cisco Webex</option>
                              <option value="GoTo Meeting">GoTo Meeting</option>
                              <option value="Other">Other</option>
                            </select>
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              Meeting Platform
                            </label>
                          </div>
                        </div>

                        {/* Meeting Details Row */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter meeting link"
                              value={newMeetingData.meetingLink}
                              onChange={(e) =>
                                handleNewMeetingDataChange(
                                  "meetingLink",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              Meeting Link
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter meeting ID"
                              value={newMeetingData.meetingId}
                              onChange={(e) =>
                                handleNewMeetingDataChange(
                                  "meetingId",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              Meeting ID
                            </label>
                          </div>
                        </div>

                        {/* Passcode and Instructions Row */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter passcode"
                              value={newMeetingData.passcode}
                              onChange={(e) =>
                                handleNewMeetingDataChange(
                                  "passcode",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              Passcode
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter instructions"
                              value={newMeetingData.participantInstructions}
                              onChange={(e) =>
                                handleNewMeetingDataChange(
                                  "participantInstructions",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-3 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-white"
                            />
                            <label className="absolute -top-2 left-3 px-2 text-xs font-medium text-[#FF6B35] bg-white">
                              Instructions
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.offerRefund}
                        onChange={() => handleCheckboxChange("offerRefund")}
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">
                        Offer refund to participants
                      </span>
                    </label>

                    {/* Refund policy field */}
                    {checkboxes.offerRefund && (
                      <div className="mt-4 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Refund Percentage
                        </label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={
                              postponementOptions?.data?.maxRefundPercentage ||
                              100
                            }
                            value={refundPercentage}
                            onChange={(e) =>
                              setRefundPercentage(Number(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>0%</span>
                            <span className="font-medium text-[#FF6B35]">
                              {refundPercentage}%
                            </span>
                            <span>
                              {postponementOptions?.data?.maxRefundPercentage ||
                                100}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkboxes.sendNotification}
                        onChange={() =>
                          handleCheckboxChange("sendNotification")
                        }
                        className="mt-0.5 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] accent-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">
                        Send notification to all participants
                      </span>
                    </label>

                    {/* Custom message field */}
                    {checkboxes.sendNotification && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[#FF6B35] mb-2">
                          Custom Message (optional)
                        </label>
                        <textarea
                          placeholder="Add personal Message"
                          rows={4}
                          className="w-full px-3 py-2 border border-[#FF6B35] rounded-md focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-sm bg-[#FF6B35]/10 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-medium text-[#FF6B35] mb-2">
                    Postponement Summary
                  </h4>
                  <ul className="space-y-1 text-sm text-[#FF6B35]">
                    <li>• Event will be marked as &quot;Postponed&quot;</li>
                    <li>
                      • {getAffectedParticipants()} participants will be
                      affected
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-[#FF6B35] text-[#FF6B35] rounded-md hover:bg-[#FF6B35]/5 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostponeEvent}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF6B35]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isLoading ? "Postponing..." : "Postpone Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Event Postponed Successfully! 🎉"
        message="Your event has been successfully postponed. All participants and speakers will be notified automatically."
        details={[
          {
            label: "New Start Date",
            value: postponementResult?.newDates?.startDate
              ? new Date(
                  postponementResult.newDates.startDate
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Not specified",
          },
          {
            label: "New End Date",
            value: postponementResult?.newDates?.endDate
              ? new Date(
                  postponementResult.newDates.endDate
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Not specified",
          },
          {
            label: "Refund Offered",
            value: postponementResult?.refundOffered
              ? `${postponementResult.refundPercentage}% refund available`
              : "No refund offered",
          },
        ]}
        primaryAction={{
          label: "View Updated Event",
          onClick: () => {
            handleModalClose();
            // Navigate to event overview or refresh the page
            window.location.reload();
          },
          icon: <Eye className="w-4 h-4" />,
        }}
        secondaryAction={{
          label: "Notify Participants",
          onClick: () => {
            // Future: Open notification composer
            console.log("Open notification composer");
          },
          variant: "link",
        }}
      />
    </>
  );
};

export default Actions;
