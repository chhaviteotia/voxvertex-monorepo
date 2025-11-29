"use client";

import { useState, useEffect, Suspense, memo } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";
import dynamic from "next/dynamic";
import HeaderSection from "./aboutUser/HeaderSection";
import InfoCard from "../common/InfoCard";
import ContactCard from "../common/ContactCard";

// Custom inline SVG as a React component
const EventIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 14 14"
    className={className}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
    >
      <path d="M9.5 3.5h4v4"></path>
      <path d="M13.5 3.5L7.85 9.15a.5.5 0 0 1-.7 0l-2.3-2.3a.5.5 0 0 0-.7 0L.5 10.5"></path>
    </g>
  </svg>
);

/**
 * AboutUser Component - Improved with TypeScript and better structure
 * Displays user profile overview with stats and contact information
 */
const AboutUser = memo(() => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery();

  // Default fallback data
  const defaultData = {
    name: "User",
    role: "Member",
    description:
      "Welcome to your profile! Update your information to get started.",
    profilePic: null,
    domains: [],
    stats: [
      { icon: EventIcon, value: "0", label: "Total Bookings" },
      { icon: EventIcon, value: "$ 0", label: "Revenue" },
      { icon: EventIcon, value: "0", label: "Total Videos" },
      { icon: EventIcon, value: "0", label: "Available Slots" },
    ],
    contacts: [
      { icon: FiPhone, label: "Contact Number", value: "Not provided" },
      { icon: FiMail, label: "Email Address", value: "Not provided" },
      { icon: FiMapPin, label: "Location", value: "Not provided" },
    ],
  };

  const [userData, setUserData] = useState(defaultData);

  useEffect(() => {
    const processUserData = () => {
      const user = currentUserData?.user || auth.user;
      if (!user) {
        setIsLoading(true);
        return;
      }

      // Extract domains/expertise from user data
      const domains =
        (user as any).areaOfExpertise ||
        ((user as any).roleSpecificData?.activities || []).slice(0, 5) ||
        defaultData.domains;

      // Prepare user data
      const dynamicUserData = {
        name:
          `${(user as any).firstName || ""} ${
            (user as any).lastName || ""
          }`.trim() || defaultData.name,
        role:
          (user as any).professionalTitle ||
          ((user as any).role === "speaker"
            ? "Professional Speaker"
            : (user as any).role) ||
          defaultData.role,
        description: (user as any).bio || defaultData.description,
        profilePic: (user as any).profileImageUrl || defaultData.profilePic,
        domains: domains,
        stats: defaultData.stats, // Stats will be calculated from API later
        contacts: [
          {
            icon: FiPhone,
            label: "Contact Number",
            value:
              (user as any).mobileNo || (user as any).phone || "Not provided",
          },
          {
            icon: FiMail,
            label: "Email Address",
            value: (user as any).email || "Not provided",
          },
          {
            icon: FiMapPin,
            label: "Location",
            value: (user as any).location || "Not provided",
          },
        ],
      };

      setUserData(dynamicUserData);
      setIsLoading(false);
    };

    processUserData();
  }, [currentUserData, auth.user]);

  // Show loading state
  if (isLoading || isUserLoading || !userData) {
    return (
      <div className="w-full h-auto bg-[#FFFDFB] shadow-md rounded-lg p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto bg-[#FFFDFB] shadow-md rounded-lg rounded-tl-none rounded-bl-none">
      <Suspense
        fallback={
          <div className="h-48 bg-[#FF6B35] animate-pulse rounded-t-lg"></div>
        }
      >
        <HeaderSection
          name={userData.name}
          role={userData.role}
          description={userData.description}
          domains={userData.domains}
          profilePic={userData.profilePic}
        />
      </Suspense>

      {/* Info Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-3 sm:p-4 md:p-5 lg:p-6">
        {userData.stats.map((stat, idx) => (
          <Suspense
            key={idx}
            fallback={
              <div className="h-24 bg-[#FFF1EB] animate-pulse rounded-xl"></div>
            }
          >
            <InfoCard {...stat} />
          </Suspense>
        ))}
      </div>

      {/* Contact Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-3 sm:px-4 md:px-5 lg:px-6 pb-4 sm:pb-5 md:pb-6">
        {userData.contacts.map((contact, idx) => (
          <Suspense
            key={idx}
            fallback={
              <div className="h-16 bg-[#FFF1EB] animate-pulse rounded-xl"></div>
            }
          >
            <ContactCard {...contact} />
          </Suspense>
        ))}
      </div>
    </div>
  );
});

AboutUser.displayName = "AboutUser";

export default AboutUser;
