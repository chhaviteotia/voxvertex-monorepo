"use client";

import { useState } from "react";
import { Search, Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import {
  useGetAllEventsQuery,
  useGetUpcomingEventsQuery,
} from "@/store/api/eventApi";
import type { Event } from "@/types/event";

/**
 * Participant Events Page
 * Shows all published events for participants to browse
 */
export default function ParticipantEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "upcoming">("all");
  const [page, setPage] = useState(1);

  // Get events based on view mode
  const { data: allEventsData, isLoading: isLoadingAll } = useGetAllEventsQuery(
    viewMode === "all"
      ? {
          search: searchTerm || undefined,
          page,
          limit: 12,
        }
      : { skip: true }
  );

  const { data: upcomingEventsData, isLoading: isLoadingUpcoming } =
    useGetUpcomingEventsQuery(
      viewMode === "upcoming"
        ? {
            search: searchTerm || undefined,
            page,
            limit: 12,
          }
        : { skip: true }
    );

  const isLoading = viewMode === "all" ? isLoadingAll : isLoadingUpcoming;
  const eventsData = viewMode === "all" ? allEventsData : upcomingEventsData;

  const events: Event[] = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <main className="flex-1 p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
          <div>
            <h1 className="text-xl font-bold text-black">Discover Events</h1>
            <p className="text-white text-sm">
              Explore and register for exciting events
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
          <button
            onClick={() => {
              setViewMode("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition ${
              viewMode === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => {
              setViewMode("upcoming");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition ${
              viewMode === "upcoming"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming Events
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-9 border border-orange-200 rounded-md py-2 focus:ring-2 focus:ring-orange-300 outline-none"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg text-orange-400 font-semibold">
              {viewMode === "upcoming" ? "Upcoming Events" : "All Events"}
            </h2>
            <span className="px-3 py-1 text-sm text-orange-500 border border-orange-300 rounded-full">
              {pagination.totalEvents} Events
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {event.bannerImage && (
                    <img
                      src={event.bannerImage}
                      alt={event.eventName}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.eventName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="capitalize px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {event.eventMode}
                        </span>
                      </div>
                      {event.ticketTypes && event.ticketTypes.length > 0 && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Tickets from ₹
                          {Math.min(...event.ticketTypes.map((t) => t.price))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-md border ${
                  !pagination.hasPrevPage
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-orange-50 border-orange-300"
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 rounded-md border bg-white flex items-center">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-md border ${
                  !pagination.hasNextPage
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-orange-50 border-orange-300"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
