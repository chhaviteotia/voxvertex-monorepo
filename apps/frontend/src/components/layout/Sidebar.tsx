"use client";

import { useRouter, usePathname } from "next/navigation";
import { CiSettings, CiUser } from "react-icons/ci";
import { IoCalendarOutline } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdLogout } from "react-icons/md";
import {
  CalendarDays,
  LayoutDashboard,
  FileText,
  Cpu,
  Wallet,
} from "lucide-react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";
import { cloneElement, isValidElement, ReactElement } from "react";

/**
 * Sidebar Component - Improved with better TypeScript and structure
 * Provides navigation for authenticated users based on their role
 */
const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Get user details with fallback
  const userDetails = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : currentUserData?.user?.firstName && currentUserData?.user?.lastName
        ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
        : "User",
    email: user?.email || currentUserData?.user?.email || "user@example.com",
    profileImageUrl:
      user?.profileImageUrl || currentUserData?.user?.profileImageUrl || null,
  };

  // Get user role with fallback
  const getUserRole = (): string => {
    return (
      (user?.role as string) ||
      (currentUserData?.user?.role as string) ||
      (currentUserData?.role as string) ||
      "participant"
    );
  };

  const role = getUserRole();
  const isParticipant = role === "participant";
  const isSpeaker = role === "speaker";
  const isOrganizer = role === "organizer";

  // Get profile redirect based on role
  const getProfileRedirect = (): string => {
    switch (role) {
      case "organizer":
        return "/profile/organizer";
      case "speaker":
        return "/profile/speaker";
      case "participant":
        return "/profile/participant";
      default:
        return "/profile";
    }
  };

  // Get events redirect based on role
  const getEventsRedirect = (): string => {
    switch (role) {
      case "organizer":
        return "/events";
      case "participant":
        return "/participant/events";
      default:
        return "/events";
    }
  };

  const currentPath = pathname || "/";

  // Render icon with consistent sizing
  const renderIcon = (icon: ReactElement) => {
    if (!isValidElement(icon)) {
      return icon;
    }

    return cloneElement(icon, {
      size: 22,
      className: "w-[22px] h-[22px] shrink-0",
    });
  };

  // Navigation items based on role
  const profileItem = {
    icon: <CiUser />,
    label: "Profile",
    href: getProfileRedirect(),
    active:
      currentPath === getProfileRedirect() ||
      currentPath.startsWith("/profile"),
  };

  const eventsItem = {
    icon: <CalendarDays />,
    label: "Events",
    href: getEventsRedirect(),
    active:
      currentPath === "/events" ||
      currentPath === "/participant/events" ||
      currentPath.startsWith("/events") ||
      currentPath.startsWith("/participant/events"),
  };

  const disputeItem = {
    icon: <FaMoneyBillTrendUp />,
    label: "Dispute",
    href: "/dispute",
    active: currentPath === "/dispute" || currentPath.startsWith("/dispute"),
  };

  const navigationItems = isParticipant
    ? [profileItem, eventsItem, disputeItem]
    : [
        {
          icon: <LayoutDashboard />,
          label: "Dashboard",
          href: "/dashboard",
          active: currentPath === "/dashboard",
          disabled: true, // Dashboard not implemented yet
        },
        profileItem,
        {
          icon: <LuMessageCircleMore />,
          label: "Messages",
          href: "/messages",
          active:
            currentPath === "/messages" || currentPath.startsWith("/messages"),
        },
        {
          icon: <IoCalendarOutline />,
          label: "Bookings",
          href: "/booking",
          active:
            currentPath === "/booking" || currentPath.startsWith("/booking"),
        },
        {
          icon: <FileText />,
          label: "Documents",
          href: "/documents",
          active:
            currentPath === "/documents" ||
            currentPath.startsWith("/documents"),
          disabled: !isOrganizer,
        },
        {
          icon: <Cpu />,
          label: "Tech Readiness",
          href: "/profile/speaker/readiness",
          active: currentPath.startsWith("/profile/speaker/readiness"),
          disabled: !isSpeaker,
        },
        eventsItem,
        {
          icon: <Wallet />,
          label: "Payments",
          href: "/payments",
          active:
            currentPath === "/payments" || currentPath.startsWith("/payments"),
        },
        disputeItem,
      ];

  const bottomItems = [
    {
      icon: <BiSupport />,
      label: "Support",
      href: "/support",
      active: currentPath === "/support" || currentPath.startsWith("/support"),
    },
    {
      icon: <CiSettings />,
      label: "Settings",
      href: "/settings",
      active:
        currentPath === "/settings" || currentPath.startsWith("/settings"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect even if logout fails
      router.push("/");
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    return userDetails.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="fixed top-20 sm:top-24 md:top-28 lg:top-32 border-2 left-2 sm:left-4 md:left-6 w-64 sm:w-72 md:w-72 bg-white shadow-md z-[98] rounded-lg sm:rounded-xl"
      style={{ height: "calc(100vh - 142px)" }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Main Menu */}
        <div className="space-y-2.5 flex-1 pb-4 border-b border-gray-100">
          {navigationItems.map((item, index) => {
            const isDisabled = item.disabled;
            return (
              <div
                key={`nav-${index}`}
                onClick={() => {
                  if (!isDisabled) {
                    router.push(item.href);
                  }
                }}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition duration-200 ${
                  item.active
                    ? "bg-[#FF6B35]/10 text-[#FF6B35] cursor-pointer"
                    : isDisabled
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : "text-gray-600 hover:bg-gray-200 cursor-pointer"
                }`}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
              >
                {renderIcon(item.icon)}
                <span className="text-sm font-medium leading-5">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Menu */}
        <div className="space-y-2.5 mb-6 mt-4">
          {bottomItems.map((item, index) => (
            <div
              key={`bottom-${index}`}
              onClick={() => router.push(item.href)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition duration-200 ${
                item.active
                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              role="button"
              tabIndex={0}
            >
              {renderIcon(item.icon)}
              <span className="text-sm font-medium leading-5">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* User Profile with Logout */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 overflow-hidden cursor-pointer flex items-center justify-center rounded-full bg-gray-200 shrink-0">
              {userDetails.profileImageUrl ? (
                <img
                  src={userDetails.profileImageUrl}
                  alt="profile"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const nextElement = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                style={{
                  display: userDetails.profileImageUrl ? "none" : "flex",
                }}
              >
                {getUserInitials()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userDetails.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userDetails.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors shrink-0 ml-2"
            title="Logout"
            aria-label="Logout"
          >
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
