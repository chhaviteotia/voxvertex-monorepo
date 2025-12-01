import { baseApi } from "./baseApi";

/**
 * Booking API - RTK Query endpoints for booking operations
 */

export interface Booking {
  _id: string;
  bookingId: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  speaker: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    areaOfExpertise?: string[];
  };
  event?: {
    _id: string;
    eventName: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
  eventDetails: {
    eventName: string;
    type: string;
    date: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    mode?: string;
    description?: string;
  };
  compensationAndArrangements: {
    primaryCompensation: {
      speakerFeeAmount: number;
      currency: string;
      paymentTerms?: string;
    };
    additionalBenefits?: Array<{
      type: string;
      description: string;
      value?: number;
    }>;
    travelArrangements?: {
      provided: boolean;
      details?: string;
    };
    accommodationArrangements?: {
      provided: boolean;
      details?: string;
    };
  };
  status: "pending" | "negotiating" | "accepted" | "declined" | "cancelled" | "completed";
  negotiationHistory?: Array<{
    initiatedBy: string;
    previousAmount: number;
    proposedAmount: number;
    message?: string;
    timestamp: string;
  }>;
  requestedAt: string;
  respondedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  organizerNotes?: string;
  speakerNotes?: string;
  tags?: string[];
  timeAgo?: string;
}

export interface OrganizerBookingsResponse {
  success: boolean;
  data: {
    bookings: {
      inProgress: Booking[];
      confirmed: Booking[];
      declined: Booking[];
    };
    counts: {
      inProgress: number;
      confirmed: number;
      declined: number;
      total: number;
    };
  };
}

export interface SpeakerBookingsResponse {
  success: boolean;
  data: {
    bookings: {
      pending: Booking[];
      accepted: Booking[];
      declined: Booking[];
    };
    counts: {
      pending: number;
      accepted: number;
      declined: number;
      total: number;
    };
  };
}

export interface BookingStats {
  total: number;
  pending: number;
  negotiating: number;
  accepted: number;
  declined: number;
  cancelled: number;
  completed: number;
}

export interface CreateBookingRequest {
  speakerId: string;
  eventId?: string;
  eventDetails: {
    eventName: string;
    type: string;
    date: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    mode?: string;
    description?: string;
  };
  compensationAndArrangements: {
    primaryCompensation: {
      speakerFeeAmount: number;
      currency?: string;
      paymentTerms?: string;
    };
    additionalBenefits?: Array<{
      type: string;
      description: string;
      value?: number;
    }>;
    travelArrangements?: {
      provided: boolean;
      details?: string;
    };
    accommodationArrangements?: {
      provided: boolean;
      details?: string;
    };
  };
  organizerNotes?: string;
  tags?: string[];
}

export interface NegotiationRequest {
  proposedAmount: number;
  message?: string;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get organizer bookings
    getOrganizerBookings: builder.query<OrganizerBookingsResponse, { status?: string }>({
      query: (params) => ({
        url: "/booking/organizer/all",
        params,
      }),
      providesTags: ["Booking"],
    }),

    // Get speaker bookings
    getSpeakerBookings: builder.query<SpeakerBookingsResponse, { status?: string }>({
      query: (params) => ({
        url: "/booking/speaker/all",
        params,
      }),
      providesTags: ["Booking"],
    }),

    // Get booking by ID
    getBookingById: builder.query<{ success: boolean; data: Booking }, string>({
      query: (id) => `/booking/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),

    // Create booking (Organizer)
    createBooking: builder.mutation<
      { success: boolean; message: string; data: Booking },
      CreateBookingRequest
    >({
      query: (data) => ({
        url: "/booking",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Booking"],
    }),

    // Accept booking (Speaker)
    acceptBooking: builder.mutation<
      { success: boolean; message: string; data: Booking },
      string
    >({
      query: (id) => ({
        url: `/booking/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Booking"],
    }),

    // Decline booking (Speaker)
    declineBooking: builder.mutation<
      { success: boolean; message: string; data: Booking },
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/booking/${id}/decline`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Booking"],
    }),

    // Cancel booking
    cancelBooking: builder.mutation<
      { success: boolean; message: string; data: Booking },
      string
    >({
      query: (id) => ({
        url: `/booking/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Booking"],
    }),

    // Add negotiation
    addNegotiation: builder.mutation<
      { success: boolean; message: string; data: Booking },
      { id: string; data: NegotiationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/booking/${id}/negotiate`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Booking"],
    }),

    // Update booking (Organizer)
    updateBooking: builder.mutation<
      { success: boolean; message: string; data: Booking },
      { id: string; data: Partial<CreateBookingRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/booking/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Booking"],
    }),

    // Get organizer stats
    getOrganizerStats: builder.query<{ success: boolean; data: BookingStats }, void>({
      query: () => "/booking/organizer/stats",
      providesTags: ["Booking"],
    }),

    // Get speaker stats
    getSpeakerStats: builder.query<{ success: boolean; data: BookingStats }, void>({
      query: () => "/booking/speaker/stats",
      providesTags: ["Booking"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrganizerBookingsQuery,
  useGetSpeakerBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useAcceptBookingMutation,
  useDeclineBookingMutation,
  useCancelBookingMutation,
  useAddNegotiationMutation,
  useUpdateBookingMutation,
  useGetOrganizerStatsQuery,
  useGetSpeakerStatsQuery,
} = bookingApi;

