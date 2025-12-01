import mongoose from "mongoose";

/**
 * Enhanced Event Model - Database-agnostic structure
 * Optimized for future migration to SQL/AWS
 * Based on old project structure with improvements
 */

// Ticket Tier Schema with Discount Support
const ticketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ticket name is required"],
    trim: true,
    maxlength: [100, "Ticket name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Ticket price is required"],
    min: [0, "Ticket price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Ticket quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: [0, "Reserved quantity cannot be negative"],
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [200, "Feature cannot exceed 200 characters"],
  }],
  discount: {
    enabled: { type: Boolean, default: false },
    name: { type: String, trim: true, maxlength: [100, "Discount name cannot exceed 100 characters"] },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, min: [0, "Discount value cannot be negative"], max: [100, "Percentage discount cannot exceed 100%"] },
    maxUses: { type: Number, min: [1, "Max uses must be at least 1"] },
    startDate: { type: Date },
    endDate: { type: Date },
    code: { type: String, trim: true, uppercase: true, maxlength: [20, "Discount code cannot exceed 20 characters"] },
    description: { type: String, trim: true, maxlength: [500, "Discount description cannot exceed 500 characters"] }
  }
}, { _id: true });

// Manual Speaker Schema (for speakers added manually by organizer)
const manualSpeakerSchema = new mongoose.Schema({
  image: { type: String, trim: true },
  name: {
    type: String,
    required: [true, "Speaker name is required"],
    trim: true,
    maxlength: [100, "Speaker name cannot exceed 100 characters"],
  },
  title: {
    type: String,
    required: [true, "Speaker title is required"],
    trim: true,
    maxlength: [150, "Speaker title cannot exceed 150 characters"],
  },
  bio: {
    type: String,
    required: [true, "Speaker bio is required"],
    trim: true,
    maxlength: [1000, "Speaker bio cannot exceed 1000 characters"],
  }
});

// Platform Speaker Schema (for speakers from confirmed bookings)
const platformSpeakerSchema = new mongoose.Schema({
  speakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  speakerDetails: {
    firstName: String,
    lastName: String,
    fullName: String,
    profileImageUrl: String,
    bio: String,
    professionalTitle: String,
    areaOfExpertise: [String],
    yearsOfExperience: Number,
  }
});

