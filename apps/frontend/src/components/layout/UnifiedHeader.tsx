"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import { LuBell } from "react-icons/lu";
import Logo from "@/components/common/Logo";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";

interface UnifiedHeaderProps {
  variant?: "public" | "authenticated" | "auto";
  user?: any;
  currentUserData?: any;
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

/**
 * UnifiedHeader Component - Improved with better structure and TypeScript
 * Handles both public and authenticated header variants
 */
const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  variant = "auto",
  user,
  currentUserData,
  className = "",
  showSearch = true,
  showNotifications = true,
  showProfile = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const { data: currentUserDataFromQuery } = useGetCurrentUserQuery();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use props or query data
  const finalUser = user || authUser || currentUserData?.user;
  const finalCurrentUserData = currentUserData || currentUserDataFromQuery;

  // Auto-detect variant based on authentication and pathname
  const getDetectedVariant = (): "public" | "authenticated" => {
    if (variant !== "auto") return variant;

    const isAuthenticated = !!finalUser;
    const isAuthenticatedPage =
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/booking") ||
      pathname?.startsWith("/messages") ||
      pathname?.startsWith("/dispute") ||
      pathname?.startsWith("/settings") ||
      pathname?.startsWith("/support") ||
      pathname?.startsWith("/notifications") ||
      pathname?.startsWith("/payments") ||
      pathname?.startsWith("/events");

    return isAuthenticated && isAuthenticatedPage ? "authenticated" : "public";
  };

  const detectedVariant = getDetectedVariant();
  const isAuthenticated = !!finalUser;
  const userRole = finalUser?.role;
  const isSpeaker = userRole === "speaker";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/speakers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  // Render authenticated header
  const renderAuthenticatedHeader = () => (
    <header className="fixed border-2 top-2 sm:top-4 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-8 w-auto h-20 sm:h-24 bg-[#FFFFFF] flex items-center justify-between text-[#000000] shadow-sm rounded-xl sm:rounded-2xl z-[100] px-2 sm:px-4 md:px-6 backdrop-blur-sm">
      <div className="flex items-center">
        <div onClick={() => router.push("/home")} className="cursor-pointer">
          <Logo />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
        {showNotifications && (
          <div
            className={`relative p-2 rounded-lg transition-colors duration-200 ${
              isSpeaker
                ? "cursor-pointer hover:bg-gray-100"
                : "cursor-not-allowed opacity-60"
            }`}
            onClick={
              isSpeaker ? () => router.push("/notifications") : undefined
            }
            title={
              !isSpeaker
                ? "Notifications available for speakers only"
                : "Notifications"
            }
            role={isSpeaker ? "button" : undefined}
            tabIndex={isSpeaker ? 0 : -1}
          >
            <LuBell className="w-5 h-5 sm:w-6 sm:h-6 font-[800]" />
          </div>
        )}

        {showProfile && (
          <div ref={dropdownRef}>
            <ProfileDropdown
              user={finalUser}
              currentUserData={finalCurrentUserData}
              showDropdown={showProfileDropdown}
              onToggleDropdown={() =>
                setShowProfileDropdown(!showProfileDropdown)
              }
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </header>
  );

  // Render public header
  const renderPublicHeader = () => (
    <header
      className={`bg-white h-20 flex items-center justify-center shadow-md ${className}`}
    >
      <div className="w-full px-4">
        <div className="flex items-center h-20">
          {/* Mobile Layout */}
          <div className="flex items-center justify-between w-full lg:hidden">
            <button
              onClick={() => setShowSidebar(true)}
              className="text-gray-900 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded-md p-1 shrink-0"
              aria-label="Open mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex-1 flex justify-center items-center min-w-0">
              <Logo absolute={true} className="scale-50" />
            </div>

            <div className="shrink-0">
              {isAuthenticated && finalUser ? (
                <div ref={dropdownRef}>
                  <ProfileDropdown
                    user={finalUser}
                    currentUserData={finalCurrentUserData}
                    showDropdown={showProfileDropdown}
                    onToggleDropdown={() =>
                      setShowProfileDropdown(!showProfileDropdown)
                    }
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-center w-full">
            <div className="shrink-0">
              <Logo absolute={true} />
            </div>

            {showSearch && (
              <div className="flex-1 max-w-xl ml-28">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center"
                >
                  <Search className="absolute left-3 top-0 bottom-0 m-auto text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Speaker"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-[#FF6B35]/70 rounded-full focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] focus:outline-none focus:ring-offset-0 text-sm bg-white"
                  />
                </form>
              </div>
            )}

            <nav className="flex items-center space-x-8 ml-auto">
              <button
                onClick={() => router.push("/about")}
                className={`cursor-pointer hidden lg:flex font-medium text-[16px] transition-colors duration-200 hover:scale-105 ${
                  pathname === "/about"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35] pb-1"
                    : "text-gray-900 hover:text-[#FF6B35]"
                }`}
              >
                About
              </button>
              <button
                onClick={() => router.push("/speakers")}
                className={`cursor-pointer hidden lg:flex font-medium text-[16px] transition-colors duration-200 hover:scale-105 ${
                  pathname === "/speakers"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35] pb-1"
                    : "text-gray-900 hover:text-[#FF6B35]"
                }`}
              >
                Speaker
              </button>
              <button
                onClick={() => router.push("/events")}
                className={`cursor-pointer hidden lg:flex font-medium text-[16px] transition-colors duration-200 hover:scale-105 ${
                  pathname === "/events"
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35] pb-1"
                    : "text-gray-900 hover:text-[#FF6B35]"
                }`}
              >
                Events
              </button>

              {isAuthenticated && finalUser ? (
                <div ref={dropdownRef}>
                  <ProfileDropdown
                    user={finalUser}
                    currentUserData={finalCurrentUserData}
                    showDropdown={showProfileDropdown}
                    onToggleDropdown={() =>
                      setShowProfileDropdown(!showProfileDropdown)
                    }
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <>
          <div
            className={`fixed inset-0 z-50 bg-black/50 bg-opacity-50 transition-opacity duration-300 lg:hidden`}
            onClick={() => setShowSidebar(false)}
          />
          <div
            className={`fixed top-0 left-0 h-full w-52 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden ${
              showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-6 border-b border-gray-200">
              <Logo />
            </div>
            <nav className="mt-6">
              <button
                onClick={() => {
                  router.push("/about");
                  setShowSidebar(false);
                }}
                className="w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">About</span>
              </button>
              <button
                onClick={() => {
                  router.push("/speakers");
                  setShowSidebar(false);
                }}
                className="w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Speaker</span>
              </button>
              <button
                onClick={() => {
                  router.push("/events");
                  setShowSidebar(false);
                }}
                className="w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Events</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );

  return detectedVariant === "authenticated"
    ? renderAuthenticatedHeader()
    : renderPublicHeader();
};

export default UnifiedHeader;
