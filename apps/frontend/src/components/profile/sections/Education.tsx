"use client";

import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  removeEducationEntry,
  selectProfile,
} from "@/store/slices/profileSlice";
import AddEducationModal from "../modals/AddEducationModal";

/**
 * Education Component - Using Redux
 * Displays and manages education entries
 */
const Education = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

  const educations = profile?.education || [];
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const handleDelete = async (educationId: string) => {
    try {
      await dispatch(removeEducationEntry(educationId)).unwrap();
      // Profile state automatically updates
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  const handleAddClick = () => {
    setEditingEducation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (edu: any) => {
    setEditingEducation(edu);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Refetch profile to get latest data
    await dispatch(fetchProfile());
  };

  return (
    <div className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        <SectionHeader
          id="education"
          icon={<GraduationCap />}
          title="Education"
          subTitle="Academic background and qualifications"
          onAddClick={handleAddClick}
        />

        <div className="space-y-6 my-12">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center pb-4 border-b-2 border-[#FF6B35]/9"
                >
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : educations.length > 0 ? (
            educations.map((edu, index) => (
              <div
                key={edu._id || index}
                className="flex justify-between items-start pb-4 border-b-2 border-[#FF6B35]/9"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {edu.degree}
                  </h3>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.field} • {edu.start} - {edu.end || "Present"}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-gray-600 mt-1">
                      Grade: {edu.grade}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(edu._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No education entries added yet.</p>
              <p className="text-sm mt-1">
                Click the "+" button to add your first one!
              </p>
            </div>
          )}
        </div>
      </div>

      <AddEducationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEducation(null);
        }}
        onSave={handleSave}
        editingEducation={editingEducation}
        isLoading={status === "loading"}
      />
    </div>
  );
};

export default Education;
