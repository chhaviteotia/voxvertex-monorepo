"use client";

import { useState } from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  absolute?: boolean;
  href?: string;
}

/**
 * Logo Component - Improved with TypeScript and better structure
 * Handles logo display with fallback to text
 */
const Logo = ({
  className = "",
  absolute = false,
  href = "/home",
}: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const baseClasses = absolute
    ? `absolute w-[88px] h-[50px] top-[10px] bg-cover bg-center cursor-pointer bg-no-repeat hover:opacity-80 transition-opacity ${className}`
    : `w-[88px] h-[50px] bg-cover bg-center cursor-pointer bg-no-repeat hover:opacity-80 transition-opacity ${className}`;

  return (
    <Link href={href} className={baseClasses} aria-label="VoxVertex Home">
      {!imageError ? (
        <img
          src="/logo.svg"
          alt="VoxVertex Logo"
          className="w-full h-full object-contain"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-[#FF6B35] font-serif text-4xl font-bold"
            style={{
              textShadow: "0 0 8px rgba(255, 107, 53, 0.3)",
              filter: "blur(0.5px)",
            }}
          >
            V
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
