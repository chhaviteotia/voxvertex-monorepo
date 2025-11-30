// ============================================================================
// DISPUTE API - RTK Query Endpoints for Dispute Management
// ============================================================================

import { baseApi } from './baseApi';
import type {
  Dispute,
  CreateDisputeRequest,
  AddMessageRequest,
  EscalateDisputeRequest,
  ResolveDisputeRequest,
  SubmitEvidenceRequest,
  AssignMediatorRequest,
  DisputeListResponse,
  DisputeResponse,
  DisputeStatsResponse,
} from '@/types/dispute';

export const disputeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's disputes
    getUserDisputes: builder.query<
      DisputeListResponse,
      { status?: string; stage?: string; page?: number; limit?: number } | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.stage) queryParams.append('stage', params.stage);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return {
          url: `/dispute${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Dispute'],
    }),

    // Get dispute by ID
    getDisputeById: builder.query<DisputeResponse, string>({
      query: (disputeId) => ({
        url: `/dispute/${disputeId}`,
        method: 'GET',
      }),
      providesTags: (result, error, disputeId) => [
        { type: 'Dispute', id: disputeId },
      ],
    }),

    // Get dispute statistics
    getDisputeStats: builder.query<DisputeStatsResponse, void>({
      query: () => ({
        url: '/dispute/stats',
        method: 'GET',
      }),
      providesTags: ['DisputeStats'],
    }),

    // Create dispute
    createDispute: builder.mutation<DisputeResponse, CreateDisputeRequest>({
      query: (data) => ({
        url: '/dispute',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Dispute', 'DisputeStats'],
    }),

    // Add message to dispute
    addMessage: builder.mutation<
      DisputeResponse,
      { disputeId: string; data: AddMessageRequest }
    >({
      query: ({ disputeId, data }) => ({
        url: `/dispute/${disputeId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { disputeId }) => [
        { type: 'Dispute', id: disputeId },
      ],
    }),

    // Escalate dispute
    escalateDispute: builder.mutation<
      DisputeResponse,
      { disputeId: string; data: EscalateDisputeRequest }
    >({
      query: ({ disputeId, data }) => ({
        url: `/dispute/${disputeId}/escalate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { disputeId }) => [
        { type: 'Dispute', id: disputeId },
        'DisputeStats',
      ],
    }),

    // Resolve dispute
    resolveDispute: builder.mutation<
      DisputeResponse,
      { disputeId: string; data: ResolveDisputeRequest }
    >({
      query: ({ disputeId, data }) => ({
        url: `/dispute/${disputeId}/resolve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { disputeId }) => [
        { type: 'Dispute', id: disputeId },
        'DisputeStats',
      ],
    }),

    // Submit evidence
    submitEvidence: builder.mutation<
      DisputeResponse,
      { disputeId: string; data: SubmitEvidenceRequest }
    >({
      query: ({ disputeId, data }) => ({
        url: `/dispute/${disputeId}/evidence`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { disputeId }) => [
        { type: 'Dispute', id: disputeId },
      ],
    }),

    // Assign mediator
    assignMediator: builder.mutation<
      DisputeResponse,
      { disputeId: string; data: AssignMediatorRequest }
    >({
      query: ({ disputeId, data }) => ({
        url: `/dispute/${disputeId}/assign-mediator`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { disputeId }) => [
        { type: 'Dispute', id: disputeId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserDisputesQuery,
  useGetDisputeByIdQuery,
  useGetDisputeStatsQuery,
  useCreateDisputeMutation,
  useAddMessageMutation,
  useEscalateDisputeMutation,
  useResolveDisputeMutation,
  useSubmitEvidenceMutation,
  useAssignMediatorMutation,
} = disputeApi;

