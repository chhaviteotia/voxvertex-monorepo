import Dispute from '../models/dispute.js';
import EnhancedUser from '../../auth/models/enhancedUser.js';
import mongoose from 'mongoose';
import { isValidId, normalizeId, idToString, idsEqual } from '../../utils/db/idUtils.js';

/**
 * Dispute Service - Database-agnostic service layer
 * This service abstracts database operations, making it easy to migrate from MongoDB to SQL/AWS
 * All database-specific logic is contained here, controllers only call service methods
 * 
 * Optimizations:
 * 1. Centralized database operations
 * 2. Better error handling
 * 3. Helper methods for respondent resolution
 * 4. Database-agnostic design
 */
class DisputeService {
  
  /**
   * Create a new dispute
   * @param {Object} disputeData - Dispute data object
   * @returns {Promise<Object>} Created dispute object
   */
  static async createDispute(disputeData) {
    try {
      const {
        complainantData,
        respondents,
        title,
        description,
        category,
        priority = 'medium',
        disputeAmount = 0,
        disputeCurrency = 'INR',
        eventId
      } = disputeData;

      if (!title || !description || !category || !complainantData || !respondents?.length) {
        throw new Error('Missing required fields: title, description, category, complainant, and at least one respondent');
      }

      // Generate disputeId before creating dispute instance
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedDisputeId = `DSP-${timestamp}-${random}`;

      // Create dispute
      const dispute = new Dispute({
        disputeId: generatedDisputeId, // Set disputeId explicitly
        title,
        description,
        category,
        priority,
        disputeAmount: Number(disputeAmount) || 0,
        disputeCurrency,
        complainant: complainantData,
        respondent: respondents,
        eventId: eventId ? (normalizeId(eventId) || eventId) : null,
        peerToPeerData: {
          startedAt: new Date(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Add timeline entry
      // Note: performedBy must be ObjectId for MongoDB schema
      // Ensure complainantData._id is an ObjectId
      const performedById = normalizeId(complainantData._id) || complainantData._id;
      dispute.timeline.push({
        action: 'Dispute created',
        performedBy: performedById,
        details: 'Initial creation',
        stage: dispute.currentStage,
        timestamp: new Date()
      });

      const savedDispute = await dispute.save();
      return savedDispute;
    } catch (error) {
      console.error('DisputeService.createDispute error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        errors: error.errors,
        stack: error.stack
      });
      
      // If it's a validation error, provide more details
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors || {}).map(e => e.message).join(', ');
        throw new Error(`Dispute validation failed: ${errors}`);
      }
      
      throw new Error(`Failed to create dispute: ${error.message || error.toString()}`);
    }
  }

  /**
   * Get dispute by ID with authorization check
   * @param {String} disputeId - Dispute ID
   * @param {String} userId - User ID for authorization
   * @returns {Promise<Object>} Dispute object
   */
  static async getDisputeById(disputeId, userId) {
    try {
      // First get dispute without populate to check authorization
      // (populate changes the structure and makes ID comparison harder)
      let dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Check authorization before populating (uses original ID structure)
      if (!dispute.isAuthorized(userId)) {
        console.error('Authorization failed:', {
          userId: userId?.toString(),
          userIdType: typeof userId,
          complainantId: dispute.complainant?._id?.toString(),
          complainantIdType: typeof dispute.complainant?._id,
          respondentIds: dispute.respondent?.map(r => r._id?.toString()),
        });
        throw new Error('Not authorized to view this dispute');
      }

      // Now populate for response
      dispute = await Dispute.findById(disputeId)
        .populate('complainant._id', 'firstName lastName email profileImageUrl')
        .populate('respondent._id', 'firstName lastName email profileImageUrl')
        .populate('mediationData.mediator', 'firstName lastName email profileImageUrl')
        .populate('legalData.legalRepresentative', 'firstName lastName email profileImageUrl')
        .populate('messages.sender', 'firstName lastName email profileImageUrl')
        .populate('evidence.submittedBy', 'firstName lastName email profileImageUrl')
        .populate('timeline.performedBy', 'firstName lastName email');

      return dispute;
    } catch (error) {
      throw new Error(`Failed to get dispute: ${error.message}`);
    }
  }

  /**
   * Get disputes for a user (as complainant or respondent)
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters (status, stage, page, limit)
   * @returns {Promise<Object>} Object with disputes and pagination info
   */
  static async getUserDisputes(userId, filters = {}) {
    try {
      const {
        status,
        stage,
        page = 1,
        limit = 10
      } = filters;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const userObjectId = normalizeId(userId) || userId;

      // Build query - flexible for both embedded objects and ObjectId refs
      const query = {
        $or: [
          { 'complainant._id': userObjectId },
          { 'respondent._id': userObjectId },
          { complainant: userObjectId },
          { respondent: userObjectId }
        ],
        isActive: true
      };

      if (status) query.status = status;
      if (stage) query.currentStage = stage;

      // Fetch disputes
      const disputes = await Dispute.find(query)
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Dispute.countDocuments(query);

      return {
        disputes,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user disputes: ${error.message}`);
    }
  }

  /**
   * Add message to dispute
   * @param {String} disputeId - Dispute ID
   * @param {String} userId - User ID (sender)
   * @param {String} content - Message content
   * @param {String} messageType - Message type (message, evidence, proposal, agreement)
   * @param {Array} attachments - Message attachments
   * @returns {Promise<Object>} Updated dispute
   */
  static async addMessage(disputeId, userId, content, messageType = 'message', attachments = []) {
    try {
      const dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (!dispute.isAuthorized(userId)) {
        throw new Error('Not authorized to add messages to this dispute');
      }

      dispute.addMessage(userId, content, messageType, attachments);
      dispute.addTimelineEntry('Message added', userId, `${messageType === 'message' ? 'Message' : messageType} added to dispute`);
      
      await dispute.save();

      await dispute.populate([
        { path: 'complainant._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'respondent._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'messages.sender', select: 'firstName lastName email profileImageUrl' }
      ]);

      return dispute;
    } catch (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Escalate dispute to next stage
   * @param {String} disputeId - Dispute ID
   * @param {String} userId - User ID (escalator)
   * @param {String} reason - Escalation reason
   * @returns {Promise<Object>} Updated dispute
   */
  static async escalateDispute(disputeId, userId, reason) {
    try {
      const dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Check authorization - only parties can escalate
      const isComplainant = idsEqual(dispute.complainant?._id, userId);
      const isRespondent = Array.isArray(dispute.respondent) && 
                          dispute.respondent.some(r => idsEqual(r._id, userId));

      if (!isComplainant && !isRespondent) {
        throw new Error('Only dispute parties can escalate a dispute');
      }

      if (dispute.currentStage === 'legal') {
        throw new Error('Dispute is already at the highest stage (legal)');
      }

      const escalated = dispute.escalate(reason, userId);
      if (!escalated) {
        throw new Error('Unable to escalate dispute');
      }

      await dispute.save();

      await dispute.populate([
        { path: 'complainant._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'respondent._id', select: 'firstName lastName email profileImageUrl' }
      ]);

      return dispute;
    } catch (error) {
      throw new Error(`Failed to escalate dispute: ${error.message}`);
    }
  }

  /**
   * Assign mediator to dispute
   * @param {String} disputeId - Dispute ID
   * @param {String} mediatorId - Mediator user ID
   * @returns {Promise<Object>} Updated dispute
   */
  static async assignMediator(disputeId, mediatorId) {
    try {
      const dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (dispute.currentStage !== 'mediation') {
        throw new Error('Dispute must be in mediation stage to assign a mediator');
      }

      const mediator = await EnhancedUser.findById(mediatorId);
      if (!mediator) {
        throw new Error('Mediator not found');
      }

      if (!dispute.mediationData) {
        dispute.mediationData = {
          startedAt: new Date(),
          deadline: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
          sessions: []
        };
      }

      dispute.mediationData.mediator = mediatorId;
      await dispute.save();

      await dispute.addTimelineEntry(
        'Mediator assigned',
        mediatorId,
        `${mediator.firstName} ${mediator.lastName} assigned as mediator`
      );
      await dispute.save();

      await dispute.populate([
        { path: 'complainant._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'respondent._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'mediationData.mediator', select: 'firstName lastName email profileImageUrl' }
      ]);

      return dispute;
    } catch (error) {
      throw new Error(`Failed to assign mediator: ${error.message}`);
    }
  }

  /**
   * Resolve dispute
   * @param {String} disputeId - Dispute ID
   * @param {String} userId - User ID (resolver)
   * @param {Object} resolutionData - Resolution data
   * @returns {Promise<Object>} Updated dispute
   */
  static async resolveDispute(disputeId, userId, resolutionData) {
    try {
      const {
        resolutionType,
        description,
        terms,
        compensationAmount,
        compensationCurrency = 'INR'
      } = resolutionData;

      const dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (!dispute.isAuthorized(userId)) {
        throw new Error('Not authorized to resolve this dispute');
      }

      dispute.resolution = {
        type: resolutionType,
        description,
        terms,
        resolvedAt: new Date(),
        resolvedBy: userId
      };

      if (compensationAmount) {
        dispute.resolution.compensation = {
          amount: compensationAmount,
          currency: compensationCurrency,
          paymentStatus: 'pending'
        };
      }

      dispute.status = 'resolved';

      // Update stage-specific resolution
      switch (dispute.currentStage) {
        case 'peer-to-peer':
          dispute.peerToPeerData = dispute.peerToPeerData || {};
          dispute.peerToPeerData.isResolved = true;
          dispute.peerToPeerData.resolution = description;
          dispute.peerToPeerData.agreedTerms = terms;
          break;
        case 'mediation':
          dispute.mediationData = dispute.mediationData || {};
          dispute.mediationData.isResolved = true;
          dispute.mediationData.resolution = description;
          dispute.mediationData.agreement = terms;
          break;
        case 'legal':
          dispute.legalData = dispute.legalData || {};
          dispute.legalData.isResolved = true;
          dispute.legalData.verdict = description;
          break;
      }

      await dispute.save();

      await dispute.addTimelineEntry(
        'Dispute resolved',
        userId,
        `Dispute resolved via ${resolutionType} resolution`
      );
      await dispute.save();

      await dispute.populate([
        { path: 'complainant._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'respondent._id', select: 'firstName lastName email profileImageUrl' },
        { path: 'resolution.resolvedBy', select: 'firstName lastName email profileImageUrl' }
      ]);

      return dispute;
    } catch (error) {
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  }

  /**
   * Submit evidence to dispute
   * @param {String} disputeId - Dispute ID
   * @param {String} userId - User ID (submitter)
   * @param {Object} evidenceData - Evidence data
   * @returns {Promise<Object>} Evidence object
   */
  static async submitEvidence(disputeId, userId, evidenceData) {
    try {
      const { title, description, files = [] } = evidenceData;

      const dispute = await Dispute.findById(disputeId);
      
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (!dispute.isAuthorized(userId)) {
        throw new Error('Not authorized to submit evidence for this dispute');
      }

      const evidence = {
        submittedBy: userId,
        title,
        description,
        files,
        submittedAt: new Date()
      };

      dispute.evidence.push(evidence);
      await dispute.save();

      await dispute.addTimelineEntry(
        'Evidence submitted',
        userId,
        `Evidence "${title}" submitted`
      );
      await dispute.save();

      return dispute.evidence[dispute.evidence.length - 1];
    } catch (error) {
      throw new Error(`Failed to submit evidence: ${error.message}`);
    }
  }

  /**
   * Get dispute statistics for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Statistics object
   */
  static async getDisputeStats(userId) {
    try {
      const userObjectId = normalizeId(userId) || userId;

      const userDisputes = await Dispute.find({
        $or: [
          { 'complainant._id': userObjectId },
          { 'respondent._id': userObjectId },
          { complainant: userObjectId },
          { respondent: userObjectId }
        ],
        isActive: true
      });

      const stats = {
        total: userDisputes.length,
        byStatus: { active: 0, resolved: 0, escalated: 0, closed: 0 },
        byStage: { 'peer-to-peer': 0, 'mediation': 0, 'legal': 0 },
        asComplainant: 0,
        asRespondent: 0,
        averageResolutionTime: 0
      };

      let totalResolutionTime = 0;
      let resolvedCount = 0;

      userDisputes.forEach(dispute => {
        stats.byStatus[dispute.status] = (stats.byStatus[dispute.status] || 0) + 1;
        stats.byStage[dispute.currentStage] = (stats.byStage[dispute.currentStage] || 0) + 1;

        const isComplainant = idsEqual(dispute.complainant?._id, userId);
        const isRespondent = Array.isArray(dispute.respondent) && 
                            dispute.respondent.some(r => idsEqual(r._id, userId));

        if (isComplainant) stats.asComplainant++;
        if (isRespondent) stats.asRespondent++;

        if (dispute.status === 'resolved' && dispute.resolution?.resolvedAt) {
          resolvedCount++;
          const resolutionTime = new Date(dispute.resolution.resolvedAt) - new Date(dispute.createdAt);
          totalResolutionTime += resolutionTime;
        }
      });

      if (resolvedCount > 0) {
        stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24));
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get dispute stats: ${error.message}`);
    }
  }

  /**
   * Helper: Resolve respondent from event data (speakers, participants)
   * This abstracts the logic for finding respondents from events
   * @param {String} respondentId - Respondent ID
   * @param {String} eventId - Event ID (optional)
   * @returns {Promise<Object|null>} Respondent data object or null
   */
  static async resolveRespondent(respondentId, eventId = null) {
    try {
      // Use database-agnostic ID utility (imported at top)

      const respondentObjId = normalizeId(respondentId);
      if (!respondentObjId) {
        return null;
      }

      const rStr = idToString(respondentObjId);

      // 1) Try to get from EnhancedUser (platform users)
      try {
        const user = await EnhancedUser.findById(respondentObjId).lean();
        if (user) {
          return {
            _id: respondentObjId,
            firstName: user.firstName || 'N/A',
            lastName: user.lastName || '',
            email: user.email || ''
          };
        }
      } catch (error) {
        // User not found, continue with event lookup
      }

      // 2) If eventId provided, try to find in event (speakers/participants)
      if (eventId) {
        // Try to dynamically import Event models (they might not exist yet)
        let eventDoc = null;
        try {
          // Try EnhancedEvent first (new format)
          if (mongoose.models && 'EnhancedEvent' in mongoose.models) {
            eventDoc = await mongoose.models.EnhancedEvent.findById(eventId)
              .select('speakers')
              .lean();
          }
          
          // Fallback to Event (old format) if EnhancedEvent not found
          if (!eventDoc && mongoose.models && 'Event' in mongoose.models) {
            eventDoc = await mongoose.models.Event.findById(eventId)
              .select('speakers')
              .lean();
          }

          if (eventDoc?.speakers) {
            // Handle new schema format: speakers.manualSpeakers[] and speakers.platformSpeakers[]
            if (eventDoc.speakers.manualSpeakers || eventDoc.speakers.platformSpeakers) {
              // Check manual speakers
              if (eventDoc.speakers.manualSpeakers) {
                const manualSpeaker = eventDoc.speakers.manualSpeakers.find(
                  s => idToString(s._id) === rStr
                );
                if (manualSpeaker) {
                  const name = manualSpeaker.name || `${manualSpeaker.firstName || ''} ${manualSpeaker.lastName || ''}`.trim();
                  return {
                    _id: normalizeId(manualSpeaker._id),
                    firstName: name.split(' ')[0] || name,
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    email: manualSpeaker.email || `${manualSpeaker.title || 'Speaker'} (Manual)`
                  };
                }
              }
              
              // Check platform speakers
              if (eventDoc.speakers.platformSpeakers) {
                const platformSpeaker = eventDoc.speakers.platformSpeakers.find(
                  s => idToString(s._id) === rStr || 
                       idToString(s.userId) === rStr ||
                       idToString(s.speakerId) === rStr
                );
                if (platformSpeaker) {
                  const name = platformSpeaker.name || `${platformSpeaker.firstName || ''} ${platformSpeaker.lastName || ''}`.trim();
                  return {
                    _id: platformSpeaker.userId ? normalizeId(platformSpeaker.userId) : normalizeId(platformSpeaker._id),
                    firstName: name.split(' ')[0] || name,
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    email: platformSpeaker.email || ''
                  };
                }
              }
            }
            // Handle old schema format: speakers[] (array)
            else if (Array.isArray(eventDoc.speakers)) {
              const speaker = eventDoc.speakers.find(
                s => idToString(s._id) === rStr || idToString(s.userId) === rStr
              );
              if (speaker) {
                const name = speaker.name || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim();
                return {
                  _id: speaker.userId ? normalizeId(speaker.userId) : normalizeId(speaker._id),
                  firstName: name.split(' ')[0] || name,
                  lastName: name.split(' ').slice(1).join(' ') || '',
                  email: speaker.email || ''
                };
              }
            }
          }

          // 3) Try EventRegistration for participants
          if (mongoose.models && 'EventRegistration' in mongoose.models) {
            const reg = await mongoose.models.EventRegistration.findOne({
              event: eventId,
              $or: [
                { 'registrant.userId': respondentObjId },
                { 'extras.userId': respondentObjId }
              ]
            }).lean();

            if (reg) {
              const participant = idToString(reg.registrant?.userId) === rStr
                ? reg.registrant
                : reg.extras?.find(e => idToString(e.userId) === rStr);

              if (participant) {
                return {
                  _id: normalizeId(participant.userId || participant._id),
                  firstName: participant.name?.split(' ')[0] || participant.name || 'N/A',
                  lastName: participant.name ? participant.name.split(' ').slice(1).join(' ') : '',
                  email: participant.email || ''
                };
              }
            }
          }
        } catch (eventError) {
          // Event models might not exist, continue with user fallback
          console.log('Event lookup failed:', eventError.message);
        }
      }

      return null;
    } catch (error) {
      console.error('Error resolving respondent:', error.message);
      return null;
    }
  }
}

export default DisputeService;

