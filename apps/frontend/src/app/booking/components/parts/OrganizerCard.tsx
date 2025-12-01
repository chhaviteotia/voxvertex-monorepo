"use client";

import React from "react";
import {
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import type { Booking } from "@/store/api/bookingApi";

interface OrganizerCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  onMessage?: (conversationId?: string) => void;
  isLoading?: boolean;
}

export default function OrganizerCard({
  booking,
  onAccept,
  onDecline,
  onViewDetails,
  onMessage,
  isLoading = false,
}: OrganizerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "negotiating":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "declined":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getProfileImageUrl = (profileImage: any) => {
    if (!profileImage) return null;
    if (typeof profileImage === "string") return profileImage;
    if (profileImage.data && profileImage.contentType) {
      const base64 = Array.isArray(profileImage.data)
        ? profileImage.data.toString()
        : String(profileImage.data ?? "");
      return `data:${profileImage.contentType};base64,${base64}`;
    }
    if (profileImage.url) return profileImage.url;
    return null;
  };

  const organizerImage = getProfileImageUrl(booking.organizer.profileImageUrl);
  const organizerInitials = `${booking.organizer.firstName?.[0] || ""}${
    booking.organizer.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="bg-white rounded-lg border-l-[6px] border-orange-300 border-r border-t border-b border-gray-200 p-4 shadow-sm">
      {/* Header with profile */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
          {organizerImage ? (
            <img
              src={organizerImage}
              alt={`${booking.organizer.firstName} ${booking.organizer.lastName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-white font-semibold text-lg ${
              organizerImage ? "hidden" : "flex"
            }`}
          >
            {organizerInitials}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {booking.organizer.firstName} {booking.organizer.lastName}
          </h3>
          <p className="text-sm text-gray-500">Organizer</p>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(booking.eventDetails.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-green-600">
            ₹
            {booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount.toLocaleString()}
          </span>
        </div>
        {booking.eventDetails.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{booking.eventDetails.location}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
          {booking.eventDetails.type}
        </span>
        {booking.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status === "pending" && "Pending"}
          {booking.status === "negotiating" && "Negotiating"}
          {booking.status === "accepted" && "Accepted"}
          {booking.status === "declined" && "Declined"}
          {booking.status === "cancelled" && "Cancelled"}
          {booking.status === "completed" && "Completed"}
        </span>
      </div>

      {/* Timestamp */}
      <div className="flex items-center text-xs text-gray-500 mb-4">
        <Clock className="w-3 h-3 mr-1" />
        <span>{getTimeAgo(booking.requestedAt)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col space-y-2">
        {booking.status === "pending" || booking.status === "negotiating" ? (
          <>
            <button
              onClick={() => onAccept?.(booking._id)}
              disabled={isLoading}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onDecline?.(booking._id)}
              disabled={isLoading}
              className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </button>
          </>
        ) : booking.status === "accepted" ? (
          <button
            onClick={() => onMessage?.(booking.conversationId?.toString())}
            className="w-full bg-[#FF6B35] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message</span>
          </button>
        ) : null}
        <button
          onClick={() => onViewDetails?.(booking._id)}
          className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
