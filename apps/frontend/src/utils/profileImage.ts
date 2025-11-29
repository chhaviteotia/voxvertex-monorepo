/**
 * Profile Image Utility - Centralized logic for handling profile images
 * Supports multiple image formats (URL strings, base64, objects)
 */

export interface ProfileImageData {
  data?: Buffer | string;
  contentType?: string;
  url?: string;
}

/**
 * Get profile image URL from various formats
 * @param profileImage - Image data in various formats
 * @returns URL string or null
 */
export const getProfileImageUrl = (
  profileImage: string | ProfileImageData | null | undefined
): string | null => {
  if (!profileImage) {
    return null;
  }

  // Handle string URLs
  if (typeof profileImage === "string") {
    if (profileImage.startsWith("http")) {
      return profileImage;
    }
    // Handle relative paths (local uploads)
    if (profileImage.startsWith("/uploads/")) {
      // Always use the backend API URL for uploads
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Remove /api from base URL if present, since uploads are served directly from backend root
      const baseUrl = apiBaseUrl.replace('/api', '');
      return `${baseUrl}${profileImage}`;
    }
    // Assume Cloudinary or other CDN
    return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
  }

  // Handle object with data and contentType (Buffer)
  if (
    typeof profileImage === "object" &&
    profileImage.data &&
    profileImage.contentType
  ) {
    const data = profileImage.data;
    const contentType = profileImage.contentType;
    
    if (typeof data === "string") {
      // Already base64
      return `data:${contentType};base64,${data}`;
    }
    
    // Convert Buffer to base64
    if (typeof Buffer !== "undefined") {
      const base64 = Buffer.from(data as Buffer).toString("base64");
      return `data:${contentType};base64,${base64}`;
    }
    
    // Fallback for browser environment
    return null;
  }

  // Handle object with url property
  if (typeof profileImage === "object" && profileImage.url) {
    if (typeof profileImage.url === "string") {
      if (profileImage.url.startsWith("http")) {
        return profileImage.url;
      }
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage.url}`;
    }
  }

  return null;
};

/**
 * Get user initials from name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials string (max 2 characters)
 */
export const getUserInitials = (
  firstName?: string,
  lastName?: string
): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (lastName) {
    return lastName[0].toUpperCase();
  }
  return "U";
};

