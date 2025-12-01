"use client";

import React, { useState, useEffect } from "react";
import { Edit, Users, X } from "lucide-react";
import { useUpdateEventMutation } from "@/store/api/eventApi";

interface Event {
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

interface OverviewProps {
  event: Event;
  onEdit?: () => void;
  onSave?: (updatedEvent: Event) => void;
}

const Overview: React.FC<OverviewProps> = ({ event, onEdit, onSave }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description,
    mode: event.mode,
    location: event.location || "",
    eventUrl: event.eventUrl || "",
  });

  const [updateEvent, { isLoading: isUpdating, error: updateError }] =
    useUpdateEventMutation();

  useEffect(() => {
    setEditForm({
      title: event.title,
      description: event.description,
      mode: event.mode,
      location: event.location || "",
      eventUrl: event.eventUrl || "",
    });
  }, [event]);

  const handleEditClick = () => {
    setEditForm({
      title: event.title,
      description: event.description,
      mode: event.mode,
      location: event.location || "",
      eventUrl: event.eventUrl || "",
    });
    setShowEditModal(true);
    onEdit?.();
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setEditForm({
      title: event.title,
      description: event.description,
      mode: event.mode,
      location: event.location || "",
      eventUrl: event.eventUrl || "",
    });
  };

  const handleSave = async () => {
    try {
      const updateData = {
        eventId: event.id,
        data: {
          eventName: editForm.title,
          description: editForm.description,
          eventMode: editForm.mode.toLowerCase() as
            | "offline"
            | "online"
            | "hybrid",
          location: editForm.location,
          eventUrl: editForm.eventUrl,
        },
      };

      const result = await updateEvent(updateData).unwrap();

      if (result.success) {
        const updatedEvent: Event = {
          ...event,
          title: editForm.title,
          description: editForm.description,
          mode: editForm.mode,
          location: editForm.location,
          eventUrl: editForm.eventUrl,
        };

        onSave?.(updatedEvent);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Top Row: Event Details and Ticket Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-[#FF6B35] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-[#FF6B35]">
                Event Details
              </h3>
              <button
                onClick={handleEditClick}
                className="p-2 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Title
                </label>
                <p className="text-gray-900 mt-1 font-medium text-xs">
                  {event.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-700 mt-1 text-xs">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date & Time
                  </label>
                  <p className="text-gray-900 mt-1 text-xs">
                    {event.date} at {event.time}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Duration
                  </label>
                  <p className="text-gray-900 mt-1 text-xs">{event.duration}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Mode
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-block px-4 py-1 rounded-lg text-xs font-medium ${
                      event.mode === "Online"
                        ? "bg-[#FF6B35] text-white"
                        : event.mode === "Offline"
                        ? "bg-[#FF6B35] text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {event.mode}
                  </span>
                </div>
              </div>

              {(event.mode === "Online" || event.mode === "Hybrid") &&
                event.eventUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Event URL
                    </label>
                    <p className="text-[#FF6B35] mt-1 font-medium text-xs truncate">
                      {event.eventUrl}
                    </p>
                  </div>
                )}

              {(event.mode === "Offline" || event.mode === "Hybrid") &&
                event.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <p className="text-gray-700 mt-1 text-xs">
                      {event.location}
                    </p>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Capacity
                  </label>
                  <p className="text-gray-900 mt-1 text-xs">
                    {event.capacity} attendees
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Base Price
                  </label>
                  <p className="text-gray-900 mt-1 text-xs">₹{event.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Sales Card */}
          <div className="bg-white rounded-lg shadow-sm border border-[#FF6B35] p-6">
            <h3 className="text-base font-semibold text-[#FF6B35] mb-6">
              Ticket Sales
            </h3>

            <div className="space-y-4">
              {event.ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="border border-[#FF6B35] rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs">
                        {ticket.type}
                      </h4>
                      <p className="text-[#FF6B35] font-semibold text-xs">
                        ₹{ticket.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-xs">
                        {ticket.sold} / {ticket.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.percentage}% sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Speakers Card - Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-[#FF6B35] p-6">
          <h3 className="text-base font-semibold text-[#FF6B35] mb-6">
            Speakers ({event.speakers.length})
          </h3>

          {event.speakers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.speakers.map((speaker, index) => (
                <div
                  key={index}
                  className="border border-[#FF6B35] rounded-lg p-4 flex items-start space-x-4"
                >
                  <img
                    src={
                      speaker.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        speaker.name
                      )}&background=FF6B35&color=ffffff&size=48`
                    }
                    alt={speaker.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {speaker.name}
                    </h4>
                    <p className="text-xs text-[#FF6B35] font-medium">
                      {speaker.title}
                    </p>
                    {speaker.expertise && (
                      <p className="text-xs text-gray-600 mt-1">
                        {speaker.expertise}
                      </p>
                    )}
                    {speaker.bio && (
                      <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                        {speaker.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No speakers added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#FF6B35]/20"></div>

          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#FF6B35]">
                    Edit Event Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update Event Details
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {updateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    Failed to update event. Please try again.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Enter Title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs"
                  />
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                    Title *
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Enter Description"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none transition-colors text-xs"
                  />
                  <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-[#FF6B35]">
                    Description *
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
