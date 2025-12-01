import DisputeService from '../services/dispute.service.js';
import EnhancedUser from '../../auth/models/enhancedUser.js';
import UserService from '../../auth/services/user.service.js';

/**
 * Dispute Controller - Request handlers for dispute operations
 * Database-agnostic structure - all database operations delegated to DisputeService
 * 
 * Optimizations from old project:
 * 1. Cleaner controller - business logic in service layer
 * 2. Better error handling and consistent responses
 * 3. Uses service layer for all database operations
 * 4. Improved authorization checks
 * 5. Better validation
 */

/**
 * Create a new dispute
 * @route POST /api/dispute
 */
export const createDispute = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Fetch full user data to get firstName and lastName
    const user = await EnhancedUser.findById(req.user._id).select('firstName lastName email').lean();
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const complainantData = {
      _id: req.user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || req.user.email || ''
    };

    // Validate required fields
    if (!complainantData.firstName || !complainantData.lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'User profile incomplete. Please update your profile with first name and last name.' 
      });
    }

    const {
      title,
      description,
      category,
      priority = 'medium',
      respondentIds, // Array of respondent IDs
      eventId,
      disputeAmount,
      disputeCurrency = 'INR'
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, description, category' 
      });
    }

    if (!respondentIds || !Array.isArray(respondentIds) || respondentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one respondent is required' 
      });
    }

    // Resolve all respondents
    const respondents = [];
    for (const respondentId of respondentIds) {
      const respondent = await DisputeService.resolveRespondent(respondentId, eventId);
      if (respondent) {
        respondents.push(respondent);
      }
    }

    if (respondents.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No valid respondents found' 
      });
    }

    // Create dispute using service
    const dispute = await DisputeService.createDispute({
      complainantData,
      respondents,
      title,
      description,
      category,
      priority,
      disputeAmount,
      disputeCurrency,
      eventId
    });

    res.status(201).json({ 
      success: true, 
      message: 'Dispute created successfully',
      dispute 
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors
    });
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error creating dispute',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Get all disputes for the current user
 * @route GET /api/dispute
 */
export const getUserDisputes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, stage, page, limit } = req.query;

    const result = await DisputeService.getUserDisputes(userId, {
      status,
      stage,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      disputes: result.disputes,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get user disputes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching disputes'
    });
  }
};

/**
 * Get dispute by ID
 * @route GET /api/dispute/:disputeId
 */
export const getDisputeById = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user._id;

    const dispute = await DisputeService.getDisputeById(disputeId, userId);

    res.status(200).json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Get dispute by ID error:', error);
    const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching dispute'
    });
  }
};

/**
 * Add message to dispute
 * @route POST /api/dispute/:disputeId/messages
 */
export const addMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { content, messageType = 'message', attachments = [] } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const dispute = await DisputeService.addMessage(
      disputeId,
      userId,
      content,
      messageType,
      attachments
    );

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      dispute
    });
  } catch (error) {
    console.error('Add message error:', error);
    const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error adding message'
    });
  }
};

/**
 * Escalate dispute
 * @route POST /api/dispute/:disputeId/escalate
 */
export const escalateDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Escalation reason is required'
      });
    }

    const dispute = await DisputeService.escalateDispute(disputeId, userId, reason);

    res.status(200).json({
      success: true,
      message: `Dispute escalated to ${dispute.currentStage} stage`,
      dispute
    });
  } catch (error) {
    console.error('Escalate dispute error:', error);
    const statusCode = error.message.includes('Not authorized') || error.message.includes('Only dispute parties') ? 403 :
                       error.message.includes('already at') || error.message.includes('Unable to escalate') ? 400 :
                       error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error escalating dispute'
    });
  }
};

/**
 * Assign mediator to dispute
 * @route POST /api/dispute/:disputeId/assign-mediator
 */
export const assignMediator = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { mediatorId } = req.body;

    if (!mediatorId) {
      return res.status(400).json({
        success: false,
        message: 'Mediator ID is required'
      });
    }

    const dispute = await DisputeService.assignMediator(disputeId, mediatorId);

    res.status(200).json({
      success: true,
      message: 'Mediator assigned successfully',
      dispute
    });
  } catch (error) {
    console.error('Assign mediator error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                       error.message.includes('must be in mediation') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error assigning mediator'
    });
  }
};

/**
 * Resolve dispute
 * @route POST /api/dispute/:disputeId/resolve
 */
export const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const {
      resolutionType,
      description,
      terms,
      compensationAmount,
      compensationCurrency = 'INR'
    } = req.body;
    const userId = req.user._id;

    if (!resolutionType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Resolution type and description are required'
      });
    }

    const dispute = await DisputeService.resolveDispute(disputeId, userId, {
      resolutionType,
      description,
      terms,
      compensationAmount,
      compensationCurrency
    });

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error resolving dispute'
    });
  }
};

/**
 * Submit evidence to dispute
 * @route POST /api/dispute/:disputeId/evidence
 */
export const submitEvidence = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { title, description, files = [] } = req.body;
    const userId = req.user._id;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Evidence title is required'
      });
    }

    const evidence = await DisputeService.submitEvidence(disputeId, userId, {
      title,
      description,
      files
    });

    res.status(201).json({
      success: true,
      message: 'Evidence submitted successfully',
      evidence
    });
  } catch (error) {
    console.error('Submit evidence error:', error);
    const statusCode = error.message.includes('Not authorized') ? 403 :
                       error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error submitting evidence'
    });
  }
};

/**
 * Get dispute statistics
 * @route GET /api/dispute/stats
 */
export const getDisputeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await DisputeService.getDisputeStats(userId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dispute stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dispute statistics'
    });
  }
};

