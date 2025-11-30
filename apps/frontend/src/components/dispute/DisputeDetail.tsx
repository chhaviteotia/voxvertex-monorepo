"use client";

import { useState } from "react";
// Date formatting helper
const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
import {
  useGetDisputeByIdQuery,
  useAddMessageMutation,
  useEscalateDisputeMutation,
} from "@/store/api/disputeApi";
import { toast } from "react-hot-toast";
import { Send, AlertTriangle } from "lucide-react";

interface DisputeDetailProps {
  disputeId: string;
  onUpdate?: () => void;
}

export default function DisputeDetail({
  disputeId,
  onUpdate,
}: DisputeDetailProps) {
  const [messageContent, setMessageContent] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const { data, isLoading, error, refetch } = useGetDisputeByIdQuery(disputeId);
  const [addMessage, { isLoading: isAddingMessage }] = useAddMessageMutation();
  const [escalateDispute, { isLoading: isEscalating }] =
    useEscalateDisputeMutation();

  const dispute = data?.dispute;

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await addMessage({
        disputeId,
        data: { content: messageContent, messageType: "message" },
      }).unwrap();
      setMessageContent("");
      toast.success("Message sent successfully");
      refetch();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      toast.error("Please provide a reason for escalation");
      return;
    }

    try {
      await escalateDispute({
        disputeId,
        data: { reason: escalationReason },
      }).unwrap();
      setShowEscalateModal(false);
      setEscalationReason("");
      toast.success("Dispute escalated successfully");
      refetch();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to escalate dispute");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">Error loading dispute details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {dispute.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Dispute ID: {dispute.disputeId}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                dispute.status === "active"
                  ? "bg-yellow-100 text-yellow-800"
                  : dispute.status === "resolved"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {dispute.status}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                dispute.currentStage === "peer-to-peer"
                  ? "bg-blue-100 text-blue-800"
                  : dispute.currentStage === "mediation"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {dispute.currentStage.replace("-", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {dispute.description}
        </p>
      </div>

      {/* Parties */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Parties</h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-500">Complainant:</span>
            <p className="text-sm font-medium text-gray-900">
              {dispute.complainant.firstName} {dispute.complainant.lastName}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Respondent(s):</span>
            {dispute.respondent.map((resp, idx) => (
              <p key={idx} className="text-sm font-medium text-gray-900">
                {resp.firstName} {resp.lastName}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Messages</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {dispute.messages.map((message, idx) => (
            <div key={idx} className="border-l-2 border-gray-200 pl-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-900">
                  {typeof message.sender === "object"
                    ? `${message.sender.firstName} ${message.sender.lastName}`
                    : "User"}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(message.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{message.content}</p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isAddingMessage || !messageContent.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Actions */}
      {dispute.status === "active" && dispute.currentStage !== "legal" && (
        <div className="px-6 py-4">
          <button
            onClick={() => setShowEscalateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <AlertTriangle className="h-4 w-4" />
            Escalate Dispute
          </button>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Escalate Dispute</h3>
            <textarea
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Please provide a reason for escalation..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalationReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={isEscalating || !escalationReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isEscalating ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
