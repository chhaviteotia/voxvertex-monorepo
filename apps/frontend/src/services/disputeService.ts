/**
 * Dispute Service
 * Handles dispute-related API calls
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

import type {
  CreateDisputeRequest,
  DisputeListResponse,
  DisputeResponse,
  DisputeStatsResponse,
  AddMessageRequest,
  EscalateDisputeRequest,
  ResolveDisputeRequest,
  SubmitEvidenceRequest,
  AssignMediatorRequest,
} from "@/types/dispute";

/**
 * Create a new dispute
 */
export const createDispute = async (
  data: CreateDisputeRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create dispute");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create dispute. Please try again.";
    throw new Error(message);
  }
};

/**
 * Get user's disputes
 */
export const getUserDisputes = async (
  params?: {
    status?: string;
    stage?: string;
    page?: number;
    limit?: number;
  }
): Promise<DisputeListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.stage) queryParams.append("stage", params.stage);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_BASE_URL}/dispute${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch disputes");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch disputes. Please try again.";
    throw new Error(message);
  }
};

/**
 * Get dispute by ID
 */
export const getDisputeById = async (
  disputeId: string
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/${disputeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch dispute");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch dispute. Please try again.";
    throw new Error(message);
  }
};

/**
 * Add message to dispute
 */
export const addMessage = async (
  disputeId: string,
  data: AddMessageRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/${disputeId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add message");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add message. Please try again.";
    throw new Error(message);
  }
};

/**
 * Escalate dispute
 */
export const escalateDispute = async (
  disputeId: string,
  data: EscalateDisputeRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/${disputeId}/escalate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to escalate dispute");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to escalate dispute. Please try again.";
    throw new Error(message);
  }
};

/**
 * Resolve dispute
 */
export const resolveDispute = async (
  disputeId: string,
  data: ResolveDisputeRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/${disputeId}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to resolve dispute");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to resolve dispute. Please try again.";
    throw new Error(message);
  }
};

/**
 * Submit evidence
 */
export const submitEvidence = async (
  disputeId: string,
  data: SubmitEvidenceRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/${disputeId}/evidence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to submit evidence");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit evidence. Please try again.";
    throw new Error(message);
  }
};

/**
 * Assign mediator
 */
export const assignMediator = async (
  disputeId: string,
  data: AssignMediatorRequest
): Promise<DisputeResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dispute/${disputeId}/assign-mediator`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to assign mediator");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to assign mediator. Please try again.";
    throw new Error(message);
  }
};

/**
 * Get dispute statistics
 */
export const getDisputeStats = async (): Promise<DisputeStatsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dispute/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch dispute statistics");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch dispute statistics. Please try again.";
    throw new Error(message);
  }
};

