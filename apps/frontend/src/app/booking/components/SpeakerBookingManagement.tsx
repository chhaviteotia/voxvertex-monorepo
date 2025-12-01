"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetSpeakerBookingsQuery,
  useAcceptBookingMutation,
  useDeclineBookingMutation,
  type Booking,
} from "@/store/api/bookingApi";
import { useAuth } from "@/store/hooks";
import OrganizerCard from "./parts/OrganizerCard";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

interface SpeakerBookingManagementProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export default function SpeakerBookingManagement({
  onTabChange,
}: SpeakerBookingManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();

  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useGetSpeakerBookingsQuery({}, { skip: !isAuthenticated });

  const [acceptBooking, { isLoading: isAccepting }] =
    useAcceptBookingMutation();
  const [declineBooking, { isLoading: isDeclining }] =
    useDeclineBookingMutation();

  const handleRefresh = () => {
    refetch();
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await acceptBooking(bookingId).unwrap();
      console.log("Booking accepted successfully");
    } catch (error) {
      console.error("Failed to accept booking:", error);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await declineBooking({ id: bookingId }).unwrap();
      console.log("Booking declined successfully");
    } catch (error) {
      console.error("Failed to decline booking:", error);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    console.log("View details for booking:", bookingId);
    // TODO: Navigate to booking details page
  };

  const handleMessage = (conversationId?: string) => {
    console.log("Navigate to conversation:", conversationId);
    // TODO: Navigate to messages
  };

  // Extract data from API response
  const bookings = bookingsData?.data?.bookings || {
    pending: [],
    accepted: [],
    declined: [],
  };

  const counts = bookingsData?.data?.counts || {
    pending: 0,
    accepted: 0,
    declined: 0,
    total: 0,
  };

  // Filter bookings by search term
  const filteredBookings = {
    pending: bookings.pending.filter((booking: Booking) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.organizer.firstName.toLowerCase().includes(searchLower) ||
        booking.organizer.lastName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.eventName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.type.toLowerCase().includes(searchLower)
      );
    }),
    accepted: bookings.accepted.filter((booking: Booking) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.organizer.firstName.toLowerCase().includes(searchLower) ||
        booking.organizer.lastName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.eventName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.type.toLowerCase().includes(searchLower)
      );
    }),
    declined: bookings.declined.filter((booking: Booking) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.organizer.firstName.toLowerCase().includes(searchLower) ||
        booking.organizer.lastName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.eventName.toLowerCase().includes(searchLower) ||
        booking.eventDetails.type.toLowerCase().includes(searchLower)
      );
    }),
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${contentWrapperClasses} flex-1 bg-gray-50 pb-12`}>
        <main className="flex-1 p-0">
          <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg p-6 mb-8">
            <h1 className="text-xl font-bold text-black mb-2">
              Booking Management
            </h1>
            <p className="text-white text-sm">
              Manage your speaking opportunities and organizer proposals
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mx-auto mb-4" />
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${contentWrapperClasses} flex-1 bg-gray-50 pb-12`}>
        <main className="flex-1 p-0">
          <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg p-6 mb-8">
            <h1 className="text-xl font-bold text-black mb-2">
              Booking Management
            </h1>
            <p className="text-white text-sm">
              Manage your speaking opportunities and organizer proposals
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)] flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load bookings</p>
              <button
                onClick={handleRefresh}
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium mx-auto"
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${contentWrapperClasses} flex-1 bg-gray-50 pb-12`}>
      <main className="flex-1 p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg p-6 mb-8">
          <h1 className="text-xl font-bold text-black mb-2">
            Booking Management
          </h1>
          <p className="text-white text-sm">
            Manage your speaking opportunities and organizer proposals
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
          <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
            Booking Management
          </button>
          <button
            onClick={() => onTabChange?.("Documents")}
            className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
          >
            Documents
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Booking Management
              </h2>
              <p className="text-gray-600 text-sm">
                {counts.total} total bookings • {counts.pending} pending •{" "}
                {counts.accepted} accepted • {counts.declined} declined
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-gray-600 hover:text-[#FF6B35] p-2 rounded-lg hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by organizer name or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
            />
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-3 gap-6">
            {/* Pending Column */}
            <div className="flex flex-col self-start h-fit">
              <div className="bg-orange-100 border-orange-200 border rounded-t-md p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-700">Pending</h3>
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full font-medium">
                    {filteredBookings.pending.length}
                  </span>
                </div>
              </div>
              <div className="bg-orange-100 border-orange-200 border border-t-0 rounded-b-xl p-4 space-y-4 min-h-[200px]">
                {filteredBookings.pending.length > 0 ? (
                  filteredBookings.pending.map((booking: Booking) => (
                    <OrganizerCard
                      key={booking._id}
                      booking={booking}
                      onAccept={handleAcceptBooking}
                      onDecline={handleDeclineBooking}
                      onViewDetails={handleViewDetails}
                      onMessage={handleMessage}
                      isLoading={isAccepting || isDeclining}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
                    <Clock className="w-12 h-12 text-gray-400 mb-3" />
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      No pending bookings
                    </h4>
                    <p className="text-xs text-gray-400">
                      New booking requests will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Accepted Column */}
            <div className="flex flex-col self-start h-fit">
              <div className="bg-green-100 border-green-200 border rounded-t-md p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-700">Accepted</h3>
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full font-medium">
                    {filteredBookings.accepted.length}
                  </span>
                </div>
              </div>
              <div className="bg-green-100 border-green-200 border border-t-0 rounded-b-xl p-4 space-y-4 min-h-[200px]">
                {filteredBookings.accepted.length > 0 ? (
                  filteredBookings.accepted.map((booking: Booking) => (
                    <OrganizerCard
                      key={booking._id}
                      booking={booking}
                      onViewDetails={handleViewDetails}
                      onMessage={handleMessage}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mb-3" />
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      No accepted bookings
                    </h4>
                    <p className="text-xs text-gray-400">
                      Accepted bookings will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Declined Column */}
            <div className="flex flex-col self-start h-fit">
              <div className="bg-red-100 border-red-200 border rounded-t-md p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-700">Declined</h3>
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full font-medium">
                    {filteredBookings.declined.length}
                  </span>
                </div>
              </div>
              <div className="bg-red-100 border-red-200 border border-t-0 rounded-b-xl p-4 space-y-4 min-h-[200px]">
                {filteredBookings.declined.length > 0 ? (
                  filteredBookings.declined.map((booking: Booking) => (
                    <OrganizerCard
                      key={booking._id}
                      booking={booking}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mb-3" />
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      No declined bookings
                    </h4>
                    <p className="text-xs text-gray-400">
                      Declined bookings will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
