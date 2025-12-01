import React from "react";
import { Calendar, Monitor } from "lucide-react";

interface CoreDetailsStepProps {
  formData: {
    eventName: string;
    startDate: string;
    endDate: string;
    eventMode: "offline" | "online" | "hybrid";
    format: string;
    location: string;
    // Online Event Platform fields
    meetingPlatform?: string;
    meetingLink?: string;
    meetingId?: string;
    passcode?: string;
    dialInNumbers?: string;
    participantInstructions?: string;
  };
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export default function CoreDetailsStep({
  formData,
  onInputChange,
}: CoreDetailsStepProps) {
  const formatOptions = [
    "Conferences & Summits",
    "Seminars",
    "Keynote Speeches",
    "Fireside Chats",
    "Town Halls & Open Forums",
    "Leadership Retreats",
    "Networking Events",
    "Trade Shows & Expos",
    "Product Launches",
    "Sales Kick-Offs (SKOs)",
    "Award Ceremonies & Galas",
    "Workshops & Masterclasses",
    "Corporate Training",
    "Guest Lectures",
    "TED-Style Talks",
    "1:1 Sessions",
    "Mentorship Session",
    "Pitch Competitions & Startup Showcases",
    "Hackathons & Innovations Jams",
    "Charity & Fundraising Events",
  ];

  const meetingPlatformOptions = [
    "Zoom",
    "Google Meet",
    "Microsoft Teams",
    "Cisco Webex",
    "GoToMeeting",
    "Other Platform",
  ];

  // Check if Zoom is selected to show Meeting ID and Passcode fields
  const isZoomSelected = formData.meetingPlatform === "Zoom";

  return (
    <div className="w-full bg-white rounded-lg p-8">
      <div className="w-full space-y-8">
        {/* Event Title */}
        <div className="relative">
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white peer"
            placeholder="Enter event name"
            suppressHydrationWarning
          />
          <label
            htmlFor="eventName"
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
            style={{ color: "#FF6B35" }}
          >
            Event Title *
          </label>
        </div>

        {/* Start Date and End Date */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full">
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              suppressHydrationWarning
            />
            <label
              htmlFor="startDate"
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
              style={{ color: "#FF6B35" }}
            >
              Start Date *
            </label>
            <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="relative w-full">
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              suppressHydrationWarning
            />
            <label
              htmlFor="endDate"
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
              style={{ color: "#FF6B35" }}
            >
              End Date *
            </label>
            <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Event Mode */}
        <div className="relative w-full">
          <select
            name="eventMode"
            value={formData.eventMode}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white appearance-none"
            suppressHydrationWarning
          >
            <option value="">Choose</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <label
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
            style={{ color: "#FF6B35" }}
          >
            Event Mode *
          </label>
          <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Format */}
        <div className="relative w-full">
          <select
            id="format"
            name="format"
            value={formData.format}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white appearance-none"
            suppressHydrationWarning
          >
            <option value="">Choose</option>
            {formatOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label
            htmlFor="format"
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
            style={{ color: "#FF6B35" }}
          >
            Format *
          </label>
          <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Dynamic Location/URL fields based on Event Mode */}
        {formData.eventMode === "offline" && (
          <div className="relative w-full">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
              placeholder="Enter event location"
              suppressHydrationWarning
            />
            <label
              htmlFor="location"
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
              style={{ color: "#FF6B35" }}
            >
              Location *
            </label>
          </div>
        )}

        {formData.eventMode === "hybrid" && (
          <div className="relative w-full">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
              placeholder="Enter event location"
              suppressHydrationWarning
            />
            <label
              htmlFor="location"
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
              style={{ color: "#FF6B35" }}
            >
              Location *
            </label>
          </div>
        )}

        {/* Online Event Platform Section - Show for online and hybrid events */}
        {(formData.eventMode === "online" ||
          formData.eventMode === "hybrid") && (
          <div className="w-full space-y-6 border-t border-gray-200 pt-8">
            {/* Section Header */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-semibold text-[#FF6B35]">
                Online Event Platform
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Configure the online meeting platform and provide details that
              participants will need to join.
            </p>

            {/* Meeting Platform */}
            <div className="relative w-full">
              <select
                name="meetingPlatform"
                value={formData.meetingPlatform || ""}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white appearance-none"
                suppressHydrationWarning
              >
                <option value="">Select platform</option>
                {meetingPlatformOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label
                className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none"
                style={{ color: "#FF6B35" }}
              >
                Meeting Platform *
              </label>
              <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="relative w-full">
              <div className="flex items-center space-x-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <label
                  htmlFor="meetingLink"
                  className="text-sm font-medium"
                  style={{ color: "#FF6B35" }}
                >
                  Meeting Link *
                </label>
              </div>
              <input
                type="url"
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink || ""}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
                placeholder="https://zoom.us/j/123456789..."
                suppressHydrationWarning
              />
            </div>

            {/* Meeting ID and Passcode - Always visible for online/hybrid, required only for Zoom */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative w-full">
                <div className="flex items-center space-x-2 mb-1">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <label
                    htmlFor="meetingId"
                    className="text-sm font-medium"
                    style={{ color: "#FF6B35" }}
                  >
                    Meeting ID {isZoomSelected ? "*" : "(Optional)"}
                  </label>
                </div>
                <input
                  type="text"
                  id="meetingId"
                  name="meetingId"
                  value={formData.meetingId || ""}
                  onChange={onInputChange}
                  required={isZoomSelected}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
                  placeholder={
                    isZoomSelected
                      ? "123 456 789"
                      : "Enter meeting ID (if applicable)"
                  }
                  suppressHydrationWarning
                />
              </div>
              <div className="relative w-full">
                <div className="flex items-center space-x-2 mb-1">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <label
                    htmlFor="passcode"
                    className="text-sm font-medium"
                    style={{ color: "#FF6B35" }}
                  >
                    Passcode / Password {isZoomSelected ? "*" : "(Optional)"}
                  </label>
                </div>
                <input
                  type="text"
                  id="passcode"
                  name="passcode"
                  value={formData.passcode || ""}
                  onChange={onInputChange}
                  required={isZoomSelected}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
                  placeholder={
                    isZoomSelected
                      ? "Enter meeting passcode"
                      : "Enter passcode (if applicable)"
                  }
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Dial-in Numbers */}
            <div className="relative w-full">
              <div className="flex items-center space-x-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <label
                  htmlFor="dialInNumbers"
                  className="text-sm font-medium"
                  style={{ color: "#FF6B35" }}
                >
                  Dial-in Numbers (Optional)
                </label>
              </div>
              <textarea
                id="dialInNumbers"
                name="dialInNumbers"
                value={formData.dialInNumbers || ""}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white resize-none"
                placeholder="Enter phone numbers for audio dial-in (one per line)"
                suppressHydrationWarning
              />
            </div>

            {/* Instructions for Participants */}
            <div className="relative w-full">
              <div className="flex items-center space-x-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <label
                  htmlFor="participantInstructions"
                  className="text-sm font-medium"
                  style={{ color: "#FF6B35" }}
                >
                  Instructions for Participants
                </label>
              </div>
              <textarea
                id="participantInstructions"
                name="participantInstructions"
                value={formData.participantInstructions || ""}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white resize-none"
                placeholder="Add any special instructions for joining (e.g., download the app first, test your audio/video, etc.)"
                suppressHydrationWarning
              />
            </div>

            {/* Info Box for Organizers */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    For Organizers
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    These details will be sent to participants in their
                    confirmation email and displayed on their event ticket. Make
                    sure all information is accurate and test your meeting link
                    before the event.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
