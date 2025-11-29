/**
 * Availability Service
 * Helper functions for formatting availability data
 */

interface FormData {
  categories: string[];
  modes: string[];
  slots: string[];
  prices: Record<string, number | null>;
}

const EVENT_CATEGORIES = [
  {
    title: "Corporate & Professional Events",
    options: [
      "Conferences & Summits",
      "Seminars",
      "Keynote Speeches",
      "Panel Discussions",
      "Fireside Chats",
      "Town Halls & Open Forums",
      "Leadership Retreats",
      "Networking Events",
      "Trade Shows & Expos",
      "Product Launches",
      "Sales Kick-Offs (SKOs)",
      "Award Ceremonies & Galas",
    ],
  },
  {
    title: "Educational & Training Formats",
    options: [
      "Workshops & Masterclasses",
      "Corporate Training",
      "Guest Lectures",
      "TED-Style Talks",
      "1:1 Session",
      "Mentorship Session",
    ],
  },
  {
    title: "Specialized & Niche Events",
    options: [
      "Pitch Competitions & Startup Showcases",
      "Hackathons & Innovation Jams",
      "Charity & Fundraising Events",
      "Festivals (Music, Arts, Community)",
    ],
  },
];

const TIME_SLOTS = [
  { label: "Morning", time: "09:00 - 12:00" },
  { label: "Afternoon", time: "13:00 - 17:00" },
  { label: "Evening", time: "18:00 - 21:00" },
  { label: "Night", time: "21:00 - 23:00" },
];

/**
 * Helper function to format availability data for the modal
 * @param formData - Form data from the modal
 * @param dates - Selected dates
 * @returns Formatted availability data for separate documents per date
 */
export const formatAvailabilityData = (
  formData: FormData,
  dates: Date[]
): {
  dates: string[];
  eventTypes: Array<{
    category: string;
    events: Array<{
      name: string;
      price: number;
      currency: string;
    }>;
  }>;
  modes: string[];
  timeSlots: Array<{
    slot: string;
    startTime: string;
    endTime: string;
  }>;
} => {
  // Format event types with price information
  const eventTypes = EVENT_CATEGORIES.map((cat) => {
    const selectedEvents = formData.categories.filter((c) =>
      cat.options.includes(c)
    );

    if (selectedEvents.length === 0) return null;

    return {
      category: cat.title,
      events: selectedEvents.map((event) => {
        const price = formData.prices?.[event] ?? 0;
        return {
          name: event,
          price: price || 0,
          currency: "INR",
        };
      }),
    };
  }).filter(
    (item): item is { category: string; events: Array<{ name: string; price: number; currency: string }> } =>
      item !== null
  );

  // Format dates as YYYY-MM-DD strings for backend processing
  // Store dates in UTC to avoid timezone issues
  const formattedDates = dates.map((d) => {
    const date = new Date(d);
    // Use UTC methods to ensure consistent date storage
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Format time slots
  const formattedTimeSlots = TIME_SLOTS.filter((slot) =>
    formData.slots.includes(slot.label)
  ).map((slot) => ({
    slot: slot.label,
    startTime: slot.time.split(" - ")[0],
    endTime: slot.time.split(" - ")[1],
  }));

  return {
    dates: formattedDates,
    eventTypes,
    modes: formData.modes,
    timeSlots: formattedTimeSlots,
  };
};

