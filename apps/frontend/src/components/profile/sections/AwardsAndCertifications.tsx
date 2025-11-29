"use client";

import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  removeAwardEntry,
  selectProfile,
} from "@/store/slices/profileSlice";
import AddAwardModal from "../modals/AddAwardModal";

/**
 * AwardsAndCertifications Component - Using Redux
 * Displays and manages awards and certifications
 */
const AwardsAndCertifications = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<any>(null);

  const awards = profile?.awards || [];
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const handleDelete = async (awardId: string) => {
    try {
      await dispatch(removeAwardEntry(awardId)).unwrap();
      // Profile state automatically updates
    } catch (error) {
      console.error("Error deleting award:", error);
    }
  };

  const handleAddClick = () => {
    setEditingAward(null);
    setIsModalOpen(true);
  };

  const handleEdit = (award: any) => {
    setEditingAward(award);
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
          id="awardsAndCertifications"
          icon={<Award />}
          title="Awards & Certifications"
          subTitle="Recognition and achievements"
          onAddClick={handleAddClick}
        />

        <div className="space-y-2 my-12">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-4 border-b border-orange-100"
                >
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : awards.length > 0 ? (
            awards.map((award, index) => (
              <div
                key={award._id || index}
                className="flex justify-between items-start py-4 border-b border-orange-100"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {award.title}
                  </h3>
                  <p className="text-gray-600">{award.issuer}</p>
                  <p className="text-sm text-gray-500">{award.date}</p>
                  {award.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {award.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(award)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(award._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No awards or certifications added yet.</p>
              <p className="text-sm mt-1">
                Click the "+" button to add your first one!
              </p>
            </div>
          )}
        </div>
      </div>

      <AddAwardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAward(null);
        }}
        onSave={handleSave}
        editingAward={editingAward}
        isLoading={status === "loading"}
      />
    </section>
  );
};

export default AwardsAndCertifications;
