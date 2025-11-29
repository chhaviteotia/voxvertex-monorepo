"use client";

import { FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";

interface CalendarHeaderProps {
  multiSelect: boolean;
  setMultiSelect: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const CalendarHeader = ({
  multiSelect,
  setMultiSelect,
}: CalendarHeaderProps) => {
  return (
    <div className="h-[76px] bg-[#FF6B35] flex items-center justify-between px-8 py-3 text-white rounded-tr-2xl">
      <div className="flex items-center gap-5 font-medium text-lg">
        <FiCalendar /> Availability Calendar
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        onClick={() => setMultiSelect((prev) => !prev)}
        className={`
          px-4 py-2 rounded-lg font-medium shadow-md
          transition-colors duration-300
          ${multiSelect ? "bg-[#FF6B35] text-white" : "bg-white text-[#FF6B35]"}
        `}
      >
        Set Availability for Multiple Dates
      </motion.button>
    </div>
  );
};

export default CalendarHeader;
