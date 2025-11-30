"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import {
  useGetDisputeByIdQuery,
  useAddMessageMutation,
} from "@/store/api/disputeApi";
import type { Dispute } from "@/types/dispute";

/**
 * Dispute Detail Page - Matches old project UI
 * Shows dispute details in a sidebar with communication timeline
 */
export default function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, refetch } = useGetDisputeByIdQuery(id);
  const dispute: Dispute | undefined = data?.dispute;
  const [newMessage, setNewMessage] = useState("");
  const [addMessage, { isLoading: isAddingMessage }] = useAddMessageMutation();

  // Handle send message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addMessage({
          disputeId: id,
          data: { content: newMessage, messageType: "message" },
        }).unwrap();
        setNewMessage("");
        refetch();
      } catch (error: any) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (isLoading || !dispute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-500">Loading dispute details...</p>
        </div>
      </div>
    );
  }

  const complainant = dispute.complainant;
  const respondents = dispute.respondent || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Dispute Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-200 space-y-6">
              <Link
                href="/dispute"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Disputes
              </Link>

              <h2 className="text-xl font-bold text-orange-600">
                Dispute Details
              </h2>
              <div className="border border-orange-200 rounded-xl p-5 space-y-5 bg-orange-50/20">
                <h3 className="text-orange-600 font-medium text-base">
                  Basic Information
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Title</span>
                  <span className="text-gray-800">{dispute.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="text-gray-800">{dispute.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority</span>
                  <span className="text-gray-800">{dispute.priority}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Filed Date</span>
                  <span className="text-gray-800">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dispute ID</span>
                  <span className="text-gray-800">{dispute.disputeId}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Current Stage</span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                    {dispute.currentStage}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-gray-500 text-sm block">
                    Complainant
                  </span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs inline-block">
                    {complainant?.firstName} {complainant?.lastName}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-gray-500 text-sm block">
                    Respondents
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {respondents.map((r: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs"
                      >
                        {r.firstName} {r.lastName}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block mb-1">
                    Description
                  </span>
                  <p className="text-gray-800 font-medium">
                    {dispute.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Communication Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-orange-500 text-white p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold">
                  Communication Timeline
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[36rem] overflow-y-auto">
                {dispute.messages && dispute.messages.length > 0 ? (
                  dispute.messages.map((msg: any, idx: number) => (
                    <div key={idx} className="w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-300">
                          {typeof msg.sender === "object"
                            ? `${msg.sender.firstName} ${msg.sender.lastName}`
                            : complainant
                            ? `${complainant.firstName} ${complainant.lastName}`
                            : "User"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full px-4 py-3 rounded-lg border text-sm break-words bg-orange-50 text-orange-600 border-orange-300">
                        {msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSendMessage()
                    }
                    disabled={isAddingMessage}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isAddingMessage || !newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
