"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import SpeakerDatabasePage from "./components/SpeakerDatabase";
import SpeakerManagementPage from "./components/SpeakerManagement";
import DocumentsPage from "./components/Documents";
import SpeakerBookingManagement from "./components/SpeakerBookingManagement";
import { Loader2 } from "lucide-react";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

export default function BookingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useGetCurrentUserQuery();

  const resolvedRole = useMemo(() => {
    return user?.role || currentUserData?.user?.role || null;
  }, [user?.role, currentUserData?.user?.role]);

  const isOrganizer = resolvedRole === "organizer";
  const isSpeaker = resolvedRole === "speaker";

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const hasRedirectedRef = React.useRef(false);

  useEffect(() => {
    if (!isLoadingUser && resolvedRole) {
      if (resolvedRole === "organizer") {
        setActiveTab("Speaker Management");
      } else if (resolvedRole === "speaker") {
        setActiveTab("Booking Management");
      } else {
        setActiveTab("Restricted");
      }
    }
  }, [resolvedRole, isLoadingUser]);

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

  // Redirect to login ONLY if auth explicitly failed (not just loading)
  useEffect(() => {
    // Only redirect if:
    // 1. User fetch is complete (not loading)
    // 2. User fetch explicitly failed (isError is true)
    // 3. No user data exists
    // 4. We haven't redirected already
    if (
      !isLoadingUser &&
      isUserError &&
      !user &&
      !currentUserData &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;
      router.push("/login");
      return;
    }
  }, [isLoadingUser, isUserError, user, currentUserData, router]);

  // Loading state - show loader while auth is being determined
  if (isLoadingUser || (!activeTab && !isUserError)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mx-auto mb-4" />
          <p className="text-gray-600">Loading booking workspace...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show loading state
  if (hasRedirectedRef.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const renderContent = () => {
    if (!activeTab) return null;

    if (isOrganizer) {
      switch (activeTab) {
        case "Speaker Database":
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <SpeakerDatabasePage
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
        case "Speaker Management":
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <SpeakerManagementPage
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
        case "Documents":
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <DocumentsPage onTabChange={handleTabClick} />
            </div>
          );
        default:
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <SpeakerManagementPage
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
      }
    }

    if (isSpeaker) {
      switch (activeTab) {
        case "Booking Management":
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <SpeakerBookingManagement
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
        case "Documents":
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <DocumentsPage onTabChange={handleTabClick} />
            </div>
          );
        default:
          return (
            <div className="relative min-h-screen bg-[#fffbf5]">
              <SpeakerBookingManagement
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
      }
    }

    // Access restricted
    return (
      <div className={`${contentWrapperClasses} flex-1 bg-gray-50 pb-12`}>
        <main className="flex-1 p-0">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Access Restricted
            </h1>
            <p className="text-gray-600 mb-6">
              This page is only accessible to organizers and speakers.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#fffbf5] overflow-x-hidden">
      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
        getProfileImageUrl={getProfileImageUrl}
      />
      <Sidebar />
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-[#fffbf5] z-[99] pointer-events-none" />
      {renderContent()}
    </div>
  );
}