// Enhanced Event Schema
const enhancedEventSchema = new mongoose.Schema({
  // Core Details
  eventName: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
    maxlength: [150, "Event name cannot exceed 150 characters"],
    index: true
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (v) {
        return v >= this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  eventMode: {
    type: String,
    required: [true, "Event mode is required"],
    enum: {
      values: ['offline', 'online', 'hybrid'],
      message: "Event mode must be offline, online, or hybrid"
    },
    index: true
  },
  format: {
    type: String,
    required: [true, "Event format is required"],
    trim: true,
    maxlength: [100, "Event format cannot exceed 100 characters"],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, "Location cannot exceed 500 characters"],
    validate: {
      validator: function (v) {
        if (this.eventMode === 'offline' || this.eventMode === 'hybrid') {
          return v && v.trim().length > 0;
        }
        return true;
      },
      message: "Location is required for offline or hybrid events"
    }
  },
  
  // Online Event Platform Details
  meetingPlatform: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Meeting platform is required for online or hybrid events'
    }
  },
  meetingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Meeting link is required for online or hybrid events'
    }
  },
  meetingId: { type: String, trim: true },
  passcode: { type: String, trim: true },
  dialInNumbers: { type: String, trim: true, maxlength: [1000, 'Dial-in numbers cannot exceed 1000 characters'] },
  participantInstructions: { type: String, trim: true, maxlength: [2000, 'Participant instructions cannot exceed 2000 characters'] },

  // Branding & Content
  description: {
    type: String,
    required: [true, "Event description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  bannerImage: {
    type: String,
    required: [true, "Banner image is required"],
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, "Tag cannot exceed 50 characters"],
    index: true
  }],

  // Ticketing
  ticketTypes: [ticketTierSchema],

  // Speakers (Two Types)
  speakers: {
    manualSpeakers: {
      type: [manualSpeakerSchema],
      default: []
    },
    platformSpeakers: {
      type: [platformSpeakerSchema],
      default: []
    }
  },

  // Add-ons
  addons: {
    featureOnHome: { type: Boolean, default: false },
    includeInNewsletter: { type: Boolean, default: false },
    socialMediaPromotion: { type: Boolean, default: false }
  },

  // Policies & Terms - Comprehensive and Scalable Schema
  policies: {
    participantRefund: {
      allowRefunds: { type: Boolean, default: false, required: true },
      refundDeadline: { type: Number, min: [0, "Refund deadline cannot be negative"], max: [365, "Refund deadline cannot exceed 365 days"] },
      refundPercentage: { type: Number, min: [0, "Refund percentage cannot be negative"], max: [100, "Refund percentage cannot exceed 100%"] },
      processingTime: { type: String, trim: true, default: "48 hours" },
      refundConditions: [{ type: String, trim: true, maxlength: [500, "Refund condition cannot exceed 500 characters"], required: true }]
    },
    speakerCancellation: {
      allowCancellation: { type: Boolean, default: false, required: true },
      cancellationDeadline: { type: Number, min: [0, "Cancellation deadline cannot be negative"], max: [365, "Cancellation deadline cannot exceed 365 days"] },
      partialRefundPercentage: { type: Number, min: [0, "Partial refund percentage cannot be negative"], max: [100, "Partial refund percentage cannot exceed 100%"] },
      requireReplacement: { type: Boolean, default: false },
      paymentTerms: { type: String, trim: true, maxlength: [1000, "Payment terms cannot exceed 1000 characters"] },
      speakerConditions: [{ type: String, trim: true, maxlength: [500, "Speaker condition cannot exceed 500 characters"], required: true }]
    },
    eventCancellation: {
      allowCancellation: { type: Boolean, default: false, required: true },
      fullRefundDeadline: { type: Number, min: [0, "Full refund deadline cannot be negative"], max: [365, "Full refund deadline cannot exceed 365 days"] },
      partialRefundPercentage: { type: Number, min: [0, "Partial refund percentage cannot be negative"], max: [100, "Partial refund percentage cannot exceed 100%"] },
      refundMethod: { type: String, trim: true, maxlength: [200, "Refund method cannot exceed 200 characters"] },
      processingTime: { type: String, trim: true, default: "48 hours" },
      cancellationConditions: { type: String, trim: true, maxlength: [1000, "Cancellation conditions cannot exceed 1000 characters"] }
    },
    eventPostponement: {
      allowPostponement: { type: Boolean, default: false, required: true },
      noticeRequired: { type: Number, min: [0, "Notice required cannot be negative"], max: [365, "Notice required cannot exceed 365 days"] },
      maxPostponementDuration: { type: Number, min: [0, "Max postponement duration cannot be negative"], max: [365, "Max postponement duration cannot exceed 365 days"] },
      partialRefundRequestDeadline: { type: Number, min: [0, "Partial refund request deadline cannot be negative"], max: [365, "Partial refund request deadline cannot exceed 365 days"] },
      ticketsValidForNewDate: { type: Boolean, default: false },
      offerRefundOnPostponement: { type: Boolean, default: false },
      allowSpeakersToCancelOnPostponement: { type: Boolean, default: false },
      refundPercentageOnPostponement: { type: Number, min: [0, "Refund percentage cannot be negative"], max: [100, "Refund percentage cannot exceed 100%"] },
      postponementConditions: [{ type: String, trim: true, maxlength: [500, "Postponement condition cannot exceed 500 characters"], required: true }]
    },
    generalTerms: {
      type: String,
      trim: true,
      maxlength: [5000, "General terms cannot exceed 5000 characters"],
      required: [true, "General terms and conditions are required"],
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: "General terms and conditions cannot be empty"
      }
    },
    metadata: {
      version: { type: String, default: "1.0", trim: true },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser' },
      isCompliant: { type: Boolean, default: true },
      complianceNotes: { type: String, trim: true, maxlength: [1000, "Compliance notes cannot exceed 1000 characters"] }
    }
  },

  // Metadata
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'postponed'],
    default: 'draft',
    index: true
  },
  publishedAt: {
    type: Date,
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalTicketsSold: {
    type: Number,
    default: 0
  },
  totalCapacity: {
    type: Number,
    default: 0
  },
  
  // Postponement-related fields
  postponement: {
    isPostponed: { type: Boolean, default: false },
    originalEventData: {
      startDate: Date,
      endDate: Date,
      location: String,
      meetingPlatform: String,
      meetingLink: String,
      meetingId: String,
      passcode: String,
      dialInNumbers: String,
      participantInstructions: String
    },
    postponementHistory: [{
      postponedAt: { type: Date, default: Date.now },
      postponedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser' },
      reason: { type: String, trim: true, maxlength: [500, "Postponement reason cannot exceed 500 characters"] },
      newDates: { startDate: Date, endDate: Date },
      newLocation: String,
      newMeetingDetails: {
        meetingPlatform: String,
        meetingLink: String,
        meetingId: String,
        passcode: String,
        dialInNumbers: String,
        participantInstructions: String
      },
      refundOffered: { type: Boolean, default: false },
      refundPercentage: { type: Number, min: [0], max: [100] },
      notificationsSent: {
        participants: { type: Boolean, default: false },
        speakers: { type: Boolean, default: false },
        sentAt: Date
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for event duration
enhancedEventSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for checking if event is published
enhancedEventSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});

// Virtual for checking if event is in the past
enhancedEventSchema.virtual('isPast').get(function () {
  return this.endDate < new Date();
});

// Virtual for checking if event is upcoming
enhancedEventSchema.virtual('isUpcoming').get(function () {
  return this.startDate > new Date();
});

// Virtual for checking if event is ongoing
enhancedEventSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Indexes for better query performance
enhancedEventSchema.index({ organizer: 1, status: 1 });
enhancedEventSchema.index({ startDate: 1 });
enhancedEventSchema.index({ eventMode: 1 });
enhancedEventSchema.index({ status: 1, publishedAt: -1 });
enhancedEventSchema.index({ 'policies.metadata.isCompliant': 1 });
enhancedEventSchema.index({ 'addons.featureOnHome': 1 });

// Pre-save middleware to calculate total capacity
enhancedEventSchema.pre('save', function (next) {
  if (this.ticketTypes && this.ticketTypes.length > 0) {
    this.totalCapacity = this.ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0);
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to published
enhancedEventSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Static method to get events by organizer
enhancedEventSchema.statics.findByOrganizer = function (organizerId, status = null) {
  const query = { organizer: organizerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get published events
enhancedEventSchema.statics.findPublished = function () {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

// Instance method to check if event can be published
enhancedEventSchema.methods.canBePublished = function () {
  const errors = [];
  
  if (!this.eventName) errors.push('Event name is required');
  if (!this.startDate) errors.push('Start date is required');
  if (!this.endDate) errors.push('End date is required');
  if (!this.description) errors.push('Description is required');
  if (!this.bannerImage) errors.push('Banner image is required');
  if (!this.format) errors.push('Event format is required');
  
  if ((this.eventMode === 'offline' || this.eventMode === 'hybrid') && !this.location) {
    errors.push('Location is required for offline/hybrid events');
  }
  if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && !this.meetingLink) {
    errors.push('Meeting link is required for online/hybrid events');
  }
  if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && !this.meetingPlatform) {
    errors.push('Meeting platform is required for online/hybrid events');
  }
  
  if (this.startDate >= this.endDate) {
    errors.push('End date must be after start date');
  }
  
  const totalSpeakers = (this.speakers.manualSpeakers?.length || 0) + (this.speakers.platformSpeakers?.length || 0);
  if (totalSpeakers === 0) errors.push('At least one speaker is required');
  if (!this.ticketTypes || this.ticketTypes.length === 0) errors.push('At least one ticket type is required');
  
  if (!this.policies?.generalTerms || this.policies.generalTerms.trim().length === 0) {
    errors.push('General terms and conditions are required');
  }
  
  return {
    canPublish: errors.length === 0,
    errors: errors
  };
};

// Check if model already exists (for hot reload support)
const EnhancedEvent = mongoose.models.EnhancedEvent || mongoose.model('EnhancedEvent', enhancedEventSchema);

export default EnhancedEvent;

