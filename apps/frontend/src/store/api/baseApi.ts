// ============================================================================
// BASE API - RTK Query Configuration
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  credentials: 'include', // Include cookies for authentication
  timeout: 10000, // 10 second timeout to prevent infinite loading
  prepareHeaders: (headers) => {
    // Only use cookie-based authentication - no Bearer tokens needed
    // The backend will read tokens from cookies automatically
    
    // Don't set Content-Type here - let RTK Query handle it based on body type
    // For FormData, RTK Query will automatically set multipart/form-data
    // For JSON, it will set application/json
    
    return headers;
  },
});

// Base query with re-authentication logic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  try {
    const result = await baseQuery(args, api, extraOptions);
    
    // If we get a 401, the session might have expired
    if (result?.error && result.error.status === 401) {
      console.log('Authentication failed - session may have expired');
      console.log('Redirecting to login...');
      
      // For cookie-based auth, we don't need to refresh tokens
      // The backend handles token refresh automatically via cookies
      // Just logout the user and let them re-authenticate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api as any).dispatch({ type: 'auth/logout' });
    }

    return result;
  } catch (error) {
    console.error('Base API error:', error);
    throw error;
  }
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Profile', 
    'Post',
    'FeedPost',
    'WorkExperience',
    'Education',
    'Award',
    'Video',
    'CalendarEvent',
    'Availability',
    'Speaker',
    'SpeakerProfile',
    'Booking',
    'Conversation',
    'Message',
    'Negotiation',
    'OrganizerBooking',
    'SavedSpeaker',
    'EnhancedEvent',
    'Document',
    'Subscription',
    'Notification',
    'TechReadinessSession',
    'Dispute',
    'DisputeStats',
  ],
  endpoints: () => ({}),
});

