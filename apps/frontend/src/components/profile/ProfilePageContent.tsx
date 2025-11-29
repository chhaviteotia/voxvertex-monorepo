"use client";

import { Suspense, ComponentType } from "react";
import dynamic from "next/dynamic";
import AboutUser from "@/components/profile/sections/AboutUser";
import WorkExperience from "@/components/profile/sections/WorkExperience";
import Education from "@/components/profile/sections/Education";
import AwardsAndCertifications from "@/components/profile/sections/AwardsAndCertifications";
import FeaturedVideos from "@/components/profile/sections/FeaturedVideos";
import Skills from "@/components/profile/sections/Skills";
import ProfileStats from "@/components/profile/sections/ProfileStats";
import Reviews from "@/components/profile/sections/Reviews";

// Dynamic imports for role-specific components
const Calendar = dynamic(
  () => import("@/components/profile/sections/Calendar/index"),
  {
    loading: () => (
      <div className="w-full h-96 bg-white shadow-lg rounded-2xl animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading Calendar...</p>
      </div>
    ),
    ssr: false,
  }
);

const Posts = dynamic(
  () => import("@/components/profile/sections/Posts/index"),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading Posts...</p>
      </div>
    ),
    ssr: false,
  }
);

// Loading skeleton component
const LoadingSkeleton = ({ height = "h-48" }: { height?: string }) => (
  <div className={`w-full ${height} bg-gray-100 animate-pulse rounded-lg`} />
);

// Suspense wrapper component
const SuspenseSection = ({
  children,
  height = "h-48",
}: {
  children: React.ReactNode;
  height?: string;
}) => (
  <Suspense fallback={<LoadingSkeleton height={height} />}>{children}</Suspense>
);

// Section configuration type
type SectionConfig = {
  id: string;
  component: ComponentType;
  height?: string;
  dynamic?: boolean;
};

// Common sections shared across all roles
const COMMON_SECTIONS: SectionConfig[] = [
  { id: "about", component: AboutUser, height: "h-64" },
  { id: "work-experience", component: WorkExperience },
  { id: "education", component: Education },
  { id: "awards", component: AwardsAndCertifications },
  { id: "videos", component: FeaturedVideos, height: "h-64" },
  { id: "skills", component: Skills },
  { id: "stats", component: ProfileStats },
  { id: "reviews", component: Reviews },
];

// Role-specific sections configuration
const ROLE_SPECIFIC_SECTIONS: Record<string, SectionConfig[]> = {
  speaker: [
    { id: "calendar", component: Calendar, height: "h-96", dynamic: true },
    { id: "posts", component: Posts, height: "h-64", dynamic: true },
  ],
  organizer: [{ id: "posts", component: Posts, height: "h-64", dynamic: true }],
  participant: [],
};

interface ProfilePageContentProps {
  role: "speaker" | "organizer" | "participant";
}

/**
 * Shared Profile Page Content Component
 * Renders profile sections based on role configuration
 * Reduces code duplication across speaker, organizer, and participant pages
 */
export default function ProfilePageContent({ role }: ProfilePageContentProps) {
  const roleSpecificSections = ROLE_SPECIFIC_SECTIONS[role] || [];

  // Build the section order: About -> Role-specific -> Rest of common sections
  const allSections: SectionConfig[] = [];

  // Add about section first (first common section)
  allSections.push(COMMON_SECTIONS[0]);

  // Add role-specific sections after about
  roleSpecificSections.forEach((section) => allSections.push(section));

  // Add remaining common sections (skip the first one as it's already added)
  COMMON_SECTIONS.slice(1).forEach((section) => allSections.push(section));

  const renderSection = (section: SectionConfig, index: number) => {
    const Component = section.component;
    const height = section.height || "h-48";

    // Dynamic components are already wrapped in Suspense by Next.js dynamic()
    if (section.dynamic) {
      return <Component key={section.id} />;
    }

    // Regular components need Suspense wrapper
    return (
      <SuspenseSection key={section.id} height={height}>
        <Component />
      </SuspenseSection>
    );
  };

  return (
    <div className="flex flex-col items-center justify-between gap-5 px-0 py-5">
      <div className="w-full max-w-6xl mx-auto space-y-5">
        {allSections.map(renderSection)}
      </div>
    </div>
  );
}
