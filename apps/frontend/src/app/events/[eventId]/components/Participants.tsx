"use client";

import React, { useState } from "react";
import { Mail, Calendar, X, ChevronDown } from "lucide-react";
// TODO: Add these API hooks when backend endpoints are ready
// import { useGetEventParticipantsQuery } from "@/store/api/eventApi";

interface ParticipantsProps {
  eventId: string;
}

const Participants: React.FC<ParticipantsProps> = ({ eventId }) => {
  // TODO: Replace with actual API hook when backend endpoint is ready
  // const {
  //   data: participantsData,
  //   isLoading: participantsLoading,
  //   error: participantsError,
  //   refetch: refetchParticipants,
  // } = useGetEventParticipantsQuery(eventId);

  // Placeholder data for now
  const participantsLoading = false;
  const participantsError = null;
  const participants: any[] = [];
  const totalParticipants = 0;
  const totalRegistrations = 0;

  const refetchParticipants = () => {
    // TODO: Implement when API is ready
    console.log("Refetching participants...");
  };

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    template: "Custom Message",
    subject: "",
    content: "",
    scheduleDate: "19-oct-2025",
    scheduleTime: "08:40 PM",
  });
  const [activeTab, setActiveTab] = useState<
    "compose" | "recipients" | "preview"
  >("compose");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<any[]>([]);

  const messageTemplates = {
    "Custom Message": {
      subject: "",
      content: "",
    },
    "Welcome Message": {
      subject: "Welcome to {{event_name}}!",
      content: `Dear {{participant_name}},

Thank you for registering for {{event_name}}! We're thrilled to have you join us.

Event Details:
📅 Date: {{event_date}}
📍 Location: {{event_location}}
🎫 Your Ticket: {{ticket_type}}

What's Next:
- You'll receive a confirmation email with your tickets
- Check out our event page for the latest updates
- Connect with other attendees on social media using #{{event_hashtag}}

If you have any questions, feel free to reach out to our team.

Best regards,
{{organizer_name}}`,
    },
    "Event Reminder": {
      subject: "Don't forget: {{event_name}} is coming up!",
      content: `Hi {{participant_name}},

Just a friendly reminder that {{event_name}} is happening soon!

📅 When: {{event_date}}
📍 Where: {{event_location}}
🕐 Time: {{event_time}}

Things to Remember:
- Bring a valid ID for check-in
- Arrive 30 minutes early for smooth registration
- Check our website for any last-minute updates

We can't wait to see you there!

Best,
{{organizer_name}}`,
    },
    "Event Postponement": {
      subject: "Important Update: {{event_name}} Postponed",
      content: `Dear {{participant_name}},

We regret to inform you that {{event_name}} has been postponed due to unforeseen circumstances.

Original Date: {{original_date}}
New Date: {{new_date}} (tentative)

What This Means for You:
- Your registration remains valid for the new date
- If you cannot attend the new date, full refunds are available
- We'll send updates as soon as we have confirmed details

We sincerely apologize for any inconvenience this may cause and appreciate your understanding.

To request a refund or if you have questions, please contact us at {{contact_email}}.

Thank you for your patience,
{{organizer_name}}`,
    },
    "General Update": {
      subject: "Update: {{event_name}}",
      content: `Hello {{participant_name}},

We have an important update regarding {{event_name}}.

{{update_content}}

For the most current information, please visit our event page or contact us directly.

Thank you,
{{organizer_name}}`,
    },
    "Thank You Message": {
      subject: "Thank you for attending {{event_name}}!",
      content: `Dear {{participant_name}},

Thank you for attending {{event_name}}! It was wonderful having you as part of our event.

We hope you:
- Made valuable connections
- Gained new insights
- Enjoyed the experience

What's Next:
- Event materials and recordings will be shared within 48 hours
- Connect with fellow attendees on our community platform
- Stay tuned for our next event announcements

Your feedback is valuable to us. Please take a moment to share your thoughts: {{feedback_link}}

Until next time!

{{organizer_name}}`,
    },
  };

  const handleComposeClick = () => {
    setShowMessageModal(true);
  };

  const handleModalClose = () => {
    setShowMessageModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setMessageForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateChange = (templateName: string) => {
    const template =
      messageTemplates[templateName as keyof typeof messageTemplates];
    setMessageForm((prev) => ({
      ...prev,
      template: templateName,
      subject: template.subject,
      content: template.content,
    }));
    setShowTemplateDropdown(false);
  };

  const handleTicketTypeChange = (ticketType: string) => {
    setSelectedTicketTypes((prev) => {
      if (prev.includes(ticketType)) {
        return prev.filter((type) => type !== ticketType);
      } else {
        return [...prev, ticketType];
      }
    });
  };

  const handleRecipientsChange = (value: string) => {
    setSelectedRecipients((prev) => {
      if (prev.includes(value)) {
        // If unchecking all-participants, also clear ticket type selections
        if (value === "all-participants") {
          setSelectedTicketTypes([]);
        }
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleScheduleMessage = () => {
    // Calculate total recipients based on real data
    let totalRecipients = 0;
    if (selectedRecipients.includes("all-participants")) {
      if (selectedTicketTypes.length > 0) {
        // Filter participants by selected ticket types
        const filteredParticipants = participants.filter((participant: any) =>
          selectedTicketTypes.includes(
            participant.ticketTier.toLowerCase().replace(" ", "-")
          )
        );
        totalRecipients += filteredParticipants.length;
      } else {
        totalRecipients += totalParticipants;
      }
    }
    if (selectedRecipients.includes("speakers")) {
      // Add speaker count (this would need to be fetched separately or included in event data)
      totalRecipients += 0; // Placeholder - would need actual speaker count
    }

    // Create new scheduled message
    const newMessage = {
      id: Date.now(),
      subject: messageForm.subject,
      content: messageForm.content,
      scheduleDate: messageForm.scheduleDate,
      scheduleTime: messageForm.scheduleTime,
      recipients: totalRecipients,
    };

    setScheduledMessages((prev) => [...prev, newMessage]);
    console.log("Scheduling message:", messageForm);
    setShowMessageModal(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Participants Card */}
        <div className="bg-white rounded-2xl border border-[#FF6B35] p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-[#FF6B35] text-sm font-medium">
                Participants ({totalParticipants})
              </h2>
              {participantsLoading && (
                <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <button
              onClick={() => refetchParticipants()}
              className="flex items-center gap-2 px-4 border border-[#FF6B35] text-[#FF6B35] rounded-lg text-xs hover:bg-orange-50 transition-colors"
              disabled={participantsLoading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {participantsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {participantsError ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-sm mb-2">
                Failed to load participants
              </div>
              <button
                onClick={() => refetchParticipants()}
                className="text-[#FF6B35] text-xs underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : participantsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm mb-2">No participants yet</p>
              <p className="text-gray-400 text-xs">
                Participants will appear here once they register for your event
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#FF6B35]/20">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-[#FF6B35]/10 rounded-t-lg">
                <div className="text-[#FF6B35] text-sm font-medium">Name</div>
                <div className="text-[#FF6B35] text-sm font-medium">
                  Ticket Type
                </div>
                <div className="text-[#FF6B35] text-sm font-medium">
                  Registration Date
                </div>
                <div className="text-[#FF6B35] text-sm font-medium">Status</div>
              </div>

              {/* Table Rows */}
              <div>
                {participants.map((participant: any, index: number) => (
                  <div
                    key={`${participant.registrationId}-${index}`}
                    className="grid grid-cols-4 gap-4 p-4 border-b border-[#FF6B35]/20 last:border-b-0"
                  >
                    <div className="text-xs text-gray-700">
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-gray-500">{participant.email}</div>
                    </div>
                    <div className="text-xs text-gray-700">
                      <div className="font-medium">
                        {participant.ticketTier}
                      </div>
                      {participant.isPrimaryRegistrant && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-700">
                      {new Date(
                        participant.registrationDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-700">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          participant.isRegisteredUser
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {participant.isRegisteredUser
                          ? "Registered User"
                          : "Guest"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Participant Communication Card */}
        <div className="bg-white rounded-2xl border border-[#FF6B35] p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#FF6B35]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h2 className="text-[#FF6B35] text-sm font-medium">
                Participant Communication
              </h2>
            </div>
            <button
              onClick={handleComposeClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-xs hover:bg-orange-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Compose Message
            </button>
          </div>

          {scheduledMessages.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm mb-2">No messages sent yet</p>
              <p className="text-gray-400 text-xs">
                Send your first message to participants above
              </p>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              {scheduledMessages.map((message) => (
                <div
                  key={message.id}
                  className="border border-[#FF6B35] rounded-lg p-4 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-900 font-medium text-sm">
                      {message.subject || "Untitled Message"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{message.recipients} recipients</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-2">
                    Scheduled for {message.scheduleDate}, {message.scheduleTime}
                  </p>
                  <p className="text-gray-700 text-xs">
                    {message.content
                      ? message.content.substring(0, 100) +
                        (message.content.length > 100 ? "..." : "")
                      : "No content"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Composition Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-[#FF6B35]/20"></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#FF6B35]">
                    Send Message to Participants
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Create and send messages to your event participants,
                    speakers, and team members.
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex mb-8">
                {(["compose", "recipients", "preview"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-6 rounded-full font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "bg-[#FF6B35] text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Compose Tab Content */}
              {activeTab === "compose" && (
                <div className="space-y-6">
                  {/* Message Template Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() =>
                        setShowTemplateDropdown(!showTemplateDropdown)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs cursor-pointer flex justify-between items-center"
                    >
                      <span>{messageForm.template}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          showTemplateDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                      Message Template
                    </label>

                    {/* Dropdown Options */}
                    {showTemplateDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {Object.keys(messageTemplates).map((templateName) => (
                          <div
                            key={templateName}
                            onClick={() => handleTemplateChange(templateName)}
                            className={`px-4 py-3 text-xs cursor-pointer hover:bg-[#FF6B35]/10 transition-colors ${
                              messageForm.template === templateName
                                ? "bg-[#FF6B35]/5 text-[#FF6B35]"
                                : "text-gray-700"
                            }`}
                          >
                            {templateName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="relative">
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Enter message subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs"
                    />
                    <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                      Subject
                    </label>
                  </div>

                  {/* Message Content */}
                  <div className="relative">
                    <textarea
                      value={messageForm.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      placeholder="Enter your message here..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs resize-none"
                    />
                    <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                      Message Content
                    </label>
                  </div>

                  {/* Schedule Send */}
                  <div className="relative">
                    <input
                      type="text"
                      value={`${messageForm.scheduleDate}  ${messageForm.scheduleTime}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parts = value.split("  ");
                        handleInputChange("scheduleDate", parts[0] || "");
                        handleInputChange("scheduleTime", parts[1] || "");
                      }}
                      className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#FF6B35] cursor-pointer hover:text-orange-600"
                      onClick={() => setShowCalendar(!showCalendar)}
                    />
                    <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                      Schedule Send (optional )
                    </label>

                    {/* Calendar Dropdown */}
                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                        <div className="text-center mb-3">
                          <h4 className="text-sm font-medium text-[#FF6B35] mb-2">
                            Select Date & Time
                          </h4>
                        </div>

                        {/* Date Input */}
                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={messageForm.scheduleDate
                              .split("-")
                              .reverse()
                              .join("-")}
                            onChange={(e) => {
                              const dateParts = e.target.value.split("-");
                              const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                              handleInputChange("scheduleDate", formattedDate);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none"
                          />
                        </div>

                        {/* Time Input */}
                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={messageForm.scheduleTime
                              .replace(" AM", "")
                              .replace(" PM", "")}
                            onChange={(e) => {
                              const time24 = e.target.value;
                              const [hours, minutes] = time24.split(":");
                              const hour12 =
                                parseInt(hours) > 12
                                  ? parseInt(hours) - 12
                                  : parseInt(hours);
                              const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
                              const formattedTime = `${hour12
                                .toString()
                                .padStart(2, "0")}:${minutes} ${ampm}`;
                              handleInputChange("scheduleTime", formattedTime);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowCalendar(false)}
                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setShowCalendar(false)}
                            className="px-3 py-1 text-xs bg-[#FF6B35] text-white rounded hover:bg-orange-600 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recipients Tab Content */}
              {activeTab === "recipients" && (
                <div className="space-y-6">
                  <h3 className="text-[#FF6B35] text-sm font-medium mb-6">
                    Select Recipients
                  </h3>

                  <div className="space-y-4">
                    {/* All Participants Option */}
                    <div
                      className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                        selectedRecipients.includes("all-participants")
                          ? "border-[#FF6B35] bg-[#FF6B35]/5"
                          : "border-gray-300 hover:border-[#FF6B35]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="all-participants"
                        name="recipients"
                        value="all-participants"
                        checked={selectedRecipients.includes(
                          "all-participants"
                        )}
                        onChange={(e) => handleRecipientsChange(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-2 rounded"
                      />
                      <label
                        htmlFor="all-participants"
                        className="ml-3 text-xs text-gray-900 font-medium"
                      >
                        All Participants ({totalParticipants})
                      </label>
                    </div>

                    {/* Ticket Type Filter - Only shown when All Participants is selected */}
                    {selectedRecipients.includes("all-participants") && (
                      <div className="ml-7 space-y-3">
                        <h4 className="text-[#FF6B35] text-sm font-medium">
                          Filter by ticket type:
                        </h4>

                        {/* Early Bird Ticket */}
                        <div className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-[#FF6B35] transition-colors">
                          <input
                            type="checkbox"
                            id="early-bird"
                            checked={selectedTicketTypes.includes("early-bird")}
                            onChange={() =>
                              handleTicketTypeChange("early-bird")
                            }
                            className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-2 rounded"
                          />
                          <label
                            htmlFor="early-bird"
                            className="ml-3 text-xs text-gray-900"
                          >
                            Early Bird (1)
                          </label>
                        </div>

                        {/* Regular Ticket */}
                        <div
                          className={`flex items-center p-3 border-2 rounded-lg transition-colors ${
                            selectedTicketTypes.includes("regular")
                              ? "border-[#FF6B35] bg-[#FF6B35]/5"
                              : "border-gray-300 hover:border-[#FF6B35]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id="regular"
                            checked={selectedTicketTypes.includes("regular")}
                            onChange={() => handleTicketTypeChange("regular")}
                            className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-2 rounded"
                          />
                          <label
                            htmlFor="regular"
                            className="ml-3 text-xs text-gray-900"
                          >
                            Regular (2)
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Speaker Option */}
                    <div
                      className={`flex items-center p-4 border rounded-lg transition-colors ${
                        selectedRecipients.includes("speakers")
                          ? "border-[#FF6B35] bg-[#FF6B35]/5"
                          : "border-gray-300 hover:border-[#FF6B35]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="speakers"
                        name="recipients"
                        value="speakers"
                        checked={selectedRecipients.includes("speakers")}
                        onChange={(e) => handleRecipientsChange(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35] focus:ring-2 rounded"
                      />
                      <label
                        htmlFor="speakers"
                        className="ml-3 text-xs text-gray-900"
                      >
                        Speaker (2)
                      </label>
                    </div>
                  </div>

                  {/* Total Recipients Summary */}
                  <div className="mt-8 p-4 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg flex justify-between items-center">
                    <span className="text-[#FF6B35] text-sm font-medium">
                      Total Recipients:
                    </span>
                    <span className="text-[#FF6B35] text-xl font-bold">
                      {(() => {
                        let total = 0;

                        // Count participants
                        if (selectedRecipients.includes("all-participants")) {
                          if (selectedTicketTypes.length > 0) {
                            // Filter participants by selected ticket types
                            const filteredParticipants = participants.filter(
                              (participant: any) =>
                                selectedTicketTypes.includes(
                                  participant.ticketTier
                                    .toLowerCase()
                                    .replace(" ", "-")
                                )
                            );
                            total += filteredParticipants.length;
                          } else {
                            // All participants if no specific ticket types selected
                            total += totalParticipants;
                          }
                        }

                        // Add speakers
                        if (selectedRecipients.includes("speakers")) {
                          // Placeholder - would need actual speaker count
                          total += 0;
                        }

                        return total;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {/* Preview Tab Content */}
              {activeTab === "preview" && (
                <div className="space-y-6">
                  {/* Preview Container */}
                  <div className="border-2 border-[#FF6B35] rounded-2xl p-8">
                    <div className="space-y-8">
                      {/* Subject Preview */}
                      <div>
                        <h4 className="text-sm text-gray-700 mb-4">Subject:</h4>
                        <div className="min-h-[30px] border-b-2 border-[#FF6B35] pb-2">
                          <p className="text-xs text-gray-900">
                            {messageForm.subject || ""}
                          </p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div>
                        <h4 className="text-sm text-gray-700 mb-4">Message:</h4>
                        <div className="min-h-[60px]">
                          <p className="text-xs text-gray-900 whitespace-pre-wrap">
                            {messageForm.content || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Note */}
                  <p className="text-xs text-gray-600">
                    * This preview shows how the message will appear with
                    variables replaced. Individual participant details will be
                    personalized for each recipient.
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={handleModalClose}
                  className="px-8 py-3 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleMessage}
                  className="px-8 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 transition-colors font-medium"
                >
                  Schedule Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Participants;
