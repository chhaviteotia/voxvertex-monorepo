"use client";

import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface ContactCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

/**
 * ContactCard Component - Improved with TypeScript
 * Displays contact information with icon
 */
const ContactCard = memo(({ icon: Icon, label, value }: ContactCardProps) => {
  return (
    <div className="flex items-center gap-3 bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl p-4 shadow-sm">
      <div className="bg-[#FFE2D8] w-[47px] h-[47px] flex items-center justify-center rounded-full p-3 shrink-0">
        <Icon className="text-[#FF6B35] text-2xl" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-black font-medium truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
});

ContactCard.displayName = "ContactCard";

export default ContactCard;
