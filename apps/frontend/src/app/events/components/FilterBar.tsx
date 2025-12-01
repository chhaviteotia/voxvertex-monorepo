import React from "react";

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 lg:flex-nowrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 sm:px-6 py-1 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
            activeFilter === filter
              ? "bg-[#FF6B35] text-white"
              : "bg-white text-gray-700 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35]"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
