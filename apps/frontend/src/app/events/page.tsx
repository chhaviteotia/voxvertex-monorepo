"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Plus,
  Eye,
  Trash2,
  ChevronDown,
  Loader2,
  Clock,
  Users,
  Video,
  Building,
  MapPin,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  useGetUserEventsQuery,
  useDeleteEventMutation,
} from "@/store/api/eventApi";
import { useGetAllEventsQuery } from "@/store/api/eventApi";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import type { Event } from "@/types/event";
import FilterBar from "./components/FilterBar";
import SpeakerEventCard from "./components/SpeakerEventCard";

/**
 * Events Page - Role-based UI matching old project
 * - Organizer: Card grid view with search/filter (events_page/page.tsx)
 * - Speaker: Filter bar with event cards (events_management/page.tsx)
 * - Participant: Tabs for Upcoming/Past with search (participant/events/page.tsx)
 */
export default function EventsPage() {
  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const role =
    (user?.role as string) ||
    (currentUserData?.user?.role as string) ||
    "participant";
  const isOrganizer = role === "organizer";
  const isSpeaker = role === "speaker";
  const isParticipant = role === "participant";

  // Speaker filter state
  const [activeFilter, setActiveFilter] = useState<string>("All Events");

  // Organizer/Participant filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Delete mutation
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  // Get events based on role
  const {
    data: eventsData,
    isLoading: isLoadingUserEvents,
    error: userEventsError,
    refetch: refetchEvents,
  } = useGetUserEventsQuery(
    {
      status:
        statusFilter === "All Statuses"
          ? undefined
          : statusFilter.toLowerCase(),
      page,
      limit: 100,
    },
    { skip: isParticipant }
  );

  const {
    data: allEventsData,
    isLoading: isLoadingAllEvents,
    error: allEventsError,
  } = useGetAllEventsQuery(
    {
      status: "published",
      page,
      limit: 50,
      sortBy: "startDate",
      sortOrder: "asc",
    },
    { skip: !isParticipant }
  );

  const isLoading = isLoadingUserEvents || isLoadingAllEvents;
  const error = userEventsError || allEventsError;
  const events: Event[] = isParticipant
    ? allEventsData?.data?.events || []
    : eventsData?.data?.events || [];

  // Organizer: Filter events
  const filteredEventsOrganizer = useMemo(() => {
    if (!isOrganizer) return [];
    return events.filter((event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm, isOrganizer]);

  // Speaker: Filter events by status
  const filteredEventsSpeaker = useMemo(() => {
    if (!isSpeaker) return [];

    if (activeFilter === "All Events") {
      return events;
    }

    const now = new Date();
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      switch (activeFilter) {
        case "Upcoming":
          return startDate > now && event.status === "published";
        case "Completed":
          return endDate < now && event.status === "published";
        case "Cancelled":
          return event.status === "cancelled";
        case "Postponed":
          return event.status === "postponed";
        default:
          return true;
      }
    });
  }, [events, activeFilter, isSpeaker]);

  // Participant: Filter and separate upcoming/past
  const isEventUpcoming = (startDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(startDate) >= today;
  };

  const isEventPast = (endDate: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(endDate) < today;
  };

  const upcomingEvents = useMemo(() => {
    if (!isParticipant) return [];
    return events.filter((event) => isEventUpcoming(event.startDate));
  }, [events, isParticipant]);

  const pastEvents = useMemo(() => {
    if (!isParticipant) return [];
    return events.filter((event) => isEventPast(event.endDate));
  }, [events, isParticipant]);

  const currentParticipantEvents =
    activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const filteredEventsParticipant = useMemo(() => {
    if (!isParticipant) return [];
    return currentParticipantEvents.filter(
      (event) =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentParticipantEvents, searchTerm, isParticipant]);

  // Helper functions
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateFull = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "postponed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "Published";
      case "draft":
        return "Draft";
      case "cancelled":
        return "Cancelled";
      case "postponed":
        return "Postponed";
      default:
        return status;
    }
  };

  const getLocationIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Video size={20} className="text-blue-500" />;
      case "offline":
        return <Building size={20} className="text-green-500" />;
      case "hybrid":
        return <MapPin size={20} className="text-purple-500" />;
      default:
        return <MapPin size={20} />;
    }
  };

  // Delete handlers
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation === "DELETE" && eventToDelete) {
      try {
        await deleteEvent(eventToDelete._id).unwrap();
        setShowDeleteModal(false);
        setEventToDelete(null);
        setDeleteConfirmation("");
        // Refetch events to update the list
        if (isOrganizer) {
          refetchEvents();
        }
      } catch (error) {
        console.error("Failed to delete event:", error);
        // Handle error (show toast notification, etc.)
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
    setDeleteConfirmation("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
          <p className="text-gray-600 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
          Error loading events. Please try again.
        </div>
      </div>
    );
  }

  // ===== ORGANIZER VIEW =====
  if (isOrganizer) {
    const stats = {
      total: events.length,
      draft: events.filter((e) => e.status === "draft").length,
      published: events.filter((e) => e.status === "published").length,
      cancelled: events.filter((e) => e.status === "cancelled").length,
    };

    return (
      <div className="relative min-h-screen bg-gray-50">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-[#FF6B35]/20 z-40"></div>
        )}
        <main className="flex-1 p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Event Management
              </h1>
              <p className="text-white mt-1">
                View, create, and manage all your events.
              </p>
            </div>
            <Link
              href="/events/create"
              className="bg-[#FF6B35] hover:bg-orange-600 text-white px-10 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Create Event</span>
            </Link>
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-[#FF6B35]/20 rounded-lg shadow-sm p-8 w-full">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center w-64">
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3 text-[#FF6B35] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search Events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className="relative w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 w-full focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  suppressHydrationWarning
                >
                  <option>All Statuses</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Postponed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Card Grid View */}
            {filteredEventsOrganizer.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEventsOrganizer.map((event) => {
                  const ticketsSold = event.totalTicketsSold || 0;
                  const totalCapacity = event.totalCapacity || 0;
                  const revenue = event.totalRevenue || 0;
                  const tags = event.tags?.slice(0, 3) || [];
                  const bannerImage =
                    event.bannerImage ||
                    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60";

                  return (
                    <div
                      key={event._id}
                      className="border border-orange-100 rounded-2xl shadow-sm overflow-hidden flex flex-col bg-gradient-to-br from-white to-orange-50"
                    >
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={bannerImage}
                          alt={event.eventName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.eventName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.startDate)} —{" "}
                              {formatDate(event.endDate)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {getStatusDisplayName(event.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Mode</p>
                            <p className="font-medium capitalize text-gray-900">
                              {event.eventMode}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Attendees</p>
                            <p className="font-medium text-gray-900">
                              {ticketsSold}/{totalCapacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {event.location || "TBA"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Revenue</p>
                            <p className="font-medium text-gray-900">
                              ₹{revenue.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-5 py-4 border-t border-orange-100 flex items-center gap-3">
                        <Link
                          href={`/events/${event._id}`}
                          className="flex-1 text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-[#FF6B35] hover:bg-orange-600 transition-colors"
                        >
                          View Event
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          disabled={isDeleting}
                          className="px-4 py-2 rounded-full border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "All Statuses"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first event."}
                </p>
                <Link
                  href="/events/create"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Create Your First Event</span>
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#FF6B35]">
                    Delete Event
                  </h2>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete &ldquo;
                  {eventToDelete?.eventName}&rdquo;? This action cannot be
                  undone and will permanently remove the event and all
                  associated data.
                </p>

                {/* Warning Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 mb-2">
                        Warning:
                      </h3>
                      <ul className="text-sm text-red-600 space-y-1">
                        <li>• All event data will be permanently deleted</li>
                        <li>• Attendee registrations will be lost</li>
                        <li>• Payment records will remain but be orphaned</li>
                        <li>• This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    To confirm deletion, type DELETE in the field below:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to Confirm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmation !== "DELETE"}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    deleteConfirmation === "DELETE"
                      ? "bg-[#FF6B35] hover:bg-orange-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== SPEAKER VIEW =====
  if (isSpeaker) {
    const filters = [
      "All Events",
      "Upcoming",
      "Completed",
      "Cancelled",
      "Postponed",
    ];
    const topRowEvents = filteredEventsSpeaker.slice(0, 3);
    const bottomRowEvents = filteredEventsSpeaker.slice(3);

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-2xl font-bold text-gray-900 mb-2">
                Event Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track and manage all speaker events and engagements
              </p>
            </div>

            <FilterBar
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </div>

        <div className="space-y-6">
          {topRowEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRowEvents.map((event) => (
                <SpeakerEventCard key={event._id} event={event} />
              ))}
            </div>
          )}

          {bottomRowEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bottomRowEvents.map((event) => (
                <SpeakerEventCard key={event._id} event={event} />
              ))}
            </div>
          )}

          {filteredEventsSpeaker.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No events found for this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== PARTICIPANT VIEW =====
  return (
    <div className="min-h-screen w-full bg-[#fff5f5] flex justify-center">
      <div className="w-full max-w-[85vw] bg-white rounded-2xl shadow-sm flex flex-col p-6 lg:p-8">
        {/* Title + Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">Manage all your events in one place</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 w-full border border-gray-200 rounded-xl p-3 flex items-center gap-3">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-md focus:outline-none"
              suppressHydrationWarning
            />
          </div>
          <button className="flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md">
            <span>All Categories</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md">
            <span>All Types</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Events Tabs */}
        <div className="bg-[#fbf2ef] rounded-lg mb-6 flex w-full p-1 gap-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <Calendar size={16} />
            <span>Upcoming ({upcomingEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <Clock size={16} />
            <span>Past Events ({pastEvents.length})</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEventsParticipant.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center col-span-3">
                <div className="flex flex-col items-center gap-3">
                  <Calendar size={36} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {activeTab === "upcoming"
                      ? "No upcoming events found"
                      : "No past events found"}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming events"
                      : "You don't have any past events"}
                  </p>
                </div>
              </div>
            ) : (
              filteredEventsParticipant.map((event) => {
                const minPrice = event.ticketTypes?.length
                  ? Math.min(...event.ticketTypes.map((t) => t.price || 0))
                  : 0;
                const eventType = minPrice >= 200 ? "vip" : "standard";

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 h-full"
                  >
                    {/* Event Image */}
                    <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={event.bannerImage || "/default-event.jpg"}
                        alt={event.eventName}
                        className="w-full h-full object-cover"
                      />
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-4 py-2 rounded-full text-base font-semibold ${
                            eventType === "vip"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {eventType} - ₹{minPrice || 0}
                        </span>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-4 py-2 rounded-full text-base font-semibold ${
                            activeTab === "upcoming"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {activeTab === "upcoming" ? "upcoming" : "past"}
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                        {event.eventName}
                      </h3>
                      <p className="text-gray-600 text-lg mb-4 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Organizer */}
                      <div className="text-lg text-gray-500 mb-4 font-medium">
                        {typeof event.organizer === "object" && event.organizer
                          ? `${(event.organizer as any).firstName || ""} ${
                              (event.organizer as any).lastName || ""
                            }`.trim() || "Organizer"
                          : "Organizer"}
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-lg text-gray-600">
                          <Calendar
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>{formatDateFull(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Clock
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>
                            {formatTime(event.startDate)} -{" "}
                            {formatTime(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          {getLocationIcon(event.eventMode)}
                          <span className="ml-3">
                            {event.eventMode === "online"
                              ? "Online"
                              : event.eventMode === "hybrid"
                              ? `Hybrid • ${event.location || "TBA"}`
                              : `Offline • ${event.location || "TBA"}`}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Users
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>
                            {event.totalTicketsSold || 0}/{event.totalCapacity}{" "}
                            registered
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {event.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gray-100 rounded-full text-base text-gray-700 border border-gray-200 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="px-4 py-2 bg-gray-100 rounded-full text-base text-gray-700 border border-gray-200 font-medium">
                              +{event.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-center mt-auto">
                        <Link
                          href={`/events/${event._id}`}
                          className={`text-lg font-semibold text-white rounded-lg px-8 py-3 transition-colors w-full text-center ${
                            activeTab === "upcoming"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          }`}
                        >
                          {activeTab === "upcoming"
                            ? "View Details"
                            : "View Event"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
