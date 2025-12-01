import mongoose from "mongoose";

/**
 * Booking Schema - Database-agnostic design
 * Can be migrated to SQL/AWS easily by converting schema fields to SQL columns
 * 
 * A booking represents a request from an organizer to book a speaker for an event.
 * The booking goes through stages: pending -> negotiating -> accepted/declined
 */
const bookingSchema = new mongoose.Schema(
  {
    // Unique booking identifier (for easy migration to SQL)
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Organizer who created the booking
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnhancedUser",
      required: true,
      index: true,
    },

    // Speaker being booked
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnhancedUser",
      required: true,
      index: true,
    },

    // Related event (if booking is for a specific event)
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnhancedEvent",
      index: true,
    },

    // Event details (denormalized for quick access)
    eventDetails: {
      eventName: { type: String, required: true },
      type: { type: String, enum: ["Conference", "Workshop", "Seminar", "Webinar", "Other"], required: true },
      date: { type: Date, required: true },
      startTime: { type: String },
      endTime: { type: String },
      location: { type: String },
      mode: { type: String, enum: ["online", "offline", "hybrid"] },
      description: { type: String },
    },

    // Compensation and arrangements
    compensationAndArrangements: {
      primaryCompensation: {
        speakerFeeAmount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "INR" },
        paymentTerms: { type: String }, // e.g., "50% upfront, 50% after event"
      },
      additionalBenefits: [{
        type: { type: String }, // e.g., "Travel", "Accommodation", "Meals"
        description: { type: String },
        value: { type: Number },
      }],
      travelArrangements: {
        provided: { type: Boolean, default: false },
        details: { type: String },
      },
      accommodationArrangements: {
        provided: { type: Boolean, default: false },
        details: { type: String },
      },
    },

    // Booking status
    status: {
      type: String,
      enum: ["pending", "negotiating", "accepted", "declined", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    // Negotiation history
    negotiationHistory: [{
      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EnhancedUser",
      },
      previousAmount: { type: Number },
      proposedAmount: { type: Number },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    }],

    // Messages/chat related to this booking
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },

    // Documents related to this booking
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    }],

    // Important dates
    requestedAt: { type: Date, default: Date.now, index: true },
    respondedAt: { type: Date },
    acceptedAt: { type: Date },
    declinedAt: { type: Date },
    cancelledAt: { type: Date },
    completedAt: { type: Date },

    // Additional notes
    organizerNotes: { type: String },
    speakerNotes: { type: String },
    internalNotes: { type: String }, // For admin/internal use

    // Tags for categorization
    tags: [{ type: String }],

    // Metadata
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date }, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
bookingSchema.index({ organizer: 1, status: 1 });
bookingSchema.index({ speaker: 1, status: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ "eventDetails.date": 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ bookingId: 1 });

// Virtual for time ago (for display)
bookingSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
});

// Instance methods
bookingSchema.methods.accept = function (speakerId) {
  if (this.speaker.toString() !== speakerId.toString()) {
    throw new Error("Only the assigned speaker can accept this booking");
  }
  if (this.status !== "pending" && this.status !== "negotiating") {
    throw new Error("Only pending or negotiating bookings can be accepted");
  }
  this.status = "accepted";
  this.acceptedAt = new Date();
  this.respondedAt = new Date();
  return this.save();
};

bookingSchema.methods.decline = function (speakerId, reason) {
  if (this.speaker.toString() !== speakerId.toString()) {
    throw new Error("Only the assigned speaker can decline this booking");
  }
  if (this.status === "accepted" || this.status === "completed") {
    throw new Error("Cannot decline an accepted or completed booking");
  }
  this.status = "declined";
  this.declinedAt = new Date();
  this.respondedAt = new Date();
  if (reason) {
    this.speakerNotes = reason;
  }
  return this.save();
};

bookingSchema.methods.cancel = function (userId) {
  const isOrganizer = this.organizer.toString() === userId.toString();
  const isSpeaker = this.speaker.toString() === userId.toString();

  if (!isOrganizer && !isSpeaker) {
    throw new Error("Only the organizer or speaker can cancel this booking");
  }
  if (this.status === "completed") {
    throw new Error("Cannot cancel a completed booking");
  }
  this.status = "cancelled";
  this.cancelledAt = new Date();
  return this.save();
};

bookingSchema.methods.addNegotiation = function (initiatedBy, proposedAmount, message) {
  this.negotiationHistory.push({
    initiatedBy,
    previousAmount: this.compensationAndArrangements.primaryCompensation.speakerFeeAmount,
    proposedAmount,
    message,
    timestamp: new Date(),
  });
  this.compensationAndArrangements.primaryCompensation.speakerFeeAmount = proposedAmount;
  this.status = "negotiating";
  return this.save();
};

// Pre-save middleware to update timestamps
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
bookingSchema.statics.findByOrganizer = function (organizerId, filters = {}) {
  const query = { organizer: organizerId, deletedAt: null };
  if (filters.status) {
    query.status = filters.status;
  }
  return this.find(query)
    .populate("speaker", "firstName lastName email profileImageUrl areaOfExpertise")
    .populate("event", "eventName startDate endDate")
    .sort({ createdAt: -1 });
};

bookingSchema.statics.findBySpeaker = function (speakerId, filters = {}) {
  const query = { speaker: speakerId, deletedAt: null };
  if (filters.status) {
    query.status = filters.status;
  }
  return this.find(query)
    .populate("organizer", "firstName lastName email profileImageUrl")
    .populate("event", "eventName startDate endDate")
    .sort({ createdAt: -1 });
};

bookingSchema.statics.findByBookingId = function (bookingId) {
  return this.findOne({ bookingId, deletedAt: null })
    .populate("organizer", "firstName lastName email profileImageUrl")
    .populate("speaker", "firstName lastName email profileImageUrl areaOfExpertise")
    .populate("event", "eventName startDate endDate location");
};

// Export model (check if already registered to avoid re-registration errors)
let Booking;
try {
  Booking = mongoose.model("Booking");
} catch (error) {
  Booking = mongoose.model("Booking", bookingSchema);
}

export default Booking;

