"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";
import { useGetOrganizerBookingsQuery } from "@/store/api/bookingApi";
import { useAuth } from "@/store/hooks";
import SpeakerCard from "./parts/SpeakerCard";
import type { Booking } from "@/store/api/bookingApi";

interface ConvertedSpeaker {
  id: string;
  name: string;
  expertise?: string;
  date: string;
  price: number;
  image: string;
  status: "In Progress" | "Confirmed" | "Declined";
  tags: string[];
  timeAgo: string;
  bookingId?: string;
  originalBooking?: Booking;
}

interface SpeakerManagementProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export default function SpeakerManagementPage({
  onTabChange,
}: SpeakerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();

  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useGetOrganizerBookingsQuery({}, { skip: !isAuthenticated });

  const handleAddSpeaker = () => {
    // Navigate to add speaker page or open modal
    console.log("Navigate to add speaker page");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDetails = (bookingId: string) => {
    console.log("View details for booking:", bookingId);
    // TODO: Navigate to booking details page
  };

  // Convert Booking to Speaker format
  const convertBookingToSpeaker = React.useCallback(
    (booking: Booking): ConvertedSpeaker => ({
      id: booking._id,
      name: `${booking.speaker.firstName} ${booking.speaker.lastName}`,
      expertise: booking.speaker.areaOfExpertise?.join(", ") || undefined,
      date: new Date(booking.eventDetails.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      price:
        booking.compensationAndArrangements.primaryCompensation
          .speakerFeeAmount,
      image: booking.speaker.profileImageUrl || "",
      status: getDisplayStatus(booking.status),
      tags: [booking.eventDetails.type, ...(booking.tags || [])],
      timeAgo: booking.timeAgo || "Just now",
      bookingId: booking.bookingId,
      originalBooking: booking,
    }),
    []
  );

  const getDisplayStatus = (
    status: string
  ): "In Progress" | "Confirmed" | "Declined" => {
    switch (status) {
      case "pending":
      case "negotiating":
        return "In Progress";
      case "accepted":
        return "Confirmed";
      case "declined":
      case "cancelled":
        return "Declined";
      default:
        return "In Progress";
    }
  };

  // Get speakers from API data
  const speakers = useMemo(() => {
    if (!bookingsData?.data?.bookings) return [];

    const allBookings = [
      ...bookingsData.data.bookings.inProgress.map(convertBookingToSpeaker),
      ...bookingsData.data.bookings.confirmed.map(convertBookingToSpeaker),
      ...bookingsData.data.bookings.declined.map(convertBookingToSpeaker),
    ];

    return allBookings;
  }, [bookingsData, convertBookingToSpeaker]);

  const getStatusConfig = (
    status: "In Progress" | "Confirmed" | "Declined"
  ) => {
    switch (status) {
      case "In Progress":
        return {
          bgColor: "bg-[#42A4FF]/10",
          borderColor: "border-[#42A4FF]",
          textColor: "text-[#42A4FF]",
          badgeColor: "bg-[#FF6B35]",
        };
      case "Confirmed":
        return {
          bgColor: "bg-[#15823B]/10",
          borderColor: "border-[#15823B]",
          textColor: "text-[#15823B]",
          badgeColor: "bg-[#FF6B35]",
        };
      case "Declined":
        return {
          bgColor: "bg-[#DC2626]/10",
          borderColor: "border-[#DC2626]",
          textColor: "text-[#DC2626]",
          badgeColor: "bg-[#FF6B35]",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          borderColor: "border-gray-300",
          textColor: "text-gray-600",
          badgeColor: "bg-gray-400",
        };
    }
  };

  const filteredSpeakers = speakers.filter((speaker) => {
    const matchesSearch =
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.expertise || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedSpeakers = {
    "In Progress": filteredSpeakers.filter((s) => s.status === "In Progress"),
    Confirmed: filteredSpeakers.filter((s) => s.status === "Confirmed"),
    Declined: filteredSpeakers.filter((s) => s.status === "Declined"),
  };

  // Calculate stats from grouped speakers if API doesn't provide them
  const stats = bookingsData?.data?.counts || {
    inProgress: groupedSpeakers["In Progress"]?.length || 0,
    confirmed: groupedSpeakers.Confirmed?.length || 0,
    declined: groupedSpeakers.Declined?.length || 0,
    total: speakers.length || 0,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-32">
          <div className="p-6">
            <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                Speaker Management
              </h1>
              <p className="text-white">
                Manage your speakers, bookings, and payments in one place
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mt-4 min-h-[calc(100vh-280px)] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mx-auto mb-4" />
                <p className="text-gray-600">Loading speaker bookings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage =
      (error as { data?: { message?: string } })?.data?.message ||
      (typeof error === "string" ? error : "Failed to load speaker bookings");
    return (
      <div className="min-h-screen bg-white">
        <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-32">
          <div className="p-6">
            <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                Speaker Management
              </h1>
              <p className="text-white">
                Manage your speakers, bookings, and payments in one place
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)] flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{String(errorMessage)}</p>
                <button
                  onClick={handleRefresh}
                  className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium mx-auto"
                >
                  <RefreshCw size={16} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-32">
        <div className="pb-6">
          {/* Orange Header Card */}
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md">
            <h1 className="text-2xl font-bold text-black mb-2">
              Speaker Management
            </h1>
            <p className="text-white">
              Manage your speakers, bookings, and payments in one place
            </p>
          </div>

          {/* Navigation Tabs - Full Width */}
          <div className="bg-gray-50 p-1 rounded-lg mt-4 mb-6 flex">
            <button
              onClick={() => onTabChange?.("Speaker Database")}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Speaker Database
            </button>
            <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
              Speaker Management
            </button>
            <button
              onClick={() => onTabChange?.("Documents")}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Documents
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mt-4 min-h-[calc(100vh-280px)]">
            {/* Header with Add Speaker Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Speaker Management
                </h2>
                <p className="text-gray-600 text-sm">
                  {stats
                    ? `${stats.total} total bookings • ${stats.inProgress} in progress • ${stats.confirmed} confirmed • ${stats.declined} declined`
                    : "Manage your speaker relationships and bookings"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  className="text-gray-600 hover:text-[#FF6B35] p-2 rounded-lg hover:bg-gray-100"
                  title="Refresh data"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={handleAddSpeaker}
                  className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium"
                >
                  <Plus size={16} />
                  <span>Add Speaker</span>
                </button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(groupedSpeakers).map(([status, speakers]) => {
                const statusConfig = getStatusConfig(
                  status as "In Progress" | "Confirmed" | "Declined"
                );
                return (
                  <div key={status} className="flex flex-col self-start h-fit">
                    {/* Column Header */}
                    <div
                      className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-t-md p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold ${statusConfig.textColor}`}
                        >
                          {status}{" "}
                        </h3>
                        <span
                          className={`${statusConfig.badgeColor} text-white text-xs px-2 py-1 rounded-full font-medium`}
                        >
                          {speakers.length}
                        </span>
                      </div>
                    </div>

                    {/* Speaker Cards - Stretch to bottom with minimum height */}
                    <div
                      className={`${statusConfig.bgColor} ${statusConfig.borderColor} border border-t-0 rounded-b-xl p-4 space-y-4 min-h-[200px]`}
                    >
                      {speakers.length > 0 ? (
                        speakers.map((speaker) => (
                          <SpeakerCard
                            key={speaker.id}
                            speaker={speaker}
                            showAttachButton={status === "Confirmed"}
                            onViewDetails={handleViewDetails}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <User size={24} className="text-gray-400" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            No{" "}
                            {typeof status === "string"
                              ? status.toLowerCase()
                              : status}{" "}
                            speakers
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {status === "In Progress" &&
                              "No speakers are currently being processed"}
                            {status === "Confirmed" &&
                              "No speakers have been confirmed yet"}
                            {status === "Declined" &&
                              "No speakers have been declined"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
