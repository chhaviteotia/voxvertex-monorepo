"use client";

import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { getProfileImageUrl, getUserInitials } from "@/utils/profileImage";

interface ProfileDropdownProps {
  user: any;
  currentUserData?: any;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onLogout: () => void;
}

/**
 * Profile Dropdown Component - Extracted for better maintainability
 */
const ProfileDropdown = ({
  user,
  currentUserData,
  showDropdown,
  onToggleDropdown,
  onLogout,
}: ProfileDropdownProps) => {
  const router = useRouter();

  const finalUser = user || currentUserData?.user;
  const firstName = finalUser?.firstName || "";
  const lastName = finalUser?.lastName || "";
  const profileImageUrl = getProfileImageUrl(
    finalUser?.profileImageUrl || finalUser?.profileImage
  );
  const userRole = finalUser?.role;

  const getProfilePath = (): string => {
    switch (userRole) {
      case "speaker":
        return "/profile/speaker";
      case "organizer":
        return "/profile/organizer";
      case "participant":
        return "/profile/participant";
      default:
        return "/profile";
    }
  };

  const handleProfileClick = () => {
    router.push(getProfilePath());
    onToggleDropdown();
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    onToggleDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className="w-32 sm:w-36 md:w-40 h-8 sm:h-9 md:h-10 cursor-pointer flex items-center justify-between gap-1 sm:gap-2"
        aria-label="Profile menu"
        aria-expanded={showDropdown}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
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
              display: profileImageUrl ? "none" : "flex",
            }}
          >
            {getUserInitials(firstName, lastName)}
          </div>
        </div>
        <h2 className="text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
          {firstName && lastName ? `${firstName} ${lastName}` : "User"}
        </h2>
        <IoIosArrowDown className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
      </button>

      {/* Profile Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">My Account</h3>
          </div>

          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Profile
          </button>

          <button
            onClick={handleSettingsClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Settings
          </button>

          <button
            onClick={() => {
              onLogout();
              onToggleDropdown();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
