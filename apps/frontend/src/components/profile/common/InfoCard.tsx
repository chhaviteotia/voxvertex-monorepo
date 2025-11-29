"use client";

import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}

/**
 * InfoCard Component - Improved with TypeScript
 * Displays a stat card with icon, value, and label
 */
const InfoCard = memo(({ icon: Icon, value, label }: InfoCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl p-5 shadow-sm">
      <div className="bg-[#FFE2D8] w-[47px] h-[47px] flex items-center justify-center rounded-full p-3">
        <Icon className="text-[#FF6B35] text-xl stroke-[1]" />
      </div>
      <span className="text-[#FF6B35] text-[40px] font-bold">{value}</span>
      <span className="text-black/50 mt-1 text-sm">{label}</span>
    </div>
  );
});

InfoCard.displayName = "InfoCard";

export default InfoCard;
