"use client";

import { useState, useEffect } from "react";
import { MdWork } from "react-icons/md";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  removeWorkExperience,
  selectProfile,
} from "@/store/slices/profileSlice";
import AddWorkExperienceModal from "../modals/AddWorkExperienceModal";

/**
 * WorkExperience Component - Using Redux
 * Displays and manages work experience entries
 */
const WorkExperience = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const experiences = profile?.experience || [];
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const handleDelete = async (experienceId: string) => {
    try {
      await dispatch(removeWorkExperience(experienceId)).unwrap();
      // Profile state automatically updates
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const handleAddClick = () => {
    setEditingExperience(null);
    setIsModalOpen(true);
  };

  const handleEdit = (exp: any) => {
    setEditingExperience(exp);
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
          id="workExperience"
          icon={<MdWork />}
          title="Work Experience"
          subTitle="Professional journey and achievements"
          onAddClick={handleAddClick}
        />

        <div className="space-y-6 my-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : experiences.length > 0 ? (
            experiences.map((exp, index) => (
              <div
                key={exp._id || index}
                className="flex justify-between items-start pb-4 border-b-2 border-[#FF6B35]/9"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exp.title}
                  </h3>
                  <p className="text-gray-600">{exp.organization}</p>
                  <p className="text-sm text-gray-500">
                    {exp.start} - {exp.end || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No work experience added yet. Click "Add" to get started.</p>
            </div>
          )}
        </div>
      </div>

      <AddWorkExperienceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExperience(null);
        }}
        onSave={handleSave}
        editingExperience={editingExperience}
        isLoading={status === "loading"}
      />
    </section>
  );
};

export default WorkExperience;
