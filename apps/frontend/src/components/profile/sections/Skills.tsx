"use client";

import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  updateProfileSkills,
  selectProfile,
} from "@/store/slices/profileSlice";
import type { SkillData } from "@/services/profileService";

/**
 * Skills Component - Using Redux
 * Displays and manages user skills
 */
const Skills = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [localSkills, setLocalSkills] = useState<SkillData[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "Intermediate" as const,
    yearsOfExperience: 0,
  });

  const skills = profile?.skills || [];
  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    } else if (profile.skills) {
      setLocalSkills(Array.isArray(profile.skills) ? profile.skills : []);
    }
  }, [dispatch, profile]);

  // Sync local skills with Redux state when not editing
  useEffect(() => {
    if (!isEditing && profile?.skills) {
      setLocalSkills(Array.isArray(profile.skills) ? profile.skills : []);
    }
  }, [isEditing, profile?.skills]);

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setLocalSkills([...localSkills, { ...newSkill }]);
      setNewSkill({ name: "", level: "Intermediate", yearsOfExperience: 0 });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setLocalSkills(localSkills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfileSkills(localSkills)).unwrap();
      setIsEditing(false);
      // Profile state automatically updates
    } catch (error) {
      console.error("Error saving skills:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save skills. Please try again.";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset to Redux state
    if (profile?.skills) {
      setLocalSkills(Array.isArray(profile.skills) ? profile.skills : []);
    }
    setIsEditing(false);
  };

  return (
    <section className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        <SectionHeader
          id="skills"
          icon={<Brain />}
          title="Skills & Expertise"
          subTitle="Showcase your professional skills"
          onAddClick={isEditing ? undefined : () => setIsEditing(true)}
        />

        <div className="my-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {localSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{skill.name}</span>
                        {skill.level && (
                          <span className="text-xs opacity-75">
                            ({skill.level})
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      placeholder="Add skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddSkill();
                        }
                      }}
                    />
                    <select
                      value={newSkill.level}
                      onChange={(e) =>
                        setNewSkill({
                          ...newSkill,
                          level: e.target.value as SkillData["level"],
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="ml-1 text-xs opacity-75">
                            ({skill.level})
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No skills added yet. Click "Add" to get started.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Skills;
