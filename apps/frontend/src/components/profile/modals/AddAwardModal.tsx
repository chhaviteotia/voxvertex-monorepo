"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { addAwardEntry, updateAwardEntry } from "@/store/slices/profileSlice";
import type { AwardData } from "@/services/profileService";

interface AddAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAward?: any;
  isLoading?: boolean;
}

/**
 * AddAwardModal - Matches old project UI
 * Modal for adding/editing awards/certifications
 */
const AddAwardModal = ({
  isOpen,
  onClose,
  onSave,
  editingAward,
  isLoading = false,
}: AddAwardModalProps) => {
  const dispatch = useAppDispatch();
  const [type, setType] = useState("");
  const [certificationName, setCertificationName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueMonth, setIssueMonth] = useState("");
  const [issueYear, setIssueYear] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showIssueMonthDropdown, setShowIssueMonthDropdown] = useState(false);
  const [showIssueYearDropdown, setShowIssueYearDropdown] = useState(false);
  const [showExpireMonthDropdown, setShowExpireMonthDropdown] = useState(false);
  const [showExpireYearDropdown, setShowExpireYearDropdown] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const issueMonthRef = useRef<HTMLDivElement>(null);
  const issueYearRef = useRef<HTMLDivElement>(null);
  const expireMonthRef = useRef<HTMLDivElement>(null);
  const expireYearRef = useRef<HTMLDivElement>(null);

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

  const parseDate = (dateStr: string) => {
    if (!dateStr) return { month: "", year: "" };
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const date = new Date(year, month - 1, 1);
      return {
        month: date.toLocaleString("default", { month: "long" }),
        year: year.toString(),
      };
    }
    return { month: "", year: "" };
  };

  const formatDate = (month: string, year: string) => {
    if (!month || !year) return "";
    const monthNum = getMonthNumber(month);
    return `01/${monthNum}/${year}`;
  };

  useEffect(() => {
    if (editingAward && isOpen) {
      setType(editingAward.category || "Other");
      setCertificationName(editingAward.title || "");
      setIssuingOrganization(editingAward.issuer || "");
      const issueDate = parseDate(editingAward.date || "");
      setIssueMonth(issueDate.month);
      setIssueYear(issueDate.year);
      setCredentialId("");
      setCredentialUrl(editingAward.url || "");
      setDescription(editingAward.description || "");
      setDoesNotExpire(true); // Awards typically don't expire
    } else if (isOpen) {
      setType("");
      setCertificationName("");
      setIssuingOrganization("");
      setIssueMonth("");
      setIssueYear("");
      setExpireMonth("");
      setExpireYear("");
      setDoesNotExpire(false);
      setCredentialId("");
      setCredentialUrl("");
      setDescription("");
    }
  }, [editingAward, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (
        issueMonthRef.current &&
        !issueMonthRef.current.contains(event.target as Node)
      ) {
        setShowIssueMonthDropdown(false);
      }
      if (
        issueYearRef.current &&
        !issueYearRef.current.contains(event.target as Node)
      ) {
        setShowIssueYearDropdown(false);
      }
      if (
        expireMonthRef.current &&
        !expireMonthRef.current.contains(event.target as Node)
      ) {
        setShowExpireMonthDropdown(false);
      }
      if (
        expireYearRef.current &&
        !expireYearRef.current.contains(event.target as Node)
      ) {
        setShowExpireYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const certificationTypes = [
    "Academic",
    "Professional",
    "Industry",
    "Community",
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

  const handleSave = async () => {
    if (
      !certificationName ||
      !issuingOrganization ||
      !issueMonth ||
      !issueYear
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const awardData: AwardData = {
        title: certificationName,
        issuer: issuingOrganization,
        date: formatDate(issueMonth, issueYear),
        description: description || undefined,
        category: type || "Other",
        url: credentialUrl || undefined,
      };

      if (editingAward?._id) {
        await dispatch(
          updateAwardEntry({
            awardId: editingAward._id,
            data: awardData,
          })
        ).unwrap();
        await onSave();
        onClose();
      } else {
        await dispatch(addAwardEntry(awardData)).unwrap();
        await onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error saving award:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save award. Please try again.";
      alert(errorMessage);
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
                    {editingAward
                      ? "Edit Award/Certification"
                      : "Add Certification"}
                  </h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    {editingAward
                      ? "Update your award or certification information"
                      : "Add a new certification to your profile."}
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
                <div className="relative" ref={typeRef}>
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Type *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                  >
                    <span className={type ? "text-black" : "text-gray-400"}>
                      {type || "Select type"}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-400"
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
                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                      {certificationTypes.map((certType) => (
                        <div
                          key={certType}
                          onClick={() => {
                            setType(certType);
                            setShowTypeDropdown(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                            type === certType ? "bg-orange-100" : ""
                          }`}
                        >
                          <div className="relative">
                            <input
                              type="radio"
                              name="type"
                              checked={type === certType}
                              readOnly
                              className="sr-only"
                            />
                            <div
                              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                type === certType
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {type === certType && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-sm ${
                              type === certType
                                ? "text-gray-900 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {certType}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. AWS Certified Solutions Architect"
                    value={certificationName}
                    onChange={(e) => setCertificationName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. Amazon Web Services"
                    value={issuingOrganization}
                    onChange={(e) => setIssuingOrganization(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-orange-500 mb-2">
                    Issue Date *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1" ref={issueMonthRef}>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Month *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowIssueMonthDropdown(!showIssueMonthDropdown)
                        }
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span
                          className={
                            issueMonth ? "text-black" : "text-gray-400"
                          }
                        >
                          {issueMonth || "Select month"}
                        </span>
                        <svg
                          className="w-3 h-3 text-gray-400"
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
                      {showIssueMonthDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                          {months.map((month) => (
                            <div
                              key={month}
                              onClick={() => {
                                setIssueMonth(month);
                                setShowIssueMonthDropdown(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                issueMonth === month ? "bg-orange-100" : ""
                              }`}
                            >
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="issueMonth"
                                  checked={issueMonth === month}
                                  readOnly
                                  className="sr-only"
                                />
                                <div
                                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    issueMonth === month
                                      ? "border-orange-500 bg-orange-500"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {issueMonth === month && (
                                    <svg
                                      className="w-2.5 h-2.5 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`text-sm ${
                                  issueMonth === month
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                {month}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1" ref={issueYearRef}>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Year *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowIssueYearDropdown(!showIssueYearDropdown)
                        }
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span
                          className={issueYear ? "text-black" : "text-gray-400"}
                        >
                          {issueYear || "Select year"}
                        </span>
                        <svg
                          className="w-3 h-3 text-gray-400"
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
                      {showIssueYearDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                          {years.map((year) => (
                            <div
                              key={year}
                              onClick={() => {
                                setIssueYear(year.toString());
                                setShowIssueYearDropdown(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                issueYear === year.toString()
                                  ? "bg-orange-100"
                                  : ""
                              }`}
                            >
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="issueYear"
                                  checked={issueYear === year.toString()}
                                  readOnly
                                  className="sr-only"
                                />
                                <div
                                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    issueYear === year.toString()
                                      ? "border-orange-500 bg-orange-500"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {issueYear === year.toString() && (
                                    <svg
                                      className="w-2.5 h-2.5 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`text-sm ${
                                  issueYear === year.toString()
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                {year}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Credential URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
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
                      ? editingAward
                        ? "Updating..."
                        : "Saving..."
                      : editingAward
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

export default AddAwardModal;
