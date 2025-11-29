"use client";

import { useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, selectProfile } from "@/store/slices/profileSlice";

/**
 * Reviews Component - Using Redux
 * Displays and manages user reviews
 */
const Reviews = () => {
  const dispatch = useAppDispatch();
  const { data: profile, status } = useAppSelector(selectProfile);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  const reviews = profile?.reviews || [];
  const ratings = profile?.ratings || null;
  const isLoading = status === "loading" || status === "idle";

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <section className="w-full bg-[#ffffff] py-4 shadow-md rounded-[13.01px] rounded-tl-none rounded-bl-none">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        <SectionHeader
          id="reviews"
          icon={<MessageSquare />}
          title="Reviews & Ratings"
          subTitle="What others say about you"
        />

        {ratings && (
          <div className="my-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-orange-600">
                {ratings.overall?.average?.toFixed(1) || "0.0"}
              </div>
              <div>
                {renderStars(Math.round(ratings.overall?.average || 0))}
                <p className="text-sm text-gray-600 mt-1">
                  {ratings.overall?.count || 0} reviews
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 my-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-pulse">Loading reviews...</div>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div
                key={review._id || index}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.reviewerName || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                {review.remarks && (
                  <p className="text-gray-700 mt-2">{review.remarks}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No reviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
