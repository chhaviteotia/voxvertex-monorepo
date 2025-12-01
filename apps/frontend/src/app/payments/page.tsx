"use client";

import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Overview from "./components/Overview";
import Transactions from "./components/Transactions";
import Subscription from "./components/Subscription";
import PaymentMethods from "./components/PaymentMethods";

type TabType = "overview" | "transactions" | "subscription" | "payment-methods";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

export default function PaymentsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

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

  const tabs = [
    { id: "overview" as TabType, label: "Overview" },
    { id: "transactions" as TabType, label: "Transactions" },
    { id: "subscription" as TabType, label: "Subscription" },
    { id: "payment-methods" as TabType, label: "Payment Methods" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "transactions":
        return <Transactions />;
      case "subscription":
        return <Subscription />;
      case "payment-methods":
        return <PaymentMethods />;
      default:
        return <Overview />;
    }
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Payments Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage your funds, transactions, and payment methods
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-green-600">Verified Account</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#FF6B35]/10 rounded-2xl sm:rounded-full shadow-sm border border-white mb-4 sm:mb-8 p-1.5 sm:p-2">
              <div className="flex flex-col sm:flex-row w-full gap-1 sm:gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full transition-all duration-200 font-medium text-sm sm:text-base ${
                      activeTab === tab.id
                        ? "bg-[#FF6B35] text-white shadow-md"
                        : "text-gray-600 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
