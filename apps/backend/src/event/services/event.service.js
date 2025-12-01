import EnhancedEvent from '../models/enhancedEvent.js';
import EnhancedUser from '../../auth/models/enhancedUser.js';
import mongoose from 'mongoose';

/**
 * Event Service - Database-agnostic service layer
 * This service abstracts database operations, making it easy to migrate from MongoDB to SQL/AWS
 * All database-specific logic is contained here, controllers only call service methods
 */
class EventService {
  
  /**
   * Create a new event
   * @param {Object} eventData - Event data object
   * @returns {Promise<Object>} Created event object
   */
  static async createEvent(eventData) {
    try {
      const event = new EnhancedEvent(eventData);
      await event.save();
      return event;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Get event by ID
   * @param {String} eventId - Event ID
   * @param {Object} populateOptions - Options for populating related data
   * @returns {Promise<Object>} Event object
   */
  static async getEventById(eventId, populateOptions = {}) {
    try {
      let query = EnhancedEvent.findById(eventId);
      
      if (populateOptions.organizer) {
        query = query.populate('organizer', populateOptions.organizerFields || 'firstName lastName email profileImageUrl');
      }
      
      if (populateOptions.speakers) {
        query = query.populate('speakers.platformSpeakers.speakerId', populateOptions.speakerFields || 'firstName lastName profileImageUrl professionalTitle');
      }
      
      const event = await query;
      if (!event) {
        throw new Error('Event not found');
      }
      
      return event;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  /**
   * Get events by organizer
   * @param {String} organizerId - Organizer user ID
   * @param {Object} filters - Filter options (status, page, limit)
   * @returns {Promise<Object>} Events with pagination
   */
  static async getEventsByOrganizer(organizerId, filters = {}) {
    try {
      const { status, page = 1, limit = 10 } = filters;
      
      const query = { organizer: organizerId };
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const events = await EnhancedEvent.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await EnhancedEvent.countDocuments(query);
      
      return {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get events by organizer: ${error.message}`);
    }
  }

  /**
   * Get events where user is a platform speaker
   * @param {String} speakerId - Speaker user ID
   * @param {Object} filters - Filter options (page, limit)
   * @returns {Promise<Object>} Events with pagination
   */
  static async getEventsBySpeaker(speakerId, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;
      
      const query = {
        'speakers.platformSpeakers.speakerId': speakerId,
        status: 'published'
      };
      
      const skip = (page - 1) * limit;
      
      const events = await EnhancedEvent.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await EnhancedEvent.countDocuments(query);
      
      return {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get events by speaker: ${error.message}`);
    }
  }

  /**
   * Get all published events (for participants/public)
   * @param {Object} filters - Filter options (eventMode, tags, search, page, limit)
   * @returns {Promise<Object>} Events with pagination
   */
  static async getPublishedEvents(filters = {}) {
    try {
      const {
        eventMode,
        tags,
        search,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = 'publishedAt',
        sortOrder = 'desc'
      } = filters;
      
      const query = { status: 'published' };
      
      if (eventMode) {
        query.eventMode = eventMode;
      }
      
      if (tags) {
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagsArray };
      }
      
      if (search && search.trim().length > 0) {
        query.$or = [
          { eventName: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } }
        ];
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceCondition = {};
        if (minPrice !== undefined) priceCondition.$gte = parseInt(minPrice);
        if (maxPrice !== undefined) priceCondition.$lte = parseInt(maxPrice);
        query.ticketTypes = {
          $elemMatch: { price: priceCondition }
        };
      }
      
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (page - 1) * limit;
      
      const events = await EnhancedEvent.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await EnhancedEvent.countDocuments(query);
      
      return {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get published events: ${error.message}`);
    }
  }

  /**
   * Get upcoming events (future dates, available tickets)
   * @param {Object} filters - Filter options (eventMode, search, page, limit)
   * @returns {Promise<Object>} Events with pagination
   */
  static async getUpcomingEvents(filters = {}) {
    try {
      const {
        eventMode,
        search,
        page = 1,
        limit = 10,
        sortBy = 'startDate',
        sortOrder = 'asc'
      } = filters;
      
      const query = {
        status: 'published',
        startDate: { $gt: new Date() },
        'ticketTypes.quantity': { $gt: 0 }
      };
      
      if (eventMode) {
        query.eventMode = eventMode;
      }
      
      if (search && search.trim().length > 0) {
        query.$or = [
          { eventName: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { location: { $regex: search.trim(), $options: 'i' } }
        ];
      }
      
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (page - 1) * limit;
      
      const events = await EnhancedEvent.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await EnhancedEvent.countDocuments(query);
      
      return {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get upcoming events: ${error.message}`);
    }
  }

  /**
   * Update event
   * @param {String} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @param {String} userId - User ID for authorization check
   * @returns {Promise<Object>} Updated event object
   */
  static async updateEvent(eventId, updateData, userId) {
    try {
      const event = await EnhancedEvent.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check authorization
      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Not authorized to update this event');
      }
      
      // Prevent updating published events with ticket sales to draft
      if (event.status === 'published' && 
          updateData.status === 'draft' && 
          event.totalTicketsSold > 0) {
        throw new Error('Cannot change published event with ticket sales to draft');
      }
      
      // Update policy metadata if policies are being updated
      if (updateData.policies) {
        if (!updateData.policies.metadata) {
          updateData.policies.metadata = {};
        }
        updateData.policies.metadata.lastUpdated = new Date();
        updateData.policies.metadata.updatedBy = userId;
      }
      
      Object.assign(event, updateData);
      await event.save();
      
      return event;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  /**
   * Delete event
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID for authorization check
   * @returns {Promise<void>}
   */
  static async deleteEvent(eventId, userId) {
    try {
      const event = await EnhancedEvent.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check authorization
      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Not authorized to delete this event');
      }
      
      // Prevent deletion of published events with ticket sales
      if (event.status === 'published' && event.totalTicketsSold > 0) {
        throw new Error('Cannot delete published event with ticket sales. Consider cancelling instead');
      }
      
      await EnhancedEvent.findByIdAndDelete(eventId);
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Publish event
   * @param {String} eventId - Event ID
   * @param {String} userId - User ID for authorization check
   * @returns {Promise<Object>} Published event object
   */
  static async publishEvent(eventId, userId) {
    try {
      const event = await EnhancedEvent.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check authorization
      if (event.organizer.toString() !== userId.toString()) {
        throw new Error('Not authorized to publish this event');
      }
      
      // Validate event can be published
      const validation = event.canBePublished();
      if (!validation.canPublish) {
        throw new Error(`Event cannot be published: ${validation.errors.join(', ')}`);
      }
      
      event.status = 'published';
      event.publishedAt = new Date();
      await event.save();
      
      return event;
    } catch (error) {
      throw new Error(`Failed to publish event: ${error.message}`);
    }
  }

  /**
   * Get events for dispute filing (organizers & speakers)
   * @param {String} userId - User ID
   * @param {String} userRole - User role
   * @param {Object} filters - Filter options (page, limit)
   * @returns {Promise<Object>} Events with pagination
   */
  static async getDisputeEligibleEvents(userId, userRole, filters = {}) {
    try {
      const { page = 1, limit = 100 } = filters;
      let query = {};
      
      if (userRole === 'organizer') {
        query = {
          organizer: userId,
          status: { $in: ['published', 'draft'] }
        };
      } else if (userRole === 'speaker') {
        query = {
          'speakers.platformSpeakers.speakerId': userId,
          status: 'published'
        };
      } else {
        return {
          events: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalEvents: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
      }
      
      const skip = (page - 1) * limit;
      
      const events = await EnhancedEvent.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await EnhancedEvent.countDocuments(query);
      
      return {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dispute eligible events: ${error.message}`);
    }
  }
}

export default EventService;

