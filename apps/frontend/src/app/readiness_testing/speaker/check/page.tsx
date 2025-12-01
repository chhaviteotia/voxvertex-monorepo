"use client";

import { useState } from "react";
import { Wifi, Mic, Headphones, MonitorCheck, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";

const contentWrapperClasses =
  "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-20 sm:mt-24 md:mt-28 lg:mt-32";

export default function ReadinessCheckPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [checks, setChecks] = useState({
    internet: false,
    quiet: false,
    mic: false,
    tabs: false,
    permissions: false,
  });

  const allDone = Object.values(checks).every(Boolean);

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
          <main className="bg-gradient-to-br from-[#f4faff] to-[#e9f5ff] rounded-2xl shadow-sm p-8">
            {/* TOP STEPS INDICATOR */}
            <div className="flex items-center justify-center gap-10 mb-10 text-gray-400 font-medium">
              <Step number={1} label="Instructions" active />
              <Step number={2} label="Device Setup" />
              <Step number={3} label="Live Test" />
              <Step number={4} label="Results" />
              <Step number={5} label="Fallback" />
              <Step number={6} label="Complete" />
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">
              Ready for your event?
            </h2>
            <p className="text-center text-gray-600 mb-10">
              Let's make sure your setup is perfect.
            </p>

            <h3 className="text-xl font-semibold mb-6">Pre-Test Checklist</h3>

            <div className="space-y-4">
              <ChecklistItem
                icon={<Wifi className="w-6 h-6 text-blue-600" />}
                label="Stable internet connection"
                checked={checks.internet}
                onChange={() =>
                  setChecks({ ...checks, internet: !checks.internet })
                }
              />

              <ChecklistItem
                icon={<Mic className="w-6 h-6 text-blue-600" />}
                label="Quiet environment"
                checked={checks.quiet}
                onChange={() => setChecks({ ...checks, quiet: !checks.quiet })}
              />

              <ChecklistItem
                icon={<Headphones className="w-6 h-6 text-blue-600" />}
                label="Plugged-in microphone or headset"
                checked={checks.mic}
                onChange={() => setChecks({ ...checks, mic: !checks.mic })}
              />

              <ChecklistItem
                icon={<MonitorCheck className="w-6 h-6 text-blue-600" />}
                label="Close other tabs for best performance"
                checked={checks.tabs}
                onChange={() => setChecks({ ...checks, tabs: !checks.tabs })}
              />

              <ChecklistItem
                icon={<Camera className="w-6 h-6 text-blue-600" />}
                label="Allow browser permissions (camera/mic)"
                checked={checks.permissions}
                onChange={() =>
                  setChecks({ ...checks, permissions: !checks.permissions })
                }
              />
            </div>
            <div className="flex flex-row gap-4">
              <button
                className="w-full mt-10 py-3 text-white rounded-xl font-semibold transition bg-blue-600 hover:bg-blue-700"
                onClick={() => router.back()}
              >
                Back
              </button>
              <button
                disabled={!allDone}
                className={`w-full mt-10 py-3 text-white rounded-xl font-semibold transition 
                ${
                  allDone
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
                onClick={() => {
                  if (allDone) router.push("/readiness_testing/speaker/device");
                }}
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------- Components -------------- */

function ChecklistItem({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-left justify-left bg-white p-5 rounded-2xl shadow-sm border">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-blue-600 cursor-pointer m-2"
      />
      <div className="flex items-center gap-4">
        {icon}
        <p className="text-lg font-medium">{label}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  label,
  active = false,
}: {
  number: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full border text-lg font-semibold
        ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white"}
      `}
      >
        {number}
      </div>
      <p
        className={`mt-2 text-sm ${
          active ? "text-blue-600 font-semibold" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
