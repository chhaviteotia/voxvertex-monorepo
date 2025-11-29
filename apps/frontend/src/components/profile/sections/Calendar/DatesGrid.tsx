"use client";

import { addDays, format, isSameMonth, isSameDay } from "date-fns";
import { memo } from "react";
import {
  getDateClassName,
  formatTimeSlotsForTimezone,
  getUserTimezone,
} from "@/utils/dateUtils";

// helper to compare dates only (yyyy-MM-dd)
const formatDateOnly = (date: Date | string) => {
  const d = new Date(date);
  // Since we store dates at midnight UTC, we need to handle timezone properly
  // Convert to UTC date string to avoid timezone issues
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface DatesGridProps {
  startDate: Date;
  endDate: Date;
  monthStart: Date;
  selectedDate: Date | null;
  multiSelect: boolean;
  selectedDates: Date[];
  availabilityData: any[];
  onDateClick: (date: Date) => void;
  modalOpen: boolean;
  setSelectedDate: (date: Date | null) => void;
  setSelectedDates: (dates: Date[] | ((prev: Date[]) => Date[])) => void;
}

const DatesGrid = memo(
  ({
    startDate,
    endDate,
    monthStart,
    selectedDate,
    multiSelect,
    selectedDates,
    availabilityData,
    onDateClick,
  }: DatesGridProps) => {
    const rows = [];
    let days = [];
    let day = startDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const inCurrentMonth = isSameMonth(day, monthStart);

        const isSelected =
          (multiSelect && selectedDates.some((d) => isSameDay(d, cloneDay))) ||
          (!multiSelect && selectedDate && isSameDay(cloneDay, selectedDate));

        // Only check availability if the day is in the current month
        const dayAvailability =
          inCurrentMonth &&
          availabilityData.find((a) => {
            // Compare dates properly by converting both to YYYY-MM-DD format
            const storedDateStr = formatDateOnly(a.date); // UTC date from database
            const localDateStr = format(cloneDay, "yyyy-MM-dd"); // Local date from calendar

            // Debug logging
            if (process.env.NODE_ENV === "development") {
              console.log("Date comparison:", {
                storedDate: a.date,
                storedDateStr,
                localDate: cloneDay,
                localDateStr,
                match: storedDateStr === localDateStr,
              });
            }

            return storedDateStr === localDateStr;
          });

        days.push(
          <div
            key={day.toString()}
            onClick={() => inCurrentMonth && onDateClick(cloneDay)}
            className={getDateClassName(cloneDay, inCurrentMonth, isSelected)}
            style={{ height: "105px", width: "135px" }}
          >
            {inCurrentMonth ? format(day, "d") : ""}

            {/* Availability slot(s) */}
            {dayAvailability && (
              <div className="mt-2 bg-[#FF6B35]/10 text-[#FF6B35] text-xs px-2 py-1 rounded-md">
                {(() => {
                  const userTimezone = getUserTimezone();
                  const formattedSlots = formatTimeSlotsForTimezone(
                    dayAvailability.timeSlots,
                    userTimezone,
                    cloneDay
                  );
                  return formattedSlots
                    .map((slot) => slot.displayTime)
                    .join(", ");
                })()}
              </div>
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-4" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mt-6 space-y-4">{rows}</div>;
  }
);

DatesGrid.displayName = "DatesGrid";

export default DatesGrid;
