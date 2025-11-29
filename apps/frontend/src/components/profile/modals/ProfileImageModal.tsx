"use client";

import { useState, useRef } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  uploadProfileImage,
  deleteProfileImage,
} from "@/services/profileService";
import { getProfileImageUrl } from "@/utils/profileImage";
import { useAppDispatch } from "@/store/hooks";
import { fetchCurrentUser, updateUser } from "@/store/slices/authSlice";
import { useGetCurrentUserQuery } from "@/store/hooks";

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentImageUrl?: string | null;
}

/**
 * ProfileImageModal - Improved with TypeScript
 * Modal for uploading/deleting profile image
 */
const ProfileImageModal = ({
  isOpen,
  onClose,
  onSave,
  currentImageUrl,
}: ProfileImageModalProps) => {
  const dispatch = useAppDispatch();
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadProfileImage(file);

      // Update Redux state with the new profile image
      if (response.data?.user) {
        const updatedUser = response.data.user;

        // The profileImageUrl will be processed by getProfileImageUrl utility
        // when displayed, so we can store it as-is (backend returns relative path)
        // Update user in Redux state immediately
        dispatch(updateUser(updatedUser));
        // Refetch current user query to update all components
        await refetchCurrentUser();
        // Also dispatch fetchCurrentUser as backup
        dispatch(fetchCurrentUser());
      }

      toast.success("Profile picture updated successfully!");
      setPreview(null);
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error?.message || "Failed to upload image. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await deleteProfileImage();

      // Update Redux state after deletion
      if (response.data?.user) {
        const updatedUser = response.data.user;
        dispatch(updateUser(updatedUser));
        // Refetch current user query to update all components
        await refetchCurrentUser();
        // Also dispatch fetchCurrentUser as backup
        dispatch(fetchCurrentUser());
      }

      toast.success("Profile picture deleted successfully!");
      setPreview(null);
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error deleting image:", error);
      const errorMessage =
        error?.message || "Failed to delete image. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const displayImage = preview || getProfileImageUrl(currentImageUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">Profile Picture</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-4xl">No Image</div>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-image-input"
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={20} />
                    Choose Image
                  </label>
                </div>

                <div className="flex gap-3">
                  {currentImageUrl && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !preview}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileImageModal;
