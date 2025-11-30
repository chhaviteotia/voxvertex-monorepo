// ============================================================================
// DISPUTE SLICE - Dispute State Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Dispute, DisputeStats } from '@/types/dispute';

/**
 * Dispute State Interface
 */
interface DisputeState {
  disputes: Dispute[];
  currentDispute: Dispute | null;
  stats: DisputeStats | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  filters: {
    status?: string;
    stage?: string;
    page: number;
    limit: number;
  };
}

const initialState: DisputeState = {
  disputes: [],
  currentDispute: null,
  stats: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
};

/**
 * Dispute Slice
 */
const disputeSlice = createSlice({
  name: 'dispute',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },

    setDisputes: (state, action: PayloadAction<Dispute[]>) => {
      state.disputes = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },

    addDispute: (state, action: PayloadAction<Dispute>) => {
      state.disputes.unshift(action.payload);
    },

    updateDispute: (state, action: PayloadAction<{ id: string; updates: Partial<Dispute> }>) => {
      const index = state.disputes.findIndex(
        (dispute) => dispute._id === action.payload.id
      );
      if (index !== -1) {
        state.disputes[index] = { ...state.disputes[index], ...action.payload.updates };
      }
      if (state.currentDispute && state.currentDispute._id === action.payload.id) {
        state.currentDispute = { ...state.currentDispute, ...action.payload.updates };
      }
    },

    removeDispute: (state, action: PayloadAction<string>) => {
      state.disputes = state.disputes.filter(
        (dispute) => dispute._id !== action.payload
      );
      if (state.currentDispute && state.currentDispute._id === action.payload) {
        state.currentDispute = null;
      }
    },

    setCurrentDispute: (state, action: PayloadAction<Dispute | null>) => {
      state.currentDispute = action.payload;
    },

    setStats: (state, action: PayloadAction<DisputeStats>) => {
      state.stats = action.payload;
    },

    setFilters: (state, action: PayloadAction<Partial<DisputeState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },

    resetDisputes: () => initialState,
  },
});

export const {
  setLoading,
  setDisputes,
  addDispute,
  updateDispute,
  removeDispute,
  setCurrentDispute,
  setStats,
  setFilters,
  setError,
  clearError,
  resetDisputes,
} = disputeSlice.actions;

export default disputeSlice.reducer;

