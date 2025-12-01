"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useGetEventByIdQuery } from "@/store/api/eventApi";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import type { Event } from "@/types/event";
import Overview from "./components/Overview";
import Participants from "./components/Participants";
import Actions from "./components/Actions";
import ParticipantView from "./components/ParticipantView";

// Event interface matching the old project
interface TransformedEvent {
  id: string;
  title: string;
  date: string;
  status: "Published" | "Draft" | "Postponed";
  attendees: string;
  revenue: string;
  description: string;
  mode: "Online" | "Offline" | "Hybrid";
  eventUrl?: string;
  location?: string;
  time: string;
  duration: string;
  capacity: number;
  price: number;
  image: string;
  startDate: string;
  endDate: string;
  format: string;
  tags: string[];
  ticketTypes: Array<{
    type: string;
    price: number;
    sold: number;
    total: number;
    percentage: number;
  }>;
  speakers: Array<{
    name: string;
    title: string;
    bio: string;
    image?: string;
    expertise?: string;
  }>;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Determine user role
  const role =
    (user?.role as string) ||
    (currentUserData?.user?.role as string) ||
    "participant";
  const isOrganizer = role === "organizer";
  const isSpeaker = role === "speaker";
  const isParticipant = role === "participant";

  const [currentEvent, setCurrentEvent] = useState<TransformedEvent | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "participants" | "actions"
  >("overview");

  // Fetch event data
  const {
    data: eventData,
    isLoading,
    error,
    refetch: refetchEvent,
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  // Transform Event to TransformedEvent interface
  const transformEvent = (event: Event): TransformedEvent => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    return {
      id: event._id,
      title: event.eventName,
      date: startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status:
        event.status === "published"
          ? "Published"
          : event.status === "draft"
          ? "Draft"
          : "Postponed",
      attendees: `${event.totalTicketsSold || 0}/${event.totalCapacity || 0}`,
      revenue: `₹${event.totalRevenue || 0}`,
      description: event.description,
      mode:
        event.eventMode === "offline"
          ? "Offline"
          : event.eventMode === "online"
          ? "Online"
          : "Hybrid",
      eventUrl: event.eventUrl,
      location: event.location,
      time: startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      duration: `${Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      )} hours`,
      capacity: event.totalCapacity || 0,
      price: event.ticketTypes?.[0]?.price
        ? parseInt(String(event.ticketTypes[0].price))
        : 0,
      image: event.bannerImage || "",
      startDate: event.startDate,
      endDate: event.endDate,
      format: event.format || "",
      tags: event.tags || [],
      ticketTypes: (event.ticketTypes || []).map((ticket) => ({
        type: ticket.name,
        price: parseInt(String(ticket.price)),
        sold: 0, // This would need to be fetched from ticket sales data
        total: parseInt(String(ticket.quantity)),
        percentage: 0, // This would be calculated based on sold/total
      })),
      speakers: [
        ...(event.speakers?.manualSpeakers || []).map((speaker) => ({
          name: speaker.name,
          title: speaker.title,
          bio: speaker.bio,
          image: speaker.image,
          expertise: speaker.title,
        })),
        ...(event.speakers?.platformSpeakers || []).map((speaker: any) => ({
          name: speaker.speakerDetails?.fullName || "Unknown Speaker",
          title: speaker.speakerDetails?.professionalTitle || "Speaker",
          bio: speaker.speakerDetails?.bio || "",
          image: speaker.speakerDetails?.profileImageUrl,
          expertise: speaker.speakerDetails?.professionalTitle || "Speaker",
        })),
      ],
    };
  };

  // Transform API data to component format when data is available
  useEffect(() => {
    if (eventData?.data) {
      const transformedEvent = transformEvent(eventData.data);
      setCurrentEvent(transformedEvent);
    }
  }, [eventData]);

  const handleEventSave = async (updatedEvent: TransformedEvent) => {
    setCurrentEvent(updatedEvent);
    // Refetch the latest data from the server to ensure consistency
    await refetchEvent();
    console.log("Event updated:", updatedEvent);
  };

  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleBackToEvents = () => {
    router.push("/events");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !eventData?.data)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={handleBackToEvents}
            className="bg-[#FF6B35] hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>
    );
  }

  // Participant View - Different UI
  if (isParticipant) {
    return <ParticipantView eventId={eventId} />;
  }

  // Organizer/Speaker View - Tabbed Interface
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Background cover */}
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-50 z-[99] pointer-events-none"></div>

      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
      />
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32 bg-orange-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex w-full">
              {(["overview", "participants", "actions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-6 rounded-full font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "bg-[#FF6B35] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "overview" && currentEvent && (
              <Overview
                event={currentEvent}
                onEdit={handleEdit}
                onSave={handleEventSave}
              />
            )}
            {activeTab === "participants" && <Participants eventId={eventId} />}
            {activeTab === "actions" && <Actions eventId={eventId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
