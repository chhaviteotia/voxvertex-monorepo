"use client";

// Date formatting helper
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
import type { Dispute } from "@/types/dispute";

interface DisputeListProps {
  disputes: Dispute[];
  isLoading: boolean;
  error: any;
  selectedDisputeId: string | null;
  onDisputeSelect: (disputeId: string) => void;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "escalated":
      return "bg-red-100 text-red-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case "peer-to-peer":
      return "bg-blue-100 text-blue-800";
    case "mediation":
      return "bg-purple-100 text-purple-800";
    case "legal":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DisputeList({
  disputes,
  isLoading,
  error,
  selectedDisputeId,
  onDisputeSelect,
  pagination,
  onPageChange,
}: DisputeListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">
          Error loading disputes. Please try again.
        </p>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No disputes found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y divide-gray-200">
        {disputes.map((dispute) => (
          <button
            key={dispute._id}
            onClick={() => onDisputeSelect(dispute._id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              selectedDisputeId === dispute._id ? "bg-orange-50" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                {dispute.title}
              </h3>
              <span
                className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  dispute.status
                )}`}
              >
                {dispute.status}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {dispute.description}
            </p>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(
                  dispute.currentStage
                )}`}
              >
                {dispute.currentStage.replace("-", " ")}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(dispute.lastActivityAt)}
              </span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <span>Dispute ID: {dispute.disputeId}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.current} of {pagination.pages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
