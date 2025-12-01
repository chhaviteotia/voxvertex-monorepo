"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Video,
  ArrowLeft,
  Ticket,
  CheckCircle,
} from "lucide-react";
import { useGetEventByIdQuery } from "@/store/api/eventApi";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import type { Event } from "@/types/event";

interface EventTicket {
  _id?: string;
  name: string;
  price: number | string;
  quantity: number | string;
  features?: string[];
  discount?: any;
}

interface EventOrganizer {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

interface ParticipantViewProps {
  eventId: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getOrganizerInfo = (organizer: EventOrganizer | string | undefined) => {
  if (!organizer)
    return { name: "Unknown Organizer", email: "", profileImageUrl: "" };

  if (typeof organizer === "string") {
    return { name: organizer, email: "", profileImageUrl: "" };
  }

  return {
    name:
      `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
      "Unknown Organizer",
    email: organizer.email || "",
    profileImageUrl: organizer.profileImageUrl || "",
  };
};

export default function ParticipantView({ eventId }: ParticipantViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    data: eventResponse,
    isLoading,
    error,
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbf5] pb-6">
        <div className="bg-white border border-[#FF6B35]/20 rounded-xl shadow-sm w-full px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
          <div className="text-lg text-gray-600">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !eventResponse?.data) {
    return (
      <div className="min-h-screen bg-[#fffbf5] pb-6">
        <div className="bg-white border border-[#FF6B35]/20 rounded-xl shadow-sm w-full px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
          <div className="text-lg text-red-600">
            Error loading event details.
          </div>
        </div>
      </div>
    );
  }

  const event = eventResponse.data as Event;
  const organizerInfo = getOrganizerInfo(
    event.organizer as EventOrganizer | string | undefined
  );

  const getTicketPrice = (ticket: EventTicket): number => {
    if (typeof ticket.price === "string") {
      return parseFloat(ticket.price) || 0;
    }
    return ticket.price || 0;
  };

  const getRemainingTickets = (ticket: EventTicket): number => {
    const ticketQuantity =
      typeof ticket.quantity === "string"
        ? parseInt(ticket.quantity)
        : ticket.quantity;
    const ticketsSold = event.totalTicketsSold || 0;
    return Math.max(0, (ticketQuantity || 0) - ticketsSold);
  };

  const totalSold = event.totalTicketsSold || 0;
  const totalCapacity = event.totalCapacity || 0;
  const progressPercentage =
    totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  return (
    <div className="relative min-h-screen bg-[#fffbf5]">
      {/* Background cover */}
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-[#fffbf5] z-[99] pointer-events-none"></div>

      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
      />
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32">
        <div className="bg-white border border-[#FF6B35]/20 rounded-xl shadow-sm w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          {/* Event Banner */}
          {event.bannerImage && (
            <div className="h-72 sm:h-80 bg-gray-200 overflow-hidden rounded-xl mb-8">
              <img
                src={event.bannerImage}
                alt={event.eventName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Header */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {event.eventName}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center">
                  {organizerInfo.profileImageUrl ? (
                    <img
                      src={organizerInfo.profileImageUrl}
                      alt="Organizer"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold text-lg">
                        {organizerInfo.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {organizerInfo.name}
                    </h3>
                    {organizerInfo.email && (
                      <p className="text-gray-600">{organizerInfo.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Date & Time
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="mr-3 text-blue-600" size={20} />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="mr-3 text-blue-600" size={20} />
                    <span>
                      {formatTime(event.startDate)} -{" "}
                      {formatTime(event.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Location
                </h2>
                {event.eventMode === "online" ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Video className="mr-3 text-blue-500" size={20} />
                      <span>Online Event</span>
                    </div>
                    {event.eventUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">
                          Meeting Link:
                        </p>
                        <a
                          href={event.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {event.eventUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-3 text-green-600" size={20} />
                      <span className="font-medium">
                        {event.location || "Location to be announced"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Info with Progress Bar */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-3 text-purple-600" size={24} />
                  Registration Info
                </h2>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {totalSold}
                      </p>
                      <p className="text-gray-600 text-sm">Registered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {totalCapacity}
                      </p>
                      <p className="text-gray-600 text-sm">Capacity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Ticket Selection */}
            <div className="space-y-6">
              {/* Ticket Selection */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Ticket className="mr-3 text-orange-600" size={24} />
                  Select Tickets
                </h2>

                {/* Ticket Options */}
                <div className="space-y-4 mb-6">
                  {event.ticketTypes?.map(
                    (ticket: EventTicket, index: number) => (
                      <div
                        key={ticket._id || index}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTicket === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTicket(index)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {ticket.name}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              ₹{getTicketPrice(ticket)}
                            </p>
                          </div>
                          {selectedTicket === index && (
                            <CheckCircle className="text-blue-500" size={24} />
                          )}
                        </div>

                        {/* Ticket Features */}
                        {ticket.features && ticket.features.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {ticket.features.map(
                              (feature: string, featureIndex: number) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                  {feature}
                                </div>
                              )
                            )}
                          </div>
                        )}

                        <div className="mt-3 text-sm text-gray-500">
                          {getRemainingTickets(ticket)} tickets remaining
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>
                      ₹
                      {event.ticketTypes?.[selectedTicket]
                        ? getTicketPrice(event.ticketTypes[selectedTicket]) *
                          quantity
                        : 0}
                    </span>
                  </div>
                </div>

                {/* Register Button */}
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Register Now
                </button>

                <p className="text-center text-gray-500 text-sm mt-3">
                  Secure payment • Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
