import EventService from '../services/event.service.js';
import EnhancedEvent from '../models/enhancedEvent.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Event Controller - Request handlers for event operations
 * Database-agnostic structure - all database operations delegated to EventService
 * 
 * Optimizations:
 * 1. Cleaner controller - business logic in service layer
 * 2. Better error handling and consistent responses
 * 3. Uses service layer for all database operations
 * 4. Improved authorization checks
 * 5. Role-based event filtering
 */

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for event banners
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const uploadBannerImage = upload.single('bannerImage');

/**
 * Create a new event (Organizer only)
 * @route POST /api/event
 */
export const createEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    // Validate required fields
    if (!eventData.eventName || !eventData.startDate || !eventData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventName, startDate, endDate'
      });
    }

    // Validate online/hybrid event platform requirements
    if (eventData.eventMode === 'online' || eventData.eventMode === 'hybrid') {
      if (!eventData.meetingPlatform) {
        return res.status(400).json({
          success: false,
          message: 'Meeting platform is required for online/hybrid events'
        });
      }
      if (!eventData.meetingLink) {
        return res.status(400).json({
          success: false,
          message: 'Meeting link is required for online/hybrid events'
        });
      }
      if (eventData.meetingPlatform === 'Zoom' && (!eventData.meetingId || !eventData.passcode)) {
        return res.status(400).json({
          success: false,
          message: 'Meeting ID and passcode are required when Zoom is selected as platform'
        });
      }
    }

    // Initialize policy metadata if policies are provided
    if (eventData.policies && !eventData.policies.metadata) {
      eventData.policies.metadata = {
        version: "1.0",
        lastUpdated: new Date(),
        updatedBy: req.user._id,
        isCompliant: true,
        complianceNotes: "Initial policy configuration"
      };
    }

    const event = await EventService.createEvent(eventData);

    // Populate organizer data for response
    await event.populate('organizer', 'firstName lastName email profileImageUrl');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * Get all published events (Public/Participants)
 * @route GET /api/event
 */
export const getAllEvents = async (req, res) => {
  try {
    const filters = {
      eventMode: req.query.eventMode,
      tags: req.query.tags,
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || 'publishedAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await EventService.getPublishedEvents(filters);

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve events',
      error: error.message
    });
  }
};

/**
 * Get upcoming events (Public/Participants)
 * @route GET /api/event/upcoming
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const filters = {
      eventMode: req.query.eventMode,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || 'startDate',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await EventService.getUpcomingEvents(filters);

    res.status(200).json({
      success: true,
      message: 'Upcoming events retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve upcoming events',
      error: error.message
    });
  }
};

/**
 * Get event by ID
 * @route GET /api/event/:id
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const populateOptions = {
      organizer: true,
      organizerFields: 'firstName lastName email profileImageUrl',
      speakers: true,
      speakerFields: 'firstName lastName profileImageUrl professionalTitle'
    };

    const event = await EventService.getEventById(id, populateOptions);

    // Check access permissions
    if (!req.user && event.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only published events are publicly accessible'
      });
    }

    // If user is authenticated, check draft access
    if (req.user && event.status === 'draft' && 
        event.organizer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to draft event'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    const statusCode = error.message === 'Event not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve event',
      error: error.message
    });
  }
};

/**
 * Get user's events (Organizer/Speaker)
 * Organizer: All their events
 * Speaker: Events where they are platform speakers
 * Participant: Empty array (they see all published events)
 * @route GET /api/event/user/me
 */
export const getUserEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role?.toLowerCase();
    const { status, page = 1, limit = 10, dispute = 'false' } = req.query;
    const isDisputeMode = String(dispute).toLowerCase() === 'true';

    let result;

    if (userRole === 'organizer') {
      const filters = { status, page, limit };
      if (isDisputeMode) {
        // In dispute mode, include both published and draft events
        filters.status = status || undefined;
      }
      result = await EventService.getEventsByOrganizer(userId, filters);
    } else if (userRole === 'speaker') {
      // Speakers see events where they are platform speakers (booked/approached)
      // Support status filtering and dispute mode
      const filters = { page, limit };
      if (status) {
        filters.status = status;
      }
      if (isDisputeMode) {
        // In dispute mode, don't filter by status (show all statuses)
        filters.status = undefined;
      }
      result = await EventService.getEventsBySpeaker(userId, filters);
    } else {
      // Participants see empty array - they should use getAllEvents or getUpcomingEvents
      result = {
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

    res.status(200).json({
      success: true,
      message: 'User events retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve user events',
      error: error.message
    });
  }
};

/**
 * Update event (Organizer only)
 * @route PUT /api/event/:id
 */
export const updateEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const event = await EventService.updateEvent(id, updateData, req.user._id);

    // Populate organizer for response
    await event.populate('organizer', 'firstName lastName email profileImageUrl');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Not authorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * Delete event (Organizer only)
 * @route DELETE /api/event/:id
 */
export const deleteEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    await EventService.deleteEvent(id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Not authorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete event',
      error: error.message
    });
  }
};

/**
 * Publish event (Organizer only)
 * @route PATCH /api/event/:id/publish
 */
export const publishEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const event = await EventService.publishEvent(id, req.user._id);

    // Populate organizer for response
    await event.populate('organizer', 'firstName lastName email profileImageUrl');

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: event
    });
  } catch (error) {
    console.error('Publish event error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Not authorized') ? 403 :
                      error.message.includes('cannot be published') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to publish event',
      error: error.message
    });
  }
};

/**
 * Validate event for publishing (Organizer only)
 * @route POST /api/event/:id/validate
 */
export const validateEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    const event = await EventService.getEventById(id);
    
    // Check authorization
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const validation = event.canBePublished();

    res.status(200).json({
      success: true,
      message: 'Event validation completed',
      data: {
        canPublish: validation.canPublish,
        errors: validation.errors,
        warnings: []
      }
    });
  } catch (error) {
    console.error('Validate event error:', error);
    const statusCode = error.message === 'Event not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to validate event',
      error: error.message
    });
  }
};

/**
 * Get events eligible for dispute filing (Organizer/Speaker)
 * @route GET /api/event/dispute-eligible
 */
export const getDisputeEligibleEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role?.toLowerCase();
    const { page = 1, limit = 100 } = req.query;

    const result = await EventService.getDisputeEligibleEvents(
      userId,
      userRole,
      { page, limit }
    );

    res.status(200).json({
      success: true,
      message: 'Dispute eligible events retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get dispute eligible events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve dispute eligible events',
      error: error.message
    });
  }
};

/**
 * Upload banner image (Organizer only)
 * @route POST /api/event/upload/banner
 */
export const uploadBanner = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'event-banners',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: 'Banner image uploaded successfully',
      data: {
        bannerImageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }
    });
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload banner image',
      error: error.message
    });
  }
};

