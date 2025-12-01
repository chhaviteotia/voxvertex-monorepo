import mongoose from "mongoose";
import { idToString } from '../../utils/db/idUtils.js';

const documentSchema = new mongoose.Schema({
  // Basic document information
  documentName: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
    maxlength: [200, 'Document name cannot exceed 200 characters']
  },
  
  documentType: {
    type: String,
    enum: ['MOU', 'Contract', 'Invoice', 'Agreement'],
    required: [true, 'Document type is required']
  },
  
  // File information
  file: {
    originalName: {
      type: String,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  
  // Participants
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    default: null
  },
  
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    default: null
  },
  
  // Explicit sender and receiver (for clarity)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    default: null
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    default: null
  },
  
  // Document flow and status
  direction: {
    type: String,
    enum: ['draft', 'organizer_to_speaker', 'speaker_to_organizer'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['uploaded', 'assigned', 'sent', 'pending_review', 'approved', 'signed', 'declined', 'cancelled'],
    default: 'uploaded'
  },
  
  // Assignment and tracking
  assignedAt: {
    type: Date,
    default: null
  },
  
  sentAt: {
    type: Date,
    default: null
  },
  
  receivedAt: {
    type: Date,
    default: null
  },
  
  reviewedAt: {
    type: Date,
    default: null
  },
  
  approvedAt: {
    type: Date,
    default: null
  },
  
  declinedAt: {
    type: Date,
    default: null
  },
  
  // Related booking (if applicable)
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // Additional metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    trim: true
  },
  
  // Document versioning
  version: {
    type: Number,
    default: 1
  },
  
  // Previous version reference
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  
  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Expiration (for time-sensitive documents)
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Download tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  
  lastDownloadedAt: {
    type: Date,
    default: null
  },
  
  // Security
  isEncrypted: {
    type: Boolean,
    default: false
  },
  
  encryptionKey: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for document ID
documentSchema.virtual('documentId').get(function() {
  return idToString(this._id);
});

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.file.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for status display
documentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'uploaded': 'Uploaded',
    'assigned': 'Assigned',
    'sent': 'Sent',
    'pending_review': 'Pending Review',
    'approved': 'Approved',
    'signed': 'Signed',
    'declined': 'Declined',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[this.status] || this.status;
});

// Indexes for better query performance
documentSchema.index({ organizer: 1, direction: 1, status: 1 });
documentSchema.index({ speaker: 1, direction: 1, status: 1 });
documentSchema.index({ sender: 1, status: 1 });
documentSchema.index({ receiver: 1, status: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ sentAt: -1 });
documentSchema.index({ relatedBooking: 1 });

// Pre-save middleware to update timestamps based on status changes
documentSchema.pre('save', function(next) {
  const now = new Date();
  
  // Validate that either organizer or speaker is present
  if (!this.organizer && !this.speaker) {
    return next(new Error('Either organizer or speaker must be specified'));
  }
  
  // Update timestamps based on status
  switch (this.status) {
    case 'assigned':
      if (!this.assignedAt) {
        this.assignedAt = now;
      }
      break;
    case 'sent':
      if (!this.sentAt) {
        this.sentAt = now;
      }
      break;
    case 'pending_review':
      if (!this.receivedAt) {
        this.receivedAt = now;
      }
      break;
    case 'approved':
      if (!this.approvedAt) {
        this.approvedAt = now;
      }
      break;
    case 'declined':
      if (!this.declinedAt) {
        this.declinedAt = now;
      }
      break;
  }
  
  next();
});

// Instance method to update status with timestamp
documentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Update appropriate timestamp
  const now = new Date();
  switch (newStatus) {
    case 'assigned':
      this.assignedAt = now;
      break;
    case 'sent':
      this.sentAt = now;
      break;
    case 'pending_review':
      this.receivedAt = now;
      break;
    case 'approved':
      this.approvedAt = now;
      break;
    case 'declined':
      this.declinedAt = now;
      break;
  }
  
  return this.save();
};

// Instance method to assign to speaker
documentSchema.methods.assignToSpeaker = function(speakerId, relatedBookingId = null) {
  this.speaker = speakerId;
  this.assignedAt = new Date();
  this.status = 'assigned';
  
  if (relatedBookingId) {
    this.relatedBooking = relatedBookingId;
  }
  
  return this.save();
};

// Instance method to send to speaker
documentSchema.methods.sendToSpeaker = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  this.direction = 'organizer_to_speaker';
  this.sender = this.organizer;
  this.receiver = this.speaker;
  return this.save();
};

// Instance method to assign to organizer (for speakers)
documentSchema.methods.assignToOrganizer = function(organizerId, relatedBookingId = null) {
  this.organizer = organizerId;
  this.assignedAt = new Date();
  this.status = 'assigned';
  
  if (relatedBookingId) {
    this.relatedBooking = relatedBookingId;
  }
  
  return this.save();
};

// Instance method to send to organizer
documentSchema.methods.sendToOrganizer = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  this.direction = 'speaker_to_organizer';
  this.sender = this.speaker;
  this.receiver = this.organizer;
  return this.save();
};

// Instance method to mark as received by speaker
documentSchema.methods.markAsReceived = function() {
  this.status = 'pending_review';
  this.receivedAt = new Date();
  return this.save();
};

// Instance method to approve document
documentSchema.methods.approve = function() {
  this.status = 'approved';
  this.approvedAt = new Date();
  return this.save();
};

// Instance method to decline document
documentSchema.methods.decline = function() {
  this.status = 'declined';
  this.declinedAt = new Date();
  return this.save();
};

// Instance method to track download
documentSchema.methods.trackDownload = function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

export default Document;

