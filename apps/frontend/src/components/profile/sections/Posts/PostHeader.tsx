"use client";

import { CiFileOn } from "react-icons/ci";
import EventIcon from "@/components/profile/common/EventIcon";

interface PostHeaderProps {
  recentPosts: any[];
}

const PostHeader = ({ recentPosts }: PostHeaderProps) => {
  return (
    <div className="bg-[#FF6B35] text-white p-6 rounded-tr-xl flex items-center justify-between">
      <div className="flex items-center ">
        <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center mr-4">
          <CiFileOn className="text-3xl stroke-1" />
        </div>
        <div>
          <h2 className="text-xl font-semibold leading-[150.7%] tracking-[8%]">
            Share Your Thoughts
          </h2>
          <p className="text-sm opacity-90 leading-[150.7%] tracking-[8%]">
            Connect with your professional network
          </p>
        </div>
      </div>

      <div className="flex items-center text-sm">
        <div className="flex items-center justify-between gap-3 ">
          <EventIcon width="22" height="22" textcolor="#ffffff" />
          <span>{recentPosts?.length || 0} posts</span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
