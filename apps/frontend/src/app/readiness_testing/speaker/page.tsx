"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import { Calendar, CheckCircle2Icon, DownloadIcon, Redo2 } from "lucide-react";
import { BiNotification } from "react-icons/bi";
import { IoAnalytics, IoDocument } from "react-icons/io5";
import { MdPayment } from "react-icons/md";

type Screen = "test" | "system";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

const TechReadinessExperience = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<Screen>("test");

  const flowItems = [
    { color: "bg-blue-600", label: "Data Push" },
    { color: "bg-orange-500", label: "Event Trigger" },
    { color: "bg-green-500", label: "UI Transition" },
  ];

  const renderScreen = () => {
    if (selected === "system") {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            System Integration Map
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Visual representation of how readiness data flows across modules
          </p>

          <div className="flex flex-wrap gap-4 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm mb-8">
            {flowItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <div className={`w-6 h-0.5 ${item.color} rounded-full`} />
                {item.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Calendar className="w-6 h-6" />,
                label: "Speaker Booking",
                color: "bg-blue-600",
              },
              {
                icon: <CheckCircle2Icon className="w-6 h-6" />,
                label: "Readiness Testing",
                color: "bg-green-600",
              },
              {
                icon: <BiNotification className="w-6 h-6" />,
                label: "Notifications",
                color: "bg-cyan-600",
              },
              {
                icon: <IoDocument className="w-6 h-6" />,
                label: "Documents",
                color: "bg-purple-600",
              },
              {
                icon: <MdPayment className="w-6 h-6" />,
                label: "Payments",
                color: "bg-orange-600",
              },
              {
                icon: <IoAnalytics className="w-6 h-6" />,
                label: "Analytics",
                color: "bg-pink-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`${item.color} rounded-2xl p-5 text-white shadow-md flex flex-col gap-2`}
              >
                {item.icon}
                <p className="text-lg font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            {[
              {
                title: "📘 Booking → Readiness",
                text: "When a speaker is booked, a readiness test is automatically created with pre-filled event details.",
                bg: "bg-blue-50",
                border: "border-blue-200",
                textClass: "text-blue-900",
              },
              {
                title: "✅ Readiness → Documents",
                text: "Document upload unlocks when readiness score ≥70%, ensuring technical preparedness first.",
                bg: "bg-green-50",
                border: "border-green-200",
                textClass: "text-green-900",
              },
              {
                title: "💰 Readiness → Payments",
                text: "Passing readiness triggers the next payment milestone in escrow automatically.",
                bg: "bg-orange-50",
                border: "border-orange-200",
                textClass: "text-orange-900",
              },
              {
                title: "📊 Readiness → Analytics",
                text: "Test scores feed into analytics dashboards for reporting and insights.",
                bg: "bg-cyan-50",
                border: "border-cyan-200",
                textClass: "text-cyan-900",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl p-5 ${card.bg} ${card.border} ${card.textClass}`}
              >
                <p className="font-semibold">{card.title}</p>
                <p className="text-sm mt-1">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              title: "Global AI Summit 2025",
              status: {
                label: "Pending",
                color: "bg-yellow-100 text-yellow-700",
              },
              date: "November 15, 2025",
              action: (
                <button
                  onClick={() =>
                    router.push("/readiness_testing/speaker/check")
                  }
                  className="w-full mt-6 py-3 rounded-xl text-white font-medium bg-blue-600 shadow hover:bg-blue-500"
                >
                  Start Readiness Test
                </button>
              ),
            },
            {
              title: "Tech Innovation Summit",
              status: { label: "✔ 92%", color: "bg-green-100 text-green-700" },
              date: "November 20, 2025",
              summary: "Test completed successfully. All systems ready.",
            },
            {
              title: "Web Development Conference",
              status: { label: "✔ 87%", color: "bg-green-100 text-green-700" },
              date: "December 5, 2025",
              summary: "Test completed successfully. All systems ready.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <p className="text-xl font-semibold">{card.title}</p>
                <span
                  className={`${card.status.color} text-sm px-3 py-1 rounded-full`}
                >
                  {card.status.label}
                </span>
              </div>
              <p className="text-gray-500 mt-1">{card.date}</p>

              {card.summary ? (
                <div className="bg-green-50 rounded-xl p-4 mt-6 text-sm text-green-800">
                  {card.summary}
                </div>
              ) : null}

              {card.action}

              {card.summary && (
                <div className="flex gap-4 mt-5">
                  <button className="flex items-center justify-center gap-2 w-1/2 py-2 border rounded-xl bg-white hover:bg-gray-50">
                    <DownloadIcon className="w-4 h-4" /> Download Report
                  </button>
                  <button className="flex items-center justify-center gap-2 w-1/2 py-2 border rounded-xl bg-white hover:bg-gray-50">
                    <Redo2 className="w-4 h-4" /> Retest
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setSelected("test")}
          className={`px-5 py-2 rounded-full text-sm font-medium border ${
            selected === "test"
              ? "bg-[#FF6B35] text-white border-[#FF6B35]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Readiness Tests
        </button>
        <button
          onClick={() => setSelected("system")}
          className={`px-5 py-2 rounded-full text-sm font-medium border ${
            selected === "system"
              ? "bg-[#FF6B35] text-white border-[#FF6B35]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          System Map
        </button>
      </div>

      {renderScreen()}
    </div>
  );
};

export default function SpeakerReadinessPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isAuthenticated && user?.role && user.role !== "speaker") {
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
    <div className="relative min-h-screen bg-[#fffbf5] overflow-x-hidden">
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-[#fffbf5] z-[99] pointer-events-none" />

      <UnifiedHeader
        variant="authenticated"
        user={user}
        currentUserData={currentUserData}
        getProfileImageUrl={getProfileImageUrl}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar />

        <div className={`${contentWrapperClasses} flex-1 pb-12`}>
          <main className="bg-white border border-[#FF6B35]/20 rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-[#FF6B35] mb-1">
                Speaker Tools
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Tech Readiness Center
              </h1>
              <p className="text-gray-600 mt-2">
                Run pre-event checks, download reports, and understand how your
                readiness data flows through the platform.
              </p>
            </div>

            <TechReadinessExperience />
          </main>
        </div>
      </div>
    </div>
  );
}
