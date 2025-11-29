"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { updateProfileBio } from "@/store/slices/profileSlice";
import { updateUserBio } from "@/store/slices/authSlice";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

/**
 * EditProfileModal - Matches old project UI
 * Modal for editing profile information
 */
const EditProfileModal = ({
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalWasOpenRef = useRef(false);

  // Initialize bio ONLY when modal opens (not when user data changes)
  useEffect(() => {
    if (isOpen && !modalWasOpenRef.current) {
      // Modal just opened - try to initialize bio from user data
      const user = currentUserData?.user || auth.user;
      if (user) {
        setBio((user as any)?.bio || "");
        modalWasOpenRef.current = true;
      }
    } else if (!isOpen) {
      // Modal closed - reset for next time
      setBio("");
      modalWasOpenRef.current = false;
    }
    // Only depend on isOpen - user data changes won't reset bio during typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Initialize bio if user data loads after modal opens (only once)
  useEffect(() => {
    if (isOpen && !modalWasOpenRef.current) {
      const user = currentUserData?.user || auth.user;
      if (user) {
        setBio((user as any)?.bio || "");
        modalWasOpenRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserData?.user, auth.user]); // Only initialize if user data becomes available

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const result = await dispatch(updateProfileBio(bio)).unwrap();

      // Update auth state with new bio so AboutUser component reflects changes immediately
      // Extract bio from the profile response if available, otherwise use the bio we just set
      const updatedBio = result?.data?.user?.bio || result?.data?.bio || bio;
      dispatch(updateUserBio(updatedBio));

      await onSave();
      onClose();
    } catch (error) {
      console.error("Error updating bio:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update bio. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Close modal only if clicking on the backdrop (not on modal content)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-orange-500">
                  Edit Profile
                </h2>
                <p className="text-gray-500 text-[11px] mt-1">
                  Update your personal and professional information.
                </p>
                <p className="text-[11px] text-gray-400 mt-2">
                  * Indicates required
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="relative">
                <label
                  htmlFor="bio-textarea"
                  className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-30 pointer-events-none"
                >
                  Bio / Description * ({bio.length}/500)
                </label>
                <textarea
                  id="bio-textarea"
                  name="bio"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value.slice(0, 500)); // Limit to 500 chars
                  }}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none relative z-20"
                  placeholder="Tell us about yourself..."
                  required
                  tabIndex={0}
                />
                {bio.length > 450 && (
                  <p className="text-[10px] text-orange-500 mt-1">
                    {500 - bio.length} characters remaining
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
