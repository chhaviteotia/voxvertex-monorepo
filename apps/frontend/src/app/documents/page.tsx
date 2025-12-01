"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import { useGetUserEventsQuery } from "@/store/api/eventApi";
import { Loader2 } from "lucide-react";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

export default function OrganizerDocumentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetUserEventsQuery({
      page: 1,
      limit: 100,
    });

  const events = eventsData?.data?.events || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (isAuthenticated && user?.role && user.role !== "organizer") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const getProfileImageUrl = (
    profileImage:
      | {
          data?: { data?: string; contentType?: string; url?: string };
          contentType?: string;
          url?: string;
        }
      | string
      | null
      | undefined
  ) => {
    if (!profileImage) return null;
    if (typeof profileImage === "string") return profileImage;
    if (profileImage.data && profileImage.contentType) {
      const base64 = Array.isArray(profileImage.data)
        ? profileImage.data.toString()
        : String(profileImage.data ?? "");
      return `data:${profileImage.contentType};base64,${base64}`;
    }
    if (profileImage.url) return profileImage.url;
    return null;
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-50 z-[99] pointer-events-none" />

      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
        getProfileImageUrl={getProfileImageUrl}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar />

        <div className={`${contentWrapperClasses} flex-1 bg-gray-50 pb-12`}>
          <main className="flex-1 p-0">
            {/* Gradient Header Banner */}
            <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
              <div>
                <h1 className="text-xl font-bold text-black">
                  Documents Workspace
                </h1>
                <p className="text-white text-sm">
                  View, upload, and manage all your speaker contracts, creative
                  assets, and event approvals in one place.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#FF6B35]/20 rounded-lg shadow-sm p-6">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                  <span className="ml-3 text-gray-600 text-sm">
                    Loading events...
                  </span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    No Events Yet
                  </p>
                  <p className="text-gray-600">
                    Create an event to start attaching contracts, proposals, and
                    approvals.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event: any) => {
                    const ticketsSold = event.totalTicketsSold || 0;
                    const totalCapacity =
                      event.totalCapacity ||
                      event.ticketTypes?.reduce(
                        (sum: number, ticket: any) =>
                          sum + Number(ticket.quantity || 0),
                        0
                      ) ||
                      0;
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
                        <div className="h-36 w-full overflow-hidden">
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
                              {event.status}
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
                              {tags.map((tag: string) => (
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
