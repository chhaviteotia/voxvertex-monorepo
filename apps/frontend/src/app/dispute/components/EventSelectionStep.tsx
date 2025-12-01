"use client";

import { useMemo } from "react";
import { useGetDisputeEligibleEventsQuery } from "@/store/api/eventApi";
import { useGetCurrentUserQuery } from "@/store/hooks";
import { DisputeFormData } from "../types/disputeTypes";

interface EventSelectionStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

export default function EventSelectionStep({
  formData,
  onFormDataUpdate,
}: EventSelectionStepProps) {
  // Get current user to check role
  const { data: currentUserData } = useGetCurrentUserQuery();
  const userRole = currentUserData?.user?.role;

  // Use dispute-eligible events endpoint
  const {
    data: eventsData,
    isLoading,
    isError,
  } = useGetDisputeEligibleEventsQuery(undefined, {
    skip: !userRole,
  });

  const events = useMemo(() => {
    const raw = eventsData?.data;
    if (!raw) return [] as any[];

    // The API returns events in data.events array
    if (Array.isArray(raw.events) && raw.events.length > 0) {
      return raw.events;
    }

    // Fallback for other response structures
    const upcoming = Array.isArray((raw as any).upcoming)
      ? (raw as any).upcoming
      : [];
    const past = Array.isArray((raw as any).past) ? (raw as any).past : [];

    return [...upcoming, ...past];
  }, [eventsData]);

  const handleSelectEvent = (event: any) => {
    onFormDataUpdate({
      eventName: event.eventName || event.title,
      eventId: event._id || event.id,
      eventDate: event.startDate || event.date,
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error fetching events. Please try again.</p>
      </div>
    );

  // Show appropriate message based on user role
  if (events.length === 0) {
    if (userRole === "organizer") {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No events found. Create an event first to file a dispute.
          </p>
        </div>
      );
    } else if (userRole === "speaker") {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No events found. You need to be confirmed as a speaker in an event
            to file a dispute.
          </p>
        </div>
      );
    } else if (userRole === "participant") {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No events found. You need to participate in an event to file a
            dispute.
          </p>
        </div>
      );
    } else {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No events available. Please ensure you are logged in with a valid
            role.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {events.map((event: any) => (
        <div
          key={event._id || event.id}
          onClick={() => handleSelectEvent(event)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            formData.eventId === (event._id || event.id)
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200 hover:border-orange-300"
          }`}
        >
          <h4 className="font-medium text-gray-900">
            {event.eventName || event.title}
          </h4>
          <p className="text-sm text-gray-500">
            {event.startDate || event.date
              ? new Date(event.startDate || event.date).toLocaleDateString()
              : "Date not available"}
          </p>
          {formData.eventId === (event._id || event.id) && (
            <div className="mt-2 flex items-center text-orange-600 text-sm font-medium">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Selected
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
