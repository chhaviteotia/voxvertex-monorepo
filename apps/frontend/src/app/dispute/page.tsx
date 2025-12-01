"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, FileText } from "lucide-react";
import { useGetUserDisputesQuery } from "@/store/api/disputeApi";
import type { Dispute } from "@/types/dispute";

/**
 * Dispute Page - Matches old project UI
 * Main page for viewing and managing disputes with table layout
 */
export default function DisputePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [page, setPage] = useState(1);

  const {
    data: disputesData,
    isLoading,
    error,
    refetch,
  } = useGetUserDisputesQuery({
    status:
      statusFilter === "All Statuses" ? undefined : statusFilter.toLowerCase(),
    stage:
      stageFilter === "All Stages"
        ? undefined
        : stageFilter.toLowerCase().replace(" ", "-"),
    page,
  });

  // Backend returns { success: true, disputes: [...], pagination: {...} }
  const disputes: Dispute[] = disputesData?.disputes || [];
  const totalPages: number = disputesData?.pagination?.pages || 1;

  // Normalize disputes data - ensure respondent is always an array
  const normalizedDisputes = disputes.map((d) => ({
    ...d,
    respondent: Array.isArray(d.respondent)
      ? d.respondent
      : d.respondent
      ? [d.respondent]
      : [],
  }));

  // Local search filtering
  const filtered = normalizedDisputes.filter((d) =>
    (d.title + d.description).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculations - use normalized disputes
  const active = normalizedDisputes.filter(
    (d) => d.status.toLowerCase() === "active"
  ).length;
  const resolved = normalizedDisputes.filter(
    (d) => d.status.toLowerCase() === "resolved"
  ).length;
  const escalated = normalizedDisputes.filter(
    (d) => d.status.toLowerCase() === "escalated"
  ).length;
  const totalAmt = normalizedDisputes.reduce(
    (t, d) => t + (d.disputeAmount || 0),
    0
  );

  // Helper functions to get CSS classes
  const getStatusColor = (s: string) =>
    s.toLowerCase() === "active"
      ? "bg-blue-100 text-blue-700"
      : s.toLowerCase() === "resolved"
      ? "bg-green-100 text-green-700"
      : s.toLowerCase() === "escalated"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  const getStageColor = (s: string) =>
    s.toLowerCase() === "peer-to-peer"
      ? "bg-purple-100 text-purple-700"
      : s.toLowerCase() === "mediation"
      ? "bg-yellow-100 text-yellow-700"
      : s.toLowerCase() === "legal"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
          Error loading disputes. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-0">
        {/* Gradient Header Banner */}
        <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
          <div>
            <h1 className="text-xl font-bold text-black">
              Dispute Resolution Center
            </h1>
            <p className="text-white text-sm">
              Manage and resolve disputes efficiently with streamlined workflows
            </p>
          </div>
          <Link
            href="/dispute/create"
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-md font-medium hover:bg-[#FF5A25] transition-colors"
          >
            + File New Dispute
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Active Disputes"
            value={active}
            color="text-[#FF6B35]"
          />
          <StatCard title="Resolved" value={resolved} color="text-[#FF8B00]" />
          <StatCard
            title="Escalated"
            value={escalated}
            color="text-[#FF3B30]"
          />
          <StatCard
            title="Total Amount"
            value={`₹${totalAmt}`}
            color="text-[#FF6B35]"
          />
        </div>

        {/* All Disputes Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-orange-400 font-semibold">
            All Disputes
          </h2>
          <span className="px-3 py-1 text-sm text-orange-500 border border-orange-300 rounded-full">
            {filtered.length} of {disputes.length} Disputes
          </span>
        </div>

        {/* Table Container */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-[2]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-9 border border-orange-200 rounded-md py-2 focus:ring-2 focus:ring-orange-300 outline-none"
                placeholder="Search Disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                suppressHydrationWarning
              />
            </div>

            <div className="relative w-48">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-md py-2 pl-10 pr-8 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                suppressHydrationWarning
              >
                {[
                  "All Stages",
                  "Peer to peer",
                  "Mediation",
                  "Legal",
                  "Resolved",
                ].map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-md py-2 px-3 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                suppressHydrationWarning
              >
                {["All Statuses", "Active", "Resolved", "Escalated"].map(
                  (opt) => (
                    <option key={opt}>{opt}</option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-500">Loading disputes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No disputes found</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
                <thead>
                  <tr
                    className="text-sm text-gray-700"
                    style={{ backgroundColor: "#FFF4EB" }}
                  >
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Event & Reason
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Parties Involved
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Current Stage
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Date Filed
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800 text-center">
                      Manage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d._id}
                      className="border-b last:border-0 hover:bg-orange-50/40"
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="font-medium text-gray-900">
                          {d.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {d.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-wrap gap-2">
                          {/* Complainant */}
                          <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-200">
                            {d.complainant?.firstName || ""}{" "}
                            {d.complainant?.lastName || ""}
                          </span>
                          {/* Respondents */}
                          {d.respondent &&
                            d.respondent.map((r, idx) => {
                              const respondent =
                                typeof r === "object" && r !== null
                                  ? r
                                  : { firstName: "", lastName: "" };
                              return (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-200"
                                >
                                  {respondent.firstName || ""}{" "}
                                  {respondent.lastName || ""}
                                </span>
                              );
                            })}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium ${getStageColor(
                            d.currentStage
                          )}`}
                        >
                          {d.currentStage}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium ${getStatusColor(
                            d.status
                          )}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {d.disputeAmount} {d.disputeCurrency || "INR"}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {d._id ? (
                          <Link
                            href={`/dispute/${d._id}`}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors inline-block"
                            onClick={() => {
                              console.log(
                                "Navigating to dispute:",
                                d._id,
                                d.disputeId
                              );
                            }}
                          >
                            <FileText size={18} />
                          </Link>
                        ) : (
                          <span
                            className="p-2 text-gray-300 cursor-not-allowed"
                            title="Dispute ID not available"
                          >
                            <FileText size={18} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md border ${
                      page === 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-orange-50 border-orange-300"
                    }`}
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 rounded-md border bg-white">
                    {page}
                  </span>
                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md border ${
                      page === totalPages
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-orange-50 border-orange-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// StatCard Component
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start">
      <div className="text-sm font-medium text-gray-400 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-xs text-gray-400">Marketing unbound</div>
      <div className="text-xs text-gray-400">October 1, 2025</div>
    </div>
  );
}
