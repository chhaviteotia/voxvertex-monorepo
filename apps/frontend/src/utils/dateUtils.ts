/**
 * Date and Timezone Utilities
 * Handles timezone-aware date operations for availability management
 */

/**
 * Get the current date in the user's timezone
 * @returns {Date} Current date with time set to start of day in user's timezone
 */
export const getCurrentDateInUserTimezone = (): Date => {
  const now = new Date();
  // Reset time to start of day (00:00:00.000)
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * Check if a date is in the past (before today) in user's timezone
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = getCurrentDateInUserTimezone();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Format date to YYYY-MM-DD string in user's timezone
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convert time from one timezone to another
 * @param {string} time - Time in HH:MM format
 * @param {string} fromTimezone - Source timezone (e.g., 'Asia/Kolkata')
 * @param {string} toTimezone - Target timezone (e.g., 'Europe/London')
 * @param {Date} date - The date for the time conversion
 * @returns {string} Converted time in HH:MM format
 */
export const convertTimeBetweenTimezones = (
  time: string,
  fromTimezone: string,
  toTimezone: string,
  date: Date
): string => {
  try {
    // Create a date-time string in the source timezone
    const dateStr = formatDateToISO(date);
    const dateTimeStr = `${dateStr}T${time}:00`;
    
    // Create date object and convert to target timezone
    const sourceDate = new Date(dateTimeStr);
    
    // Use Intl.DateTimeFormat to convert between timezones
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return formatter.format(sourceDate);
  } catch (error) {
    console.error('Error converting time between timezones:', error);
    return time; // Return original time if conversion fails
  }
};

/**
 * Get user's timezone
 * @returns {string} User's timezone (e.g., 'Asia/Kolkata')
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format availability time slots for display in different timezones
 * @param {Array} timeSlots - Array of time slots with startTime and endTime
 * @param {string} userTimezone - The timezone to display times in
 * @param {Date} date - The date for the availability
 * @returns {Array} Formatted time slots for display
 */
export const formatTimeSlotsForTimezone = (
  timeSlots: Array<{ startTime: string; endTime: string }>,
  userTimezone: string,
  date: Date
): Array<{ startTime: string; endTime: string; displayTime: string }> => {
  const speakerTimezone = getUserTimezone(); // Assuming speaker is in India
  
  return timeSlots.map(slot => {
    const convertedStartTime = convertTimeBetweenTimezones(
      slot.startTime,
      speakerTimezone,
      userTimezone,
      date
    );
    
    const convertedEndTime = convertTimeBetweenTimezones(
      slot.endTime,
      speakerTimezone,
      userTimezone,
      date
    );
    
    return {
      ...slot,
      displayTime: `${convertedStartTime} - ${convertedEndTime}`
    };
  });
};

/**
 * Check if a date is today in user's timezone
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = getCurrentDateInUserTimezone();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
};

/**
 * Get date class names for calendar styling
 * @param {Date} date - The date to style
 * @param {boolean} inCurrentMonth - Whether the date is in the current month
 * @param {boolean} isSelected - Whether the date is selected
 * @returns {string} CSS class names
 */
export const getDateClassName = (
  date: Date,
  inCurrentMonth: boolean,
  isSelected: boolean
): string => {
  const baseClasses = "flex flex-col items-start justify-start p-2 rounded-xl transition";
  const borderClasses = inCurrentMonth ? "border border-[#FF6B35]" : "border-none";
  const selectionClasses = isSelected && inCurrentMonth 
    ? "bg-[#FF6B35]/45 border-opacity-15 border-[1px]" 
    : "";
  
  if (!inCurrentMonth) {
    return `${baseClasses} ${borderClasses} text-gray-400`;
  }
  
  if (isPastDate(date)) {
    return `${baseClasses} ${borderClasses} ${selectionClasses} text-gray-400 cursor-not-allowed opacity-50`;
  }
  
  if (isToday(date)) {
    return `${baseClasses} ${borderClasses} ${selectionClasses} text-[#FF6B35] font-semibold text-lg bg-blue-50`;
  }
  
  return `${baseClasses} ${borderClasses} ${selectionClasses} text-[#FF6B35] font-semibold text-lg cursor-pointer hover:bg-[#FF6B35]/10`;
};

