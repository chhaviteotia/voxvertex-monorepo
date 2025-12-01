/**
 * Event Types
 * TypeScript interfaces for event management
 */

export interface EventUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
}

export interface TicketTier {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  reservedQuantity?: number;
  features?: string[];
  discount?: {
    enabled: boolean;
    name?: string;
    type: 'percentage' | 'fixed';
    value?: number;
    maxUses?: number;
    startDate?: string | Date;
    endDate?: string | Date;
    code?: string;
    description?: string;
  };
}

export interface ManualSpeaker {
  _id?: string;
  image?: string;
  name: string;
  title: string;
  bio: string;
}

export interface PlatformSpeaker {
  _id?: string;
  speakerId: string | EventUser;
  bookingId: string;
  speakerDetails?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profileImageUrl?: string;
    bio?: string;
    professionalTitle?: string;
    areaOfExpertise?: string[];
    yearsOfExperience?: number;
  };
}

export interface EventSpeakers {
  manualSpeakers: ManualSpeaker[];
  platformSpeakers: PlatformSpeaker[];
}

export interface EventPolicies {
  participantRefund?: {
    allowRefunds: boolean;
    refundDeadline?: number;
    refundPercentage?: number;
    processingTime?: string;
    refundConditions?: string[];
  };
  speakerCancellation?: {
    allowCancellation: boolean;
    cancellationDeadline?: number;
    partialRefundPercentage?: number;
    requireReplacement?: boolean;
    paymentTerms?: string;
    speakerConditions?: string[];
  };
  eventCancellation?: {
    allowCancellation: boolean;
    fullRefundDeadline?: number;
    partialRefundPercentage?: number;
    refundMethod?: string;
    processingTime?: string;
    cancellationConditions?: string;
  };
  eventPostponement?: {
    allowPostponement: boolean;
    noticeRequired?: number;
    maxPostponementDuration?: number;
    partialRefundRequestDeadline?: number;
    ticketsValidForNewDate?: boolean;
    offerRefundOnPostponement?: boolean;
    allowSpeakersToCancelOnPostponement?: boolean;
    refundPercentageOnPostponement?: number;
    postponementConditions?: string[];
  };
  generalTerms: string;
  metadata?: {
    version?: string;
    lastUpdated?: string | Date;
    updatedBy?: string;
    isCompliant?: boolean;
    complianceNotes?: string;
  };
}

export interface EventAddons {
  featureOnHome?: boolean;
  includeInNewsletter?: boolean;
  socialMediaPromotion?: boolean;
}

export interface EventPostponement {
  isPostponed?: boolean;
  originalEventData?: {
    startDate?: string | Date;
    endDate?: string | Date;
    location?: string;
    meetingPlatform?: string;
    meetingLink?: string;
    meetingId?: string;
    passcode?: string;
    dialInNumbers?: string;
    participantInstructions?: string;
  };
  postponementHistory?: Array<{
    postponedAt: string | Date;
    postponedBy?: string | EventUser;
    reason?: string;
    newDates?: {
      startDate: string | Date;
      endDate: string | Date;
    };
    newLocation?: string;
    newMeetingDetails?: {
      meetingPlatform?: string;
      meetingLink?: string;
      meetingId?: string;
      passcode?: string;
      dialInNumbers?: string;
      participantInstructions?: string;
    };
    refundOffered?: boolean;
    refundPercentage?: number;
    notificationsSent?: {
      participants?: boolean;
      speakers?: boolean;
      sentAt?: string | Date;
    };
  }>;
}

export interface Event {
  _id: string;
  eventName: string;
  startDate: string | Date;
  endDate: string | Date;
  eventMode: 'offline' | 'online' | 'hybrid';
  format: string;
  location?: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
  dialInNumbers?: string;
  participantInstructions?: string;
  description: string;
  bannerImage: string;
  tags?: string[];
  ticketTypes: TicketTier[];
  speakers: EventSpeakers;
  addons?: EventAddons;
  policies?: EventPolicies;
  organizer: string | EventUser;
  status: 'draft' | 'published' | 'cancelled' | 'postponed';
  publishedAt?: string | Date;
  totalRevenue?: number;
  totalTicketsSold?: number;
  totalCapacity?: number;
  postponement?: EventPostponement;
  duration?: number;
  isPublished?: boolean;
  isPast?: boolean;
  isUpcoming?: boolean;
  isOngoing?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EventListResponse {
  success: boolean;
  message: string;
  data: {
    events: Event[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEvents: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: Event;
}

export interface CreateEventRequest {
  eventName: string;
  startDate: string | Date;
  endDate: string | Date;
  eventMode: 'offline' | 'online' | 'hybrid';
  format: string;
  location?: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
  dialInNumbers?: string;
  participantInstructions?: string;
  description: string;
  bannerImage: string;
  tags?: string[];
  ticketTypes: TicketTier[];
  speakers?: EventSpeakers;
  addons?: EventAddons;
  policies?: EventPolicies;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: 'draft' | 'published' | 'cancelled' | 'postponed';
}

export interface EventFilters {
  status?: string;
  eventMode?: 'offline' | 'online' | 'hybrid';
  tags?: string | string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dispute?: boolean | string;
}

