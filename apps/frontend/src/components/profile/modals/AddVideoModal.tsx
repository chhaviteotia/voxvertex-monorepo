"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { addVideoEntry, updateVideoEntry } from "@/store/slices/profileSlice";
import type { VideoData } from "@/services/profileService";

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingVideo?: any;
  isLoading?: boolean;
}

/**
 * AddVideoModal - Simple modal for adding/editing videos
 * Matches old project UI style
 */
const AddVideoModal = ({
  isOpen,
  onClose,
  onSave,
  editingVideo,
  isLoading = false,
}: AddVideoModalProps) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingVideo && isOpen) {
      setTitle(editingVideo.title || "");
      setPlatform(editingVideo.platform || "YouTube");
      setVideoUrl(editingVideo.videoUrl || "");
      setDescription(editingVideo.description || "");
    } else if (isOpen) {
      setTitle("");
      setPlatform("YouTube");
      setVideoUrl("");
      setDescription("");
    }
  }, [editingVideo, isOpen]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title || !videoUrl || !platform) {
      alert(
        "Please fill in all required fields (Title, Platform, and Video URL)"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const videoData: VideoData = {
        title: title.trim(),
        platform: platform,
        videoUrl: videoUrl.trim(),
        description: description?.trim() || undefined,
      };

      if (editingVideo?._id) {
        await dispatch(
          updateVideoEntry({
            videoId: editingVideo._id,
            data: videoData,
          })
        ).unwrap();
        await onSave();
        onClose();
      } else {
        await dispatch(addVideoEntry(videoData)).unwrap();
        await onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error saving video:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save video. Please try again.";
      alert(errorMessage);
      // Don't close modal on error so user can fix and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-orange-500">
                    {editingVideo ? "Edit Video" : "Add Featured Video"}
                  </h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    {editingVideo
                      ? "Update your video information"
                      : "Add a video to showcase your work and expertise."}
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

              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-[11px] font-medium text-orange-500 mb-4">
                    How would you like to add your video?
                  </h3>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Platform *
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Vimeo">Vimeo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Video URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this video is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSubmitting || isLoading}
                    className={`px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {(isSubmitting || isLoading) && (
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
                    {isSubmitting || isLoading
                      ? editingVideo
                        ? "Updating..."
                        : "Saving..."
                      : editingVideo
                      ? "Update"
                      : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddVideoModal;
