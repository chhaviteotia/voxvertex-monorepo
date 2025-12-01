import mongoose from 'mongoose';
import { idsEqual, idToString } from '../../utils/db/idUtils.js';

/**
 * Dispute Model - Database-agnostic structure
 * Optimized for future migration to SQL/AWS
 * 
 * Changes from old project:
 * 1. Fixed respondent schema (properly defined as array)
 * 2. Added eventId field for linking disputes to events
 * 3. Improved indexes for better query performance
 * 4. Better validation and default values
 * 5. Consistent ref names (EnhancedUser instead of User)
 */
const disputeSchema = new mongoose.Schema({
    // Basic dispute information
    disputeId: {
        type: String,
        required: true, // Required, but will be set before validation
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: true,
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
        type: String,
        required: true,
        trim: true
        // enum: ['payment', 'service', 'communication', 'contract', 'other']
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    disputeAmount: { 
        type: Number, 
        default: 0,
        min: [0, 'Dispute amount cannot be negative']
    },
    disputeCurrency: { 
        type: String, 
        default: 'INR',
        maxlength: [3, 'Currency code must be 3 characters']
    },
    
    // Event association (optional - disputes can be created without events)
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnhancedEvent',
        required: false,
        index: true
    },
    
    // Parties involved
    complainant: {
        _id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EnhancedUser', 
            required: true 
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String }
    },
    // Fixed: respondent is an array (multiple respondents possible)
    respondent: [{
        _id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EnhancedUser', 
            required: true 
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String }
    }],
    
    // Dispute workflow stages
    currentStage: {
        type: String,
        enum: ['peer-to-peer', 'mediation', 'legal'],
        default: 'peer-to-peer',
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'escalated', 'closed'],
        default: 'active',
        index: true
    },
    
    // Stage-specific data
    peerToPeerData: {
        startedAt: { type: Date },
        deadline: { type: Date },
        attempts: { type: Number, default: 0, min: 0 },
        maxAttempts: { type: Number, default: 3 },
        lastContactAt: { type: Date },
        resolution: { type: String },
        agreedTerms: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    mediationData: {
        mediator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser',
            required: false
        },
        startedAt: { type: Date },
        deadline: { type: Date },
        mediationFee: { 
            type: Number, 
            default: 0,
            min: [0, 'Mediation fee cannot be negative']
        },
        feeStatus: {
            type: String,
            enum: ['pending', 'paid', 'disputed'],
            default: 'pending'
        },
        sessions: [{
            date: { type: Date },
            duration: { type: Number, min: 0 }, // minutes
            notes: { type: String },
            attendees: [{
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser' },
                attended: { type: Boolean, default: false }
            }]
        }],
        resolution: { type: String },
        agreement: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    legalData: {
        legalRepresentative: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser',
            required: false
        },
        caseNumber: { type: String, trim: true },
        courtName: { type: String, trim: true },
        filingDate: { type: Date },
        hearingDates: [{ type: Date }],
        legalDocuments: [{
            name: { type: String, required: true },
            url: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now }
        }],
        verdict: { type: String },
        isResolved: { type: Boolean, default: false }
    },
    
    // Communication and evidence
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: [5000, 'Message cannot exceed 5000 characters']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['message', 'evidence', 'proposal', 'agreement'],
            default: 'message'
        },
        attachments: [{
            name: { type: String },
            url: { type: String },
            type: { type: String } // image, document, audio, etc.
        }],
        isInternal: { type: Boolean, default: false }, // for mediator/legal notes
        readBy: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser' },
            readAt: { type: Date }
        }]
    }],
    
    evidence: [{
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser',
            required: true
        },
        title: { type: String, required: true, maxlength: [200, 'Title cannot exceed 200 characters'] },
        description: { type: String, maxlength: [2000, 'Description cannot exceed 2000 characters'] },
        files: [{
            name: { type: String, required: true },
            url: { type: String, required: true },
            type: { type: String },
            size: { type: Number, min: 0 }
        }],
        submittedAt: {
            type: Date,
            default: Date.now
        },
        verified: { type: Boolean, default: false }
    }],
    
    // Timeline and audit
    timeline: [{
        action: { type: String, required: true },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: { type: String },
        stage: { type: String }
    }],
    
    // Resolution
    resolution: {
        type: { type: String }, // 'agreement', 'mediated', 'legal'
        description: { type: String },
        terms: { type: String },
        compensation: {
            amount: { type: Number, min: 0 },
            currency: { type: String, default: 'INR' },
            paymentStatus: {
                type: String,
                enum: ['pending', 'paid', 'failed'],
                default: 'pending'
            }
        },
        resolvedAt: { type: Date },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EnhancedUser'
        },
        satisfactionRating: {
            complainant: { type: Number, min: 1, max: 5 },
            respondent: { type: Number, min: 1, max: 5 }
        }
    },
    
    // Metadata
    escalationHistory: [{
        from: { type: String, required: true },
        to: { type: String, required: true },
        reason: { type: String, required: true },
        escalatedAt: { type: Date, default: Date.now },
        escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser' }
    }],
    
    tags: [{ type: String, trim: true }],
    relatedDisputes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dispute'
    }],
    
    // System fields
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    closedAt: { type: Date },
    lastActivityAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
disputeSchema.index({ 'complainant._id': 1, status: 1 });
disputeSchema.index({ 'respondent._id': 1, status: 1 });
disputeSchema.index({ eventId: 1, status: 1 });
disputeSchema.index({ currentStage: 1, status: 1 });
disputeSchema.index({ 'mediationData.mediator': 1 });
disputeSchema.index({ createdAt: -1 });
disputeSchema.index({ lastActivityAt: -1 });
disputeSchema.index({ disputeId: 1 }); // Already unique, but explicit index for queries

