import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  slot: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    required: true
  },
  startTime: {
    type: String,
    required: true // format HH:MM
  },
  endTime: {
    type: String,
    required: true // format HH:MM
  }
}, { _id: false });

const eventTypeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Corporate & Professional Events',
      'Educational & Training Formats',
      'Specialized & Niche Events'
    ],
    required: false
  },
  events: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  }]
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },

  // Single date per document for better querying and management
  date: {
    type: Date,
    required: true
  },

  eventTypes: [eventTypeSchema],

  modes: [{
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    required: true
  }],

  timeSlots: [timeSlotSchema],

  // Blocked slots for confirmed bookings
  blockedSlots: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      enum: ['booking_confirmed', 'booking_pending'],
      default: 'booking_confirmed'
    },
    blockedAt: {
      type: Date,
      default: Date.now
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique combination of userId and date
availabilitySchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for blocked slots performance
availabilitySchema.index({ 'blockedSlots.bookingId': 1 });
availabilitySchema.index({ 'blockedSlots.date': 1, 'blockedSlots.timeSlot': 1 });

// Instance method to get available time slots (excluding blocked ones)
availabilitySchema.methods.getAvailableTimeSlots = function() {
  return this.timeSlots.filter(slot => 
    !this.blockedSlots.some(blocked => 
      blocked.timeSlot === slot.slot && 
      blocked.reason === 'booking_confirmed'
    )
  );
};

// Instance method to check if a specific time slot is available
availabilitySchema.methods.isTimeSlotAvailable = function(timeSlot) {
  return !this.blockedSlots.some(blocked => 
    blocked.timeSlot === timeSlot && 
    blocked.reason === 'booking_confirmed'
  );
};

// Instance method to unblock a slot (when booking is cancelled/declined)
availabilitySchema.methods.unblockSlot = function(bookingId) {
  this.blockedSlots = this.blockedSlots.filter(
    blocked => blocked.bookingId.toString() !== bookingId.toString()
  );
  return this.save();
};

// Static method to get availability with blocked slots filtered
availabilitySchema.statics.getAvailabilityWithBlocks = function(query) {
  return this.find(query).then(availabilities => {
    return availabilities.map(availability => {
      const availabilityObj = availability.toObject();
      // Filter out blocked time slots
      availabilityObj.timeSlots = availability.getAvailableTimeSlots();
      return availabilityObj;
    });
  });
};

// Update timestamp on save
availabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Availability = mongoose.models.Availability || mongoose.model('Availability', availabilitySchema);
export default Availability;

