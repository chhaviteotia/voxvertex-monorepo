"use client";

import { useEffect, useState, Suspense } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useGetCurrentUserQuery } from "@/store/hooks";
import { useGetAvailabilitiesQuery } from "@/store/slices/availabilitySlice";
import { isPastDate } from "@/utils/dateUtils";
import dynamic from "next/dynamic";

// Dynamic imports for Calendar sub-components
const CalendarHeader = dynamic(() => import("./CalendarHeader"), {
  loading: () => (
    <div className="h-[76px] bg-[#FF6B35] animate-pulse rounded-t-2xl"></div>
  ),
  ssr: false,
});

const DatesGrid = dynamic(() => import("./DatesGrid"), {
  loading: () => (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

const TimezoneInfo = dynamic(() => import("./TimezoneInfo"), {
  loading: () => (
    <div className="h-16 bg-blue-50 animate-pulse rounded-lg mb-4"></div>
  ),
  ssr: false,
});

const AvailabilityModal = dynamic(
  () => import("@/components/profile/modals/AvailabilityModal"),
  {
    loading: () => null, // Modal doesn't need loading state when closed
    ssr: false,
  }
);

const WeekDays = dynamic(() => import("./WeekDays"), {
  loading: () => <div className="h-8 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false,
});

// Note: availabilitySlice needs to be implemented
// For now, using a placeholder that can be replaced later
const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Get current user data
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Use availabilitySlice with RTK Query
  const {
    data: availabilityResponse,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useGetAvailabilitiesQuery({
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth() + 1,
  });

  const availabilityData = availabilityResponse?.data || [];

  // calculate visible range
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handlePrev = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNext = () => setCurrentMonth(addMonths(currentMonth, 1));
  const resetSelectedDates = () => {
    setSelectedDate(null);
    setSelectedDates([]);
    setMultiSelect(false);
  };

  const handleDateClick = (date: Date) => {
    // Use timezone-aware date comparison
    if (isPastDate(date)) return;

    if (multiSelect) {
      setSelectedDates((prev) =>
        prev.some((d) => d.toDateString() === date.toDateString())
          ? prev.filter((d) => d.toDateString() !== date.toDateString())
          : [...prev, date]
      );
    } else {
      setSelectedDate(date);
      setSelectedDates([date]);
      setModalOpen(true);
    }
  };

  const handleMultiSave = () => {
    if (selectedDates.length > 0) setModalOpen(true);
  };

  // Debug logging
  useEffect(() => {
    console.log("📅 Calendar availability data:", {
      availabilityData,
      availabilityLength: availabilityData.length,
      isLoading: isAvailabilityLoading,
      error: availabilityError,
    });

    if (availabilityData.length > 0) {
      console.log("📅 First availability data:", availabilityData[0]);
    }
  }, [availabilityData, isAvailabilityLoading, availabilityError]);

  return (
    <div className="w-full h-auto bg-white shadow-lg rounded-2xl rounded-tl-none rounded-bl-none flex flex-col">
      <Suspense
        fallback={
          <div className="h-[76px] bg-[#FF6B35] animate-pulse rounded-t-2xl"></div>
        }
      >
        <CalendarHeader
          multiSelect={multiSelect}
          setMultiSelect={setMultiSelect}
        />
      </Suspense>

      <div className="flex-1 bg-[#ffffff] border border-[#FF6B35]/50 rounded-b-2xl p-6">
        <Suspense
          fallback={
            <div className="h-16 bg-blue-50 animate-pulse rounded-lg mb-4"></div>
          }
        >
          <TimezoneInfo />
        </Suspense>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition"
          >
            <FiChevronLeft className="text-[#FF6B35] w-6 h-6" />
          </button>

          <h2 className="text-[32px] font-medium text-[#FF6B35]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition"
          >
            <FiChevronRight className="text-[#FF6B35] w-6 h-6" />
          </button>
        </div>

        <Suspense
          fallback={
            <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
          }
        >
          <WeekDays startDate={startDate} />
        </Suspense>

        <Suspense
          fallback={
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
          }
        >
          <DatesGrid
            modalOpen={modalOpen}
            startDate={startDate}
            endDate={endDate}
            monthStart={monthStart}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            multiSelect={multiSelect}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            onDateClick={handleDateClick}
            availabilityData={availabilityData}
          />
        </Suspense>

        {multiSelect && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleMultiSave}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Save Availability
            </button>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <AvailabilityModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          dates={selectedDates}
          resetDates={resetSelectedDates}
          refreshAvailability={refetchAvailability}
        />
      </Suspense>
    </div>
  );
};

export default Calendar;
