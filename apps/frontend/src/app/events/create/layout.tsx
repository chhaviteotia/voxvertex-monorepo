"use client";

/**
 * Create Event Layout - Bypasses parent events layout
 * This page renders Sidebar and UnifiedHeader directly, matching the old project
 * Returns children directly to avoid double wrapping from parent events layout
 */
export default function CreateEventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Return children directly - the create page handles its own full layout
  // This prevents the parent /events/layout.tsx from adding extra wrappers
  return <>{children}</>;
}
