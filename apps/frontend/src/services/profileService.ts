/**
 * Profile Service - Handles all profile-related API calls
 * Improved with better error handling and TypeScript
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ExperienceData {
  title: string;
  organization: string;
  start: string; // dd/mm/yyyy format
  end?: string; // dd/mm/yyyy format
  type?: string;
  description?: string;
  location?: string;
  skills?: string[];
  achievements?: string[];
}

export interface EducationData {
  institution: string;
  degree: string;
  field: string;
  start: string; // dd/mm/yyyy format
  end?: string; // dd/mm/yyyy format
  grade?: string;
  activities?: string[];
  description?: string;
}

export interface AwardData {
  title: string;
  issuer: string;
  date: string; // dd/mm/yyyy format
  description?: string;
  category?: string;
  url?: string;
}

export interface VideoData {
  title: string;
  platform: string;
  videoUrl: string;
  thumbnail?: {
    data?: Buffer | string;
    contentType?: string;
    filename?: string;
  };
  description?: string;
  duration?: string;
  tags?: string[];
}

export interface SkillData {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
}

export interface ReviewData {
  targetUserId: string;
  rating: number;
  remarks?: string;
  eventId?: string;
  reviewType?: 'event' | 'collaboration' | 'general';
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'connections';
  contactVisibility?: 'public' | 'private' | 'connections';
  experienceVisibility?: 'public' | 'private' | 'connections';
  educationVisibility?: 'public' | 'private' | 'connections';
}

export interface ProfileResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get profile');
    }

    return result;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Add work experience
 */
export const addExperience = async (data: ExperienceData): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/experience`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add experience');
    }

    return result;
  } catch (error) {
    console.error('Add experience error:', error);
    throw error;
  }
};

/**
 * Update work experience
 */
export const updateExperience = async (
  experienceId: string,
  data: Partial<ExperienceData>
): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/experience/${experienceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update experience');
    }

    return result;
  } catch (error) {
    console.error('Update experience error:', error);
    throw error;
  }
};

/**
 * Delete work experience
 */
export const deleteExperience = async (experienceId: string): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/experience/${experienceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete experience');
    }

    return result;
  } catch (error) {
    console.error('Delete experience error:', error);
    throw error;
  }
};

/**
 * Add education
 */
export const addEducation = async (data: EducationData): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/education`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add education');
    }

    return result;
  } catch (error) {
    console.error('Add education error:', error);
    throw error;
  }
};

/**
 * Update education
 */
export const updateEducation = async (
  educationId: string,
  data: Partial<EducationData>
): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/education/${educationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update education');
    }

    return result;
  } catch (error) {
    console.error('Update education error:', error);
    throw error;
  }
};

/**
 * Delete education
 */
export const deleteEducation = async (educationId: string): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/education/${educationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete education');
    }

    return result;
  } catch (error) {
    console.error('Delete education error:', error);
    throw error;
  }
};

/**
 * Add award
 */
export const addAward = async (data: AwardData): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/awards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add award');
    }

    return result;
  } catch (error) {
    console.error('Add award error:', error);
    throw error;
  }
};

/**
 * Update award
 */
export const updateAward = async (
  awardId: string,
  data: Partial<AwardData>
): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/awards/${awardId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update award');
    }

    return result;
  } catch (error) {
    console.error('Update award error:', error);
    throw error;
  }
};

/**
 * Delete award
 */
export const deleteAward = async (awardId: string): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/awards/${awardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete award');
    }

    return result;
  } catch (error) {
    console.error('Delete award error:', error);
    throw error;
  }
};

/**
 * Add featured video
 */
export const addVideo = async (data: VideoData): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add video');
    }

    return result;
  } catch (error) {
    console.error('Add video error:', error);
    throw error;
  }
};

/**
 * Update featured video
 */
export const updateVideo = async (
  videoId: string,
  data: Partial<VideoData>
): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update video');
    }

    return result;
  } catch (error) {
    console.error('Update video error:', error);
    throw error;
  }
};

/**
 * Delete featured video
 */
export const deleteVideo = async (videoId: string): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete video');
    }

    return result;
  } catch (error) {
    console.error('Delete video error:', error);
    throw error;
  }
};

/**
 * Update profile bio
 */
export const updateBio = async (bio: string): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/bio`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ bio }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update bio');
    }

    return result;
  } catch (error) {
    console.error('Update bio error:', error);
    throw error;
  }
};

/**
 * Update skills
 */
export const updateSkills = async (skills: SkillData[]): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/skills`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ skills }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update skills');
    }

    return result;
  } catch (error) {
    console.error('Update skills error:', error);
    throw error;
  }
};

/**
 * Add review
 */
export const addReview = async (data: ReviewData): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add review');
    }

    return result;
  } catch (error) {
    console.error('Add review error:', error);
    throw error;
  }
};

/**
 * Get reviews
 */
export const getReviews = async (): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/reviews`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get reviews');
    }

    return result;
  } catch (error) {
    console.error('Get reviews error:', error);
    throw error;
  }
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (privacySettings: PrivacySettings): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/privacy`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ privacySettings }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update privacy settings');
    }

    return result;
  } catch (error) {
    console.error('Update privacy settings error:', error);
    throw error;
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file: File): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/profile/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary
      },
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload image');
    }

    return result;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/image`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete image');
    }

    return result;
  } catch (error) {
    console.error('Delete profile image error:', error);
    throw error;
  }
};

/**
 * Increment profile views
 */
export const incrementProfileViews = async (): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/increment-views`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to increment views');
    }

    return result;
  } catch (error) {
    console.error('Increment profile views error:', error);
    throw error;
  }
};

/**
 * Search profiles
 */
export const searchProfiles = async (query: string, filters?: Record<string, any>): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    const params = new URLSearchParams({ query, ...filters });
    
    const response = await fetch(`${API_BASE_URL}/profile/search?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to search profiles');
    }

    return result;
  } catch (error) {
    console.error('Search profiles error:', error);
    throw error;
  }
};

/**
 * Get profile statistics
 */
export const getProfileStats = async (): Promise<ProfileResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/profile/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get profile stats');
    }

    return result;
  } catch (error) {
    console.error('Get profile stats error:', error);
    throw error;
  }
};

