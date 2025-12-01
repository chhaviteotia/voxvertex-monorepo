// ============================================================================
// EVENT API - RTK Query Endpoints for Event Management
// ============================================================================

import { baseApi } from './baseApi';
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventListResponse,
  EventResponse,
  EventFilters,
} from '@/types/event';

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all published events (Public/Participants)
    getAllEvents: builder.query<EventListResponse, EventFilters | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.eventMode) queryParams.append('eventMode', params.eventMode);
        if (params.tags) {
          const tags = Array.isArray(params.tags) ? params.tags : [params.tags];
          tags.forEach(tag => queryParams.append('tags', tag));
        }
        if (params.search) queryParams.append('search', params.search);
        if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        return {
          url: `/event${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['EnhancedEvent'],
    }),

    // Get upcoming events (Public/Participants)
    getUpcomingEvents: builder.query<EventListResponse, EventFilters | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.eventMode) queryParams.append('eventMode', params.eventMode);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        return {
          url: `/event/upcoming${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['EnhancedEvent'],
    }),

    // Get event by ID
    getEventById: builder.query<EventResponse, string>({
      query: (eventId) => ({
        url: `/event/${eventId}`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [
        { type: 'EnhancedEvent', id: eventId },
      ],
    }),

    // Get user's events (Organizer/Speaker - role-based)
    getUserEvents: builder.query<EventListResponse, EventFilters | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.dispute) queryParams.append('dispute', params.dispute.toString());

        return {
          url: `/event/user/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['EnhancedEvent'],
    }),

    // Get events eligible for dispute filing
    getDisputeEligibleEvents: builder.query<EventListResponse, EventFilters | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return {
          url: `/event/dispute-eligible${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['EnhancedEvent'],
    }),

    // Create event (Organizer only)
    createEvent: builder.mutation<EventResponse, CreateEventRequest>({
      query: (data) => ({
        url: '/event',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EnhancedEvent'],
    }),

    // Update event (Organizer only)
    updateEvent: builder.mutation<EventResponse, { eventId: string; data: UpdateEventRequest }>({
      query: ({ eventId, data }) => ({
        url: `/event/${eventId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'EnhancedEvent', id: eventId },
        'EnhancedEvent',
      ],
    }),

    // Delete event (Organizer only)
    deleteEvent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (eventId) => ({
        url: `/event/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EnhancedEvent'],
    }),

    // Publish event (Organizer only)
    publishEvent: builder.mutation<EventResponse, string>({
      query: (eventId) => ({
        url: `/event/${eventId}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, eventId) => [
        { type: 'EnhancedEvent', id: eventId },
        'EnhancedEvent',
      ],
    }),

    // Validate event for publishing (Organizer only)
    validateEvent: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          canPublish: boolean;
          errors: string[];
          warnings: string[];
        };
      },
      string
    >({
      query: (eventId) => ({
        url: `/event/${eventId}/validate`,
        method: 'POST',
      }),
    }),

    // Upload banner image (Organizer only)
    uploadBannerImage: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          bannerImageUrl: string;
          publicId: string;
        };
      },
      FormData
    >({
      query: (formData) => ({
        url: '/event/upload/banner',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllEventsQuery,
  useGetUpcomingEventsQuery,
  useGetEventByIdQuery,
  useGetUserEventsQuery,
  useGetDisputeEligibleEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useValidateEventQuery,
  useUploadBannerImageMutation,
} = eventApi;

