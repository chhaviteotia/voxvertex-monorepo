"use client";

import { useState, useEffect } from "react";
import { Video } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  removeVideoEntry,
  selectProfile,
} from "@/store/slices/profileSlice";
import AddVideoModal from "../modals/AddVideoModal";

/**
 * FeaturedVideos Component - Using Redux
 * Displays and manages featured videos
 */
const FeaturedVideos = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  const videos = profile?.featuredVideos || [];
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const handleDelete = async (videoId: string) => {
    try {
      await dispatch(removeVideoEntry(videoId)).unwrap();
      // Profile state automatically updates
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleAddClick = () => {
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Refetch profile to get latest data
    await dispatch(fetchProfile());
  };

  return (
    <section className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        <SectionHeader
          id="featuredVideos"
          icon={<Video />}
          title="Featured Videos"
          subTitle="Showcase your work and expertise"
          onAddClick={handleAddClick}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-12">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : videos.length > 0 ? (
            videos.map((video, index) => (
              <div
                key={video._id || index}
                className="bg-gray-100 rounded-lg overflow-hidden shadow-sm"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600">{video.platform}</p>
                  {video.duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {video.duration}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">
                No videos yet. Add your first featured video!
              </p>
              <button
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                onClick={handleAddClick}
              >
                Add Video
              </button>
            </div>
          )}
        </div>
      </div>

      <AddVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVideo(null);
        }}
        onSave={handleSave}
        editingVideo={editingVideo}
      />
    </section>
  );
};

export default FeaturedVideos;
