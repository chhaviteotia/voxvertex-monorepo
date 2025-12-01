import React from "react";
import { Calendar, Star, CheckCircle, XCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Event } from "@/types/event";

interface SpeakerEventCardProps {
  event: Event;
  onOpenFeedback?: (event: Event) => void;
  onOpenSettlement?: (event: Event) => void;
  onOpenNegotiate?: (event: Event) => void;
  onCancelEvent?: (event: Event) => void;
}

export default function SpeakerEventCard({
  event,
  onOpenFeedback,
  onOpenSettlement,
  onOpenNegotiate,
  onCancelEvent,
}: SpeakerEventCardProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
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

  // Determine event status for speaker view
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  let normalizedStatus: string = "Upcoming";

  if (event.status === "cancelled") {
    normalizedStatus = "Cancelled";
  } else if (event.status === "postponed") {
    normalizedStatus = "Postponed";
  } else if (endDate < now && event.status === "published") {
    normalizedStatus = "Completed";
  } else if (startDate > now && event.status === "published") {
    normalizedStatus = "Upcoming";
  }

  // Get speaker booking info if available from platformSpeakers
  const getSpeakerBookingInfo = () => {
    if (
      event.speakers?.platformSpeakers &&
      event.speakers.platformSpeakers.length > 0
    ) {
      // Find the speaker's booking - this would be enhanced with actual user ID matching
      const booking = event.speakers.platformSpeakers[0];
      return booking;
    }
    return null;
  };

  const bookingInfo = getSpeakerBookingInfo();

  return (
    <div className="bg-white border border-[#FF6B35] rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {event.eventName}
      </h3>

      <div className="space-y-3 mb-6">
        <p className="text-gray-600 text-sm">Organizer: {getOrganizerName()}</p>

        <div className="flex items-center text-sm gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.startDate)}</span>
        </div>

        {/* Amount display - will show booking amount when booking data is integrated */}
        <p className="text-[#FF6B35] text-md font-medium">Event Engagement</p>

        {normalizedStatus === "Completed" ? (
          <div className="flex items-center justify-between">
            <StatusBadge status={normalizedStatus} />
            {/* Rating will be shown here when feedback/rating system is integrated */}
          </div>
        ) : (
          <StatusBadge status={normalizedStatus} />
        )}
      </div>

      {normalizedStatus === "Upcoming" && (
        <div className="space-y-3">
          <Link
            href={`/events/${event._id}`}
            className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Complete & Review
          </Link>

          {onCancelEvent && (
            <button
              onClick={() => onCancelEvent(event)}
              className="w-full bg-white hover:bg-orange-50 text-[#FF6B35] border border-[#FF6B35] font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Cancel Event
            </button>
          )}
        </div>
      )}

      {normalizedStatus === "Completed" && (
        <div className="flex items-center gap-2 text-green-600 justify-center py-3">
          <span className="text-lg">✓</span>
          <span className="font-medium">Event completed</span>
        </div>
      )}

      {normalizedStatus === "Cancelled" && (
        <div className="space-y-3">
          {onOpenSettlement && (
            <button
              onClick={() => onOpenSettlement(event)}
              className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Propose Settlement
            </button>
          )}
        </div>
      )}

      {normalizedStatus === "Postponed" && (
        <div className="space-y-3">
          <Link
            href={`/events/${event._id}`}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-[#FF6B35]/50 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            View Details
          </Link>
        </div>
      )}
    </div>
  );
}
