"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";

interface SpeakerDatabaseProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export default function SpeakerDatabasePage({
  onTabChange,
  activeTab = "Speaker Database",
}: SpeakerDatabaseProps) {
  // Feature flags - Set to true to enable search/filter functionality
  const ENABLE_SEARCH = false; // TODO: Set to true when search is ready

  // Local state for UI
  const [sortBy, setSortBy] = useState("relevance");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All Tags");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Mock data for now - will be replaced with actual API calls
  const [savedSpeakers, setSavedSpeakers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process speakers data
  const processedSpeakers = useMemo(() => {
    if (!savedSpeakers || savedSpeakers.length === 0) {
      return [];
    }

    return savedSpeakers.map((speaker: any) => {
      const {
        _id,
        firstName,
        lastName,
        fullName,
        email,
        mobileNo,
        profileImageUrl,
        bio,
        professionalTitle,
        location,
        areaOfExpertise,
        yearsOfExperience,
        customTags,
      } = speaker;

      // Merge custom tags with areaOfExpertise
      const allTags = [...(areaOfExpertise || []), ...(customTags || [])];
      const mergedTags = [...new Set(allTags)];

      // Create specializations from merged tags
      const specializations = [...mergedTags].filter(
        (spec, index, arr) => arr.indexOf(spec) === index
      );

      // Calculate rating and bookings (mock data for now)
      const rating = 4.5;
      const totalBookings = 0;

      // Create price range (mock data for now)
      const priceRange = {
        min: 3000,
        max: 10000,
        currency: "INR",
      };

      return {
        _id: _id,
        fullName:
          fullName ||
          `${firstName || ""} ${lastName || ""}`.trim() ||
          "Speaker",
        name:
          fullName ||
          `${firstName || ""} ${lastName || ""}`.trim() ||
          "Speaker",
        title: professionalTitle || "Speaker",
        rating: rating,
        bookings: totalBookings,
        location: location || "Location not specified",
        price: priceRange.min,
        priceRange: priceRange,
        tags: mergedTags,
        specializations: specializations,
        specialization: "General",
        avatar: profileImageUrl,
        bio: bio,
        yearsOfExperience: yearsOfExperience || 0,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobileNo: mobileNo,
        createdAt: new Date().toISOString(),
        isSavedSpeaker: true,
        customTags: customTags || [],
        savedSpeakerId: _id,
        notes: "",
      };
    });
  }, [savedSpeakers]);

  // Sort speakers
  const sortedSpeakers = useMemo(() => {
    const sorted = [...processedSpeakers];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "experience":
        return sorted.sort(
          (a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
        );
      case "reviews":
        return sorted.sort((a, b) => b.bookings - a.bookings);
      default:
        return sorted;
    }
  }, [processedSpeakers, sortBy]);

  const handleAddSpeaker = () => {
    // Navigate to add speaker page
    console.log("Navigate to add speaker page");
    // TODO: Implement navigation to speaker search/add page
  };

  const getEmptyState = (
    icon: React.ReactNode,
    title: string,
    description: string
  ) => (
    <div className="flex flex-col items-center justify-center text-center text-gray-500 py-20">
      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{description}</p>
    </div>
  );

  let content: React.ReactNode;

  if (isLoading && processedSpeakers.length === 0) {
    content = getEmptyState(
      <Loader2 className="h-12 w-12 animate-spin text-orange-500" />,
      "Loading speakers",
      "Please wait while we fetch your saved speakers."
    );
  } else if (error) {
    content = getEmptyState(
      <AlertCircle className="w-8 h-8 text-red-500" />,
      "Error loading speakers",
      "Something went wrong while fetching speakers."
    );
  } else if (sortedSpeakers.length === 0) {
    content = getEmptyState(
      <AlertCircle className="w-8 h-8 text-orange-400" />,
      "No saved speakers found",
      "You haven't saved any speakers yet. Save speakers from the main speaker list to see them here."
    );
  } else {
    // TODO: Replace with actual SpeakerCard component when available
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedSpeakers.map((speaker) => (
          <div
            key={speaker._id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                {speaker.avatar ? (
                  <img
                    src={speaker.avatar}
                    alt={speaker.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-orange-600">
                    {speaker.firstName?.[0] || "S"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {speaker.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {speaker.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{speaker.location}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {speaker.tags?.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {speaker.tags?.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{speaker.tags.length - 3}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium text-gray-700">
                  {speaker.rating}
                </span>
              </div>
              <button className="px-4 py-2 bg-[#FF6B35] text-white text-sm rounded-lg hover:bg-[#E55A2B] transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-32">
        <div className="pb-6">
          {/* Header */}
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">
              Speaker Management
            </h1>
            <p className="text-white">
              Browse and discover speakers from our database
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 p-1 rounded-lg mt-4 mb-6 flex">
            <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
              Speaker Database
            </button>
            <button
              onClick={() => onTabChange?.("Speaker Management")}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md font-medium"
            >
              Speaker Management
            </button>
            <button
              onClick={() => onTabChange?.("Documents")}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Documents
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Saved Speakers Database
                </h2>
                <p className="text-gray-600">
                  Manage your saved speakers with custom tags and notes
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {processedSpeakers.length} saved speakers
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low">Sort: Price (Low to High)</option>
                  <option value="price-high">Sort: Price (High to Low)</option>
                  <option value="rating">Sort: Rating</option>
                  <option value="experience">Sort: Experience</option>
                  <option value="reviews">Sort: Bookings</option>
                </select>
                <button
                  onClick={handleAddSpeaker}
                  className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-md font-medium hover:bg-[#E55A2B] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Speaker
                </button>
              </div>
            </div>

            {ENABLE_SEARCH && (
              <div className="flex flex-col gap-4 mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Search saved speakers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
