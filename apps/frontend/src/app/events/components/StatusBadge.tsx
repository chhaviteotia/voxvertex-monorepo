"use client";
import React from "react";
import { Clock, Star, AlertCircle, Calendar, XCircle } from "lucide-react";

export type EventStatus =
  | "Upcoming"
  | "Completed"
  | "Cancelled"
  | "Postponed"
  | "Postponed - Awaiting Action"
  | "Declined"
  | "Published"
  | "Draft";

interface StatusConfig {
  bg: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatusBadgeProps {
  status: EventStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, StatusConfig> = {
    Upcoming: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
    Completed: { bg: "bg-green-50", text: "text-green-700", icon: Star },
    Cancelled: { bg: "bg-red-50", text: "text-red-600", icon: AlertCircle },
    Postponed: { bg: "bg-purple-50", text: "text-purple-700", icon: Calendar },
    "Postponed - Awaiting Action": {
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: Calendar,
    },
    Declined: { bg: "bg-red-50", text: "text-red-600", icon: XCircle },
    Published: { bg: "bg-green-50", text: "text-green-700", icon: Star },
    Draft: { bg: "bg-gray-50", text: "text-gray-700", icon: Clock },
  };

  const normalizedStatus =
    status === "published"
      ? "Published"
      : status === "draft"
      ? "Draft"
      : status === "cancelled"
      ? "Cancelled"
      : status === "postponed"
      ? "Postponed"
      : status;

  const config = statusConfig[normalizedStatus] || statusConfig["Upcoming"];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.bg} ${
        config.text
      } px-3 py-1 rounded-full ${
        status === "Postponed - Awaiting Action" ? "text-sm" : ""
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{normalizedStatus}</span>
    </div>
  );
}
