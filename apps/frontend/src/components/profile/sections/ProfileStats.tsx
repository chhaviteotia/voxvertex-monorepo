"use client";

import { useEffect } from "react";
import { BarChart3 } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, selectProfile } from "@/store/slices/profileSlice";
import InfoCard from "../common/InfoCard";

/**
 * ProfileStats Component - Using Redux
 * Displays profile statistics
 */
const ProfileStats = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const isLoading = status === "loading" || status === "idle";

  // Calculate stats from profile data
  const stats = profile
    ? {
        totalExperience: profile.experience?.length || 0,
        totalEducation: profile.education?.length || 0,
        totalAwards: profile.awards?.length || 0,
        totalVideos: profile.featuredVideos?.length || 0,
        totalReviews: profile.reviews?.length || 0,
        averageRating: profile.ratings?.overall?.average || 0,
        profileViews: profile.stats?.profileViews || 0,
        totalBookings: profile.stats?.totalBookings || 0,
      }
    : null;

  if (isLoading) {
    return (
      <section className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
        <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
          <SectionHeader
            id="stats"
            icon={<BarChart3 />}
            title="Profile Statistics"
          />
          <div className="my-12 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        <SectionHeader
          id="stats"
          icon={<BarChart3 />}
          title="Profile Statistics"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 my-12">
          <InfoCard
            icon={BarChart3}
            value={stats.totalExperience || 0}
            label="Work Experience"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.totalEducation || 0}
            label="Education"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.totalAwards || 0}
            label="Awards"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.totalVideos || 0}
            label="Videos"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.totalReviews || 0}
            label="Reviews"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.averageRating?.toFixed(1) || "0.0"}
            label="Avg Rating"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.profileViews || 0}
            label="Profile Views"
          />
          <InfoCard
            icon={BarChart3}
            value={stats.totalBookings || 0}
            label="Total Bookings"
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileStats;
