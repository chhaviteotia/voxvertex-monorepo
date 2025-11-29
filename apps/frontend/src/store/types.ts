// ============================================================================
// TYPES - Shared TypeScript types for Redux store
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Availability {
  _id: string;
  userId: string;
  date: string | Date;
  eventTypes: Array<{
    category?: string;
    events: Array<{
      name: string;
      price: number;
      currency?: string;
    }>;
  }>;
  modes: Array<'Online' | 'Offline' | 'Hybrid'>;
  timeSlots: Array<{
    slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    startTime: string;
    endTime: string;
  }>;
  blockedSlots?: Array<{
    bookingId: string;
    date: string | Date;
    timeSlot: string;
    reason: string;
    blockedAt: string | Date;
  }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateAvailabilityRequest {
  dates: string[];
  eventTypes: Array<{
    category?: string;
    events: Array<{
      name: string;
      price: number;
      currency?: string;
    }>;
  }>;
  modes: Array<'Online' | 'Offline' | 'Hybrid'>;
  timeSlots: Array<{
    slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    startTime: string;
    endTime: string;
  }>;
}

export interface AvailabilityState {
  availabilities: Availability[];
  currentAvailability: Availability | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

export interface Post {
  _id: string;
  user: string;
  userName: string;
  userProfileImage?: {
    data?: Buffer;
    contentType?: string;
  };
  userProfileImageUrl?: string;
  userProfessionalTitle?: string;
  title?: string;
  caption: string;
  media?: Array<{
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
    size?: number;
    duration?: string;
    thumbnail?: string;
  }>;
  category?: string;
  tags?: string[];
  likes?: Array<{
    user: string;
    userName?: string;
    likedAt?: string | Date;
  }>;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  visibility?: 'public' | 'connections' | 'private';
  allowComments?: boolean;
  allowShares?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreatePostRequest {
  content: string;
  caption?: string;
  visibility?: 'public' | 'connections' | 'private';
  category?: string;
  tags?: string[];
  media?: File[];
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

