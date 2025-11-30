/**
 * Dispute Types
 * TypeScript interfaces for dispute management
 */

export interface DisputeUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
}

export interface DisputeMessage {
  _id?: string;
  sender: DisputeUser | string;
  content: string;
  timestamp: string | Date;
  messageType: 'message' | 'evidence' | 'proposal' | 'agreement';
  attachments?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  isInternal?: boolean;
  readBy?: Array<{
    user: string | DisputeUser;
    readAt: string | Date;
  }>;
}

export interface DisputeEvidence {
  _id?: string;
  submittedBy: DisputeUser | string;
  title: string;
  description?: string;
  files: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  submittedAt: string | Date;
  verified?: boolean;
}

export interface DisputeTimeline {
  action: string;
  performedBy?: DisputeUser | string;
  timestamp: string | Date;
  details?: string;
  stage?: string;
}

export interface DisputeResolution {
  type?: string;
  description?: string;
  terms?: string;
  compensation?: {
    amount: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
  };
  resolvedAt?: string | Date;
  resolvedBy?: DisputeUser | string;
  satisfactionRating?: {
    complainant?: number;
    respondent?: number;
  };
}

export interface PeerToPeerData {
  startedAt?: string | Date;
  deadline?: string | Date;
  attempts?: number;
  maxAttempts?: number;
  lastContactAt?: string | Date;
  resolution?: string;
  agreedTerms?: string;
  isResolved?: boolean;
}

export interface MediationData {
  mediator?: DisputeUser | string;
  startedAt?: string | Date;
  deadline?: string | Date;
  mediationFee?: number;
  feeStatus?: 'pending' | 'paid' | 'disputed';
  sessions?: Array<{
    date: string | Date;
    duration?: number;
    notes?: string;
    attendees?: Array<{
      user: string | DisputeUser;
      attended: boolean;
    }>;
  }>;
  resolution?: string;
  agreement?: string;
  isResolved?: boolean;
}

export interface LegalData {
  legalRepresentative?: DisputeUser | string;
  caseNumber?: string;
  courtName?: string;
  filingDate?: string | Date;
  hearingDates?: Array<string | Date>;
  legalDocuments?: Array<{
    name: string;
    url: string;
    uploadedAt: string | Date;
  }>;
  verdict?: string;
  isResolved?: boolean;
}

export interface Dispute {
  _id: string;
  disputeId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  disputeAmount?: number;
  disputeCurrency?: string;
  eventId?: string;
  complainant: DisputeUser;
  respondent: DisputeUser[];
  currentStage: 'peer-to-peer' | 'mediation' | 'legal';
  status: 'active' | 'resolved' | 'escalated' | 'closed';
  peerToPeerData?: PeerToPeerData;
  mediationData?: MediationData;
  legalData?: LegalData;
  messages: DisputeMessage[];
  evidence: DisputeEvidence[];
  timeline: DisputeTimeline[];
  resolution?: DisputeResolution;
  escalationHistory?: Array<{
    from: string;
    to: string;
    reason: string;
    escalatedAt: string | Date;
    escalatedBy?: string | DisputeUser;
  }>;
  tags?: string[];
  relatedDisputes?: string[];
  isActive?: boolean;
  closedAt?: string | Date;
  lastActivityAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  daysSinceCreation?: number;
  currentStageDuration?: number;
}

export interface CreateDisputeRequest {
  title: string;
  description: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  respondentIds: string[];
  eventId?: string;
  disputeAmount?: number;
  disputeCurrency?: string;
}

export interface AddMessageRequest {
  content: string;
  messageType?: 'message' | 'evidence' | 'proposal' | 'agreement';
  attachments?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
}

export interface EscalateDisputeRequest {
  reason: string;
}

export interface ResolveDisputeRequest {
  resolutionType: string;
  description: string;
  terms?: string;
  compensationAmount?: number;
  compensationCurrency?: string;
}

export interface SubmitEvidenceRequest {
  title: string;
  description?: string;
  files: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
}

export interface AssignMediatorRequest {
  mediatorId: string;
}

export interface DisputeStats {
  total: number;
  byStatus: {
    active: number;
    resolved: number;
    escalated: number;
    closed: number;
  };
  byStage: {
    'peer-to-peer': number;
    mediation: number;
    legal: number;
  };
  asComplainant: number;
  asRespondent: number;
  averageResolutionTime: number;
}

export interface DisputeListResponse {
  success: boolean;
  disputes: Dispute[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface DisputeResponse {
  success: boolean;
  dispute: Dispute;
  message?: string;
}

export interface DisputeStatsResponse {
  success: boolean;
  stats: DisputeStats;
}

