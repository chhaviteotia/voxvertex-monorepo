"use client";

import { useState, useEffect } from "react";
import { getUserTimezone } from "@/utils/dateUtils";

const TimezoneInfo = () => {
  const [userTimezone, setUserTimezone] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timezone = getUserTimezone();
    setUserTimezone(timezone);

    // Update current time every minute
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getTimezoneDisplayName = (timezone: string) => {
    const timezoneNames: Record<string, string> = {
      "Asia/Kolkata": "India Standard Time (IST)",
      "Europe/London": "Greenwich Mean Time (GMT)",
      "America/New_York": "Eastern Time (ET)",
      "America/Los_Angeles": "Pacific Time (PT)",
      "Europe/Paris": "Central European Time (CET)",
      "Asia/Tokyo": "Japan Standard Time (JST)",
      "Australia/Sydney": "Australian Eastern Time (AET)",
    };

    return timezoneNames[timezone] || timezone;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-800 font-medium">
            Your Timezone: {getTimezoneDisplayName(userTimezone)}
          </p>
          <p className="text-xs text-blue-600">Current Time: {currentTime}</p>
        </div>
        <div className="text-xs text-blue-500">
          <p>Availability times are shown</p>
          <p>in your local timezone</p>
        </div>
      </div>
    </div>
  );
};

export default TimezoneInfo;