// Compound indexes for common queries
disputeSchema.index({ isActive: 1, status: 1, lastActivityAt: -1 });

// Virtual for days since creation
disputeSchema.virtual('daysSinceCreation').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for current stage duration
disputeSchema.virtual('currentStageDuration').get(function() {
    let stageStartDate;
    switch(this.currentStage) {
        case 'peer-to-peer':
            stageStartDate = this.peerToPeerData?.startedAt || this.createdAt;
            break;
        case 'mediation':
            stageStartDate = this.mediationData?.startedAt;
            break;
        case 'legal':
            stageStartDate = this.legalData?.filingDate;
            break;
        default:
            stageStartDate = this.createdAt;
    }
    return stageStartDate ? Math.floor((Date.now() - stageStartDate) / (1000 * 60 * 60 * 24)) : 0;
});

// Pre-save middleware to update lastActivityAt
disputeSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastActivityAt = new Date();
    }
    next();
});

// Generate unique dispute ID - runs before validation
disputeSchema.pre('validate', function(next) {
    if (this.isNew && !this.disputeId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.disputeId = `DSP-${timestamp}-${random}`;
    }
    next();
});

// Static method to find disputes by user (as complainant or respondent)
disputeSchema.statics.findByUser = function(userId) {
    return this.find({
        $or: [
            { 'complainant._id': userId },
            { 'respondent._id': userId }
        ],
        isActive: true
    })
    .populate('complainant._id', 'firstName lastName email profileImageUrl')
    .populate('respondent._id', 'firstName lastName email profileImageUrl')
    .populate('mediationData.mediator', 'firstName lastName email')
    .sort({ lastActivityAt: -1 });
};

// Instance method to add timeline entry
disputeSchema.methods.addTimelineEntry = function(action, performedBy, details = '') {
    this.timeline.push({
        action,
        performedBy,
        details,
        stage: this.currentStage,
        timestamp: new Date()
    });
    return this;
};

// Instance method to add message
disputeSchema.methods.addMessage = function(sender, content, messageType = 'message', attachments = []) {
    this.messages.push({
        sender,
        content,
        messageType,
        attachments,
        timestamp: new Date()
    });
    return this;
};

// Instance method to escalate dispute
disputeSchema.methods.escalate = function(reason, escalatedBy) {
    const stageOrder = ['peer-to-peer', 'mediation', 'legal'];
    const currentIndex = stageOrder.indexOf(this.currentStage);
    
    if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        
        this.escalationHistory.push({
            from: this.currentStage,
            to: nextStage,
            reason,
            escalatedAt: new Date(),
            escalatedBy
        });
        
        this.currentStage = nextStage;
        this.status = 'escalated';
        
        // Initialize stage-specific data
        switch(nextStage) {
            case 'mediation':
                this.mediationData = {
                    ...this.mediationData,
                    startedAt: new Date(),
                    deadline: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
                    sessions: this.mediationData?.sessions || []
                };
                break;
            case 'legal':
                this.legalData = {
                    ...this.legalData,
                    filingDate: new Date(),
                    legalDocuments: this.legalData?.legalDocuments || [],
                    hearingDates: this.legalData?.hearingDates || []
                };
                break;
        }
        
        this.addTimelineEntry(`Escalated to ${nextStage}`, escalatedBy, reason);
        return true;
    }
    return false;
};

// Instance method to check if user is authorized to access dispute
// Uses database-agnostic ID utilities for easy migration
// Handles both populated and non-populated references
disputeSchema.methods.isAuthorized = function(userId) {
    if (!userId) return false;
    
    // Normalize userId to string for comparison
    const userIdStr = idToString(userId);
    if (!userIdStr) {
      console.error('isAuthorized: userIdStr is null/undefined', { userId });
      return false;
    }
    
    // Helper to extract ID from populated or non-populated reference
    const extractId = (ref) => {
      if (!ref) return null;
      // If populated, ref is an object with _id property (Mongoose populated document)
      if (typeof ref === 'object' && ref._id && !ref.toString) {
        // This is a populated document, extract _id
        return idToString(ref._id);
      }
      // If not populated, ref is the ID itself (ObjectId or string)
      return idToString(ref);
    };
    
    // Check if user is complainant
    // complainant._id might be populated (user object) or just ObjectId
    const complainantId = extractId(this.complainant?._id);
    const isComplainant = complainantId === userIdStr;
    
    // Check if user is respondent
    const isRespondent = Array.isArray(this.respondent) && 
                        this.respondent.some(r => {
                          const respondentId = extractId(r._id);
                          return respondentId === userIdStr;
                        });
    
    // Check if user is mediator
    const mediatorId = extractId(this.mediationData?.mediator);
    const isMediator = mediatorId === userIdStr;
    
    // Check if user is legal representative
    const legalRepId = extractId(this.legalData?.legalRepresentative);
    const isLegalRep = legalRepId === userIdStr;
    
    const result = isComplainant || isRespondent || isMediator || isLegalRep;
    
    // Debug logging
    if (!result) {
      console.log('isAuthorized check failed:', {
        userIdStr,
        complainantId,
        isComplainant,
        respondentIds: this.respondent?.map(r => extractId(r._id)),
        isRespondent,
        mediatorId,
        isMediator,
        legalRepId,
        isLegalRep
      });
    }
    
    return result;
};

const Dispute = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);

export default Dispute;

