"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import {
  addWorkExperience,
  updateWorkExperience,
} from "@/store/slices/profileSlice";
import type { ExperienceData } from "@/services/profileService";

interface AddWorkExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingExperience?: any;
  isLoading?: boolean;
}

/**
 * AddWorkExperienceModal - Matches old project UI
 * Modal for adding/editing work experience with month/year dropdowns
 */
const AddWorkExperienceModal = ({
  isOpen,
  onClose,
  onSave,
  editingExperience,
  isLoading = false,
}: AddWorkExperienceModalProps) => {
  const dispatch = useAppDispatch();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [description, setDescription] = useState("");
  const [showEmploymentDropdown, setShowEmploymentDropdown] = useState(false);
  const [showStartMonthDropdown, setShowStartMonthDropdown] = useState(false);
  const [showStartYearDropdown, setShowStartYearDropdown] = useState(false);
  const [showEndMonthDropdown, setShowEndMonthDropdown] = useState(false);
  const [showEndYearDropdown, setShowEndYearDropdown] = useState(false);

  const employmentRef = useRef<HTMLDivElement>(null);
  const startMonthRef = useRef<HTMLDivElement>(null);
  const startYearRef = useRef<HTMLDivElement>(null);
  const endMonthRef = useRef<HTMLDivElement>(null);
  const endYearRef = useRef<HTMLDivElement>(null);

  // Helper to convert month name to number
  const getMonthNumber = (monthName: string) => {
    const months: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
  };

  // Convert dd/mm/yyyy to month/year format
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { month: "", year: "" };
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const date = new Date(year, month - 1, day);
      return {
        month: date.toLocaleString("default", { month: "long" }),
        year: year.toString(),
      };
    }
    return { month: "", year: "" };
  };

  // Convert month/year to dd/mm/yyyy format
  const formatDate = (month: string, year: string) => {
    if (!month || !year) return "";
    const monthNum = getMonthNumber(month);
    return `01/${monthNum}/${year}`;
  };

  useEffect(() => {
    if (editingExperience && isOpen) {
      setJobTitle(editingExperience.title || "");
      setCompany(editingExperience.organization || "");
      // Normalize employment type to match backend enum values
      const normalizedType = editingExperience.type
        ? editingExperience.type
            .replace("Full-Time", "Full-time")
            .replace("Part-Time", "Part-time")
        : "";
      setEmploymentType(normalizedType || "");
      setLocation(editingExperience.location || "");

      const startDate = parseDate(editingExperience.start || "");
      setStartMonth(startDate.month);
      setStartYear(startDate.year);

      const endDate = parseDate(editingExperience.end || "");
      setEndMonth(endDate.month);
      setEndYear(endDate.year);

      setIsCurrentlyWorking(
        !editingExperience.end || editingExperience.end === "Present"
      );
      setDescription(editingExperience.description || "");
    } else if (isOpen) {
      // Reset form
      setJobTitle("");
      setCompany("");
      setEmploymentType("");
      setLocation("");
      setStartMonth("");
      setStartYear("");
      setEndMonth("");
      setEndYear("");
      setIsCurrentlyWorking(false);
      setDescription("");
    }
  }, [editingExperience, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        employmentRef.current &&
        !employmentRef.current.contains(event.target as Node)
      ) {
        setShowEmploymentDropdown(false);
      }
      if (
        startMonthRef.current &&
        !startMonthRef.current.contains(event.target as Node)
      ) {
        setShowStartMonthDropdown(false);
      }
      if (
        startYearRef.current &&
        !startYearRef.current.contains(event.target as Node)
      ) {
        setShowStartYearDropdown(false);
      }
      if (
        endMonthRef.current &&
        !endMonthRef.current.contains(event.target as Node)
      ) {
        setShowEndMonthDropdown(false);
      }
      if (
        endYearRef.current &&
        !endYearRef.current.contains(event.target as Node)
      ) {
        setShowEndYearDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Body scroll lock
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

  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
    "Other",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !jobTitle ||
      !company ||
      !employmentType ||
      !location ||
      !startMonth ||
      !startYear ||
      !description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!isCurrentlyWorking && (!endMonth || !endYear)) {
      alert("Please fill in end date or mark as currently working");
      return;
    }

    setIsSubmitting(true);
    try {
      const experienceData: ExperienceData = {
        title: jobTitle.trim(),
        organization: company.trim(),
        type: employmentType || "Full-time", // Default to Full-time if not set
        location: location?.trim() || undefined,
        start: formatDate(startMonth, startYear),
        end: isCurrentlyWorking ? undefined : formatDate(endMonth, endYear),
        description: description?.trim() || undefined,
      };

      if (editingExperience?._id) {
        await dispatch(
          updateWorkExperience({
            experienceId: editingExperience._id,
            data: experienceData,
          })
        ).unwrap();
        await onSave(); // Wait for onSave to complete
        onClose();
      } else {
        await dispatch(addWorkExperience(experienceData)).unwrap();
        await onSave(); // Wait for onSave to complete
        onClose();
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save work experience. Please try again.";
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
                    {editingExperience
                      ? "Edit Work Experience"
                      : "Add Work Experience"}
                  </h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    {editingExperience
                      ? "Update your work experience information"
                      : "Add a new work experience to your profile"}
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

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div>
                  <h3 className="text-[11px] font-medium text-orange-500 mb-4">
                    How would you like to add your work experience?
                  </h3>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Company *
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                      required
                    />
                  </div>
                  <div className="relative flex-1" ref={employmentRef}>
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Employment Type *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowEmploymentDropdown(!showEmploymentDropdown)
                      }
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                    >
                      <span
                        className={
                          employmentType ? "text-black" : "text-gray-400"
                        }
                      >
                        {employmentType || "Select employment type"}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {showEmploymentDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                        {employmentTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setEmploymentType(type);
                              setShowEmploymentDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                              employmentType === type
                                ? "bg-orange-100 text-orange-600"
                                : "text-gray-700"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-orange-500 mb-2">
                    Start Date *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1" ref={startMonthRef}>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Month *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowStartMonthDropdown(!showStartMonthDropdown)
                        }
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span
                          className={
                            startMonth ? "text-black" : "text-gray-400"
                          }
                        >
                          {startMonth || "Select month"}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {showStartMonthDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                          {months.map((month) => (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                setStartMonth(month);
                                setShowStartMonthDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                startMonth === month
                                  ? "bg-orange-100 text-orange-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1" ref={startYearRef}>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Year *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowStartYearDropdown(!showStartYearDropdown)
                        }
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span
                          className={startYear ? "text-black" : "text-gray-400"}
                        >
                          {startYear || "Select year"}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {showStartYearDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                          {years.map((year) => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setStartYear(year.toString());
                                setShowStartYearDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                startYear === year.toString()
                                  ? "bg-orange-100 text-orange-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currently-working"
                    checked={isCurrentlyWorking}
                    onChange={(e) => setIsCurrentlyWorking(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-400 focus:ring-2"
                  />
                  <label
                    htmlFor="currently-working"
                    className="text-[11px] text-orange-500"
                  >
                    I am currently working in this role
                  </label>
                </div>

                {!isCurrentlyWorking && (
                  <div>
                    <label className="block text-[11px] font-medium text-orange-500 mb-2">
                      End Date *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1" ref={endMonthRef}>
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                          Month *
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setShowEndMonthDropdown(!showEndMonthDropdown)
                          }
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                        >
                          <span
                            className={
                              endMonth ? "text-black" : "text-gray-400"
                            }
                          >
                            {endMonth || "Select month"}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {showEndMonthDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                            {months.map((month) => (
                              <button
                                key={month}
                                type="button"
                                onClick={() => {
                                  setEndMonth(month);
                                  setShowEndMonthDropdown(false);
                                }}
                                className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                  endMonth === month
                                    ? "bg-orange-100 text-orange-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1" ref={endYearRef}>
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                          Year *
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setShowEndYearDropdown(!showEndYearDropdown)
                          }
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                        >
                          <span
                            className={endYear ? "text-black" : "text-gray-400"}
                          >
                            {endYear || "Select year"}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {showEndYearDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                            {years.map((year) => (
                              <button
                                key={year}
                                type="button"
                                onClick={() => {
                                  setEndYear(year.toString());
                                  setShowEndYearDropdown(false);
                                }}
                                className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                  endYear === year.toString()
                                    ? "bg-orange-100 text-orange-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none"
                    required
                  />
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
                    disabled={isSubmitting || isLoading}
                    className={`px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting || isLoading
                        ? "opacity-70 cursor-not-allowed"
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
                      ? editingExperience
                        ? "Updating..."
                        : "Saving..."
                      : editingExperience
                      ? "Update"
                      : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddWorkExperienceModal;
