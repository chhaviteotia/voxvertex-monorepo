"use client";

import { useState } from "react";
import { RiEditBoxFill } from "react-icons/ri";
import { MdOutlineCameraAlt } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";
import { getProfileImageUrl, getUserInitials } from "@/utils/profileImage";
import EditProfileModal from "../../modals/EditProfileModal";
import ProfileImageModal from "../../modals/ProfileImageModal";

interface HeaderSectionProps {
  name: string;
  role: string;
  description: string;
  domains: string[];
  profilePic?: string | null;
}

/**
 * HeaderSection Component - Improved with TypeScript
 * Displays user profile header with picture, name, role, description, and domains
 */
const HeaderSection = ({
  name,
  role,
  description,
  domains,
  profilePic,
}: HeaderSectionProps) => {
  const auth = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const visibleDomains = domains.slice(0, 3);
  const remainingCount = domains.length - visibleDomains.length;

  const profileImageUrl = getProfileImageUrl(
    auth.user?.profileImageUrl ||
      currentUserData?.user?.profileImageUrl ||
      profilePic
  );

  const firstName = auth.user?.firstName || currentUserData?.user?.firstName;
  const lastName = auth.user?.lastName || currentUserData?.user?.lastName;
  const initials = getUserInitials(firstName, lastName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex items-start justify-between bg-[#FF6B35] p-3 sm:p-4 md:p-5 rounded-tr-lg"
      style={{ minHeight: "193px", height: "auto" }}
    >
      {/* Profile Picture */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[128px] h-[138px] bg-white rounded-lg p-[5px] relative shrink-0"
      >
        {profileImageUrl ? (
          <img
            key={profileImageUrl}
            src={profileImageUrl}
            className="w-full h-full object-cover object-center rounded-lg"
            alt="Profile"
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
        {/* Text-based initials fallback */}
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl rounded-lg"
          style={{
            display: profileImageUrl ? "none" : "flex",
          }}
        >
          {initials}
        </div>

        {/* Camera icon button */}
        <motion.div
          onClick={() => setIsImageModalOpen(true)}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute -bottom-3 -right-1 w-[50px] h-[50px] p-3 bg-[#FF6B35] flex items-center justify-center rounded-full shadow-md cursor-pointer"
          title="Change profile picture"
        >
          <MdOutlineCameraAlt className="text-white text-2xl" />
        </motion.div>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col w-full mx-4 text-white justify-between"
        style={{ minHeight: "138px", height: "auto" }}
      >
        <div>
          <h1 className="font-semibold text-black text-[25px]">{name}</h1>
          <p
            className="text-[16px] opacity-90 font-medium"
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={role}
          >
            {role}
          </p>
        </div>

        <p
          className="text-[13px] leading-relaxed mt-1"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            width: "100%",
            maxWidth: "850px",
          }}
          title={description}
        >
          {description}
        </p>

        {/* Domains */}
        {domains.length > 0 && (
          <motion.div
            className="flex gap-2 mt-3 flex-wrap"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {visibleDomains.map((domain, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                }}
                className="bg-white/30 text-white px-3 py-1 rounded-xl text-sm font-medium shadow border border-white/60"
                style={{
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={domain}
              >
                {domain}
              </motion.span>
            ))}
            {remainingCount > 0 && (
              <motion.span
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                }}
                className="bg-white/30 text-white px-3 py-1 rounded-md text-sm font-medium shadow border border-white/60"
              >
                +{remainingCount}
              </motion.span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Edit Button */}
      <motion.button
        onClick={() => setIsEditProfileOpen(true)}
        whileHover={{
          color: "#FF6B35",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="w-[140px] h-[35px] bg-white text-black rounded-md shadow font-medium text-sm transition flex items-center justify-center gap-1 px-2 cursor-pointer shrink-0"
        aria-label="Edit profile"
      >
        <RiEditBoxFill />
        Edit Profile
      </motion.button>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={async () => {
          setIsEditProfileOpen(false);
          // The modal already updates Redux state via updateProfileBio thunk
          // No need to reload - state will update automatically
        }}
      />

      {/* Profile Image Modal */}
      <ProfileImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSave={async () => {
          setIsImageModalOpen(false);
          // Force a small delay to ensure Redux state is updated before component re-renders
          await new Promise((resolve) => setTimeout(resolve, 100));
        }}
        currentImageUrl={profileImageUrl}
      />
    </motion.div>
  );
};

export default HeaderSection;
