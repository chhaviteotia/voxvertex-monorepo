"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  BadgeIndianRupee,
  Clock,
  Calendar as CalendarIcon,
  User,
} from "lucide-react";
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

interface SpeakerCardProps {
  speaker: ConvertedSpeaker;
  showAttachButton?: boolean;
  onViewDetails?: (bookingId: string) => void;
}

export default function SpeakerCard({
  speaker,
  showAttachButton = false,
  onViewDetails,
}: SpeakerCardProps) {
  const [imageError, setImageError] = useState(false);

  const getTagColor = () => {
    return "bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-[#FF6B35] p-4 hover:shadow-md transition-shadow">
      {/* Speaker Header */}
      <div className="flex items-start space-x-3 mb-4">
        {imageError || !speaker.image ? (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={20} className="text-gray-400" />
          </div>
        ) : (
          <Image
            src={speaker.image}
            alt={speaker.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-xs truncate">
            {speaker.name}
          </h3>
          <p className="text-[10px] text-gray-600 mt-1 leading-tight">
            {speaker.expertise || "No expertise specified"}
          </p>
        </div>
      </div>

      {/* Date and Price */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center space-x-2">
          <Calendar size={12} className="text-gray-400" />
          <span className="text-[10px] text-gray-600">{speaker.date}</span>
        </div>
        <div className="flex items-center space-x-2">
          <BadgeIndianRupee size={12} className="text-gray-400" />
          <span className="text-xs text-green-600">
            ₹{speaker.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {speaker.tags.map((tag, index) => (
          <span
            key={index}
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getTagColor()}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-gray-400">
          <Clock size={10} />
          <span className="text-[10px]">{speaker.timeAgo}</span>
        </div>
        {speaker.bookingId && (
          <button
            onClick={() => onViewDetails?.(speaker.bookingId!)}
            className="text-[10px] text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium"
          >
            View Details
          </button>
        )}
      </div>

      {/* Attach to Events Button (only for Confirmed speakers) */}
      {showAttachButton && (
        <button className="w-full mt-3 bg-[#FF6B35] text-white py-1.5 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#FF6B35]/90 transition-colors text-xs font-medium">
          <CalendarIcon size={12} />
          <span>Attach to Events</span>
        </button>
      )}
    </div>
  );
}
