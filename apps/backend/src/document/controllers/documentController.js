import documentService from '../services/document.service.js';

/**
 * Upload a new document
 * POST /api/document/upload
 */
export const uploadDocument = async (req, res) => {
  try {
    console.log('📄 Document upload request received');
    console.log('🔍 Debug - req.body:', req.body);
    console.log('🔍 Debug - req.file:', req.file);
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const file = req.file;
    
    // Get values directly from req.body (destructuring might not work with multipart/form-data)
    const docName = req.body.documentName;
    const docType = req.body.documentType;
    const docTags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : [];
    const docNotes = req.body.notes || '';
    
    console.log('🔍 Debug - extracted values:');
    console.log('  - docName:', docName);
    console.log('  - docType:', docType);
    console.log('  - docTags:', docTags);
    console.log('  - docNotes:', docNotes);
    console.log('  - file:', file);
    
    // Validate required fields
    if (!docName || !docType || !file) {
      console.log('❌ Validation failed:');
      console.log('  - docName:', docName);
      console.log('  - docType:', docType);
      console.log('  - file:', file);
      return res.status(400).json({
        success: false,
        message: 'Document name, type, and file are required'
      });
    }
    
    // Validate document type
    const validTypes = ['MOU', 'Contract', 'Invoice', 'Agreement'];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be one of: MOU, Contract, Invoice, Agreement'
      });
    }
    
    const result = await documentService.uploadDocument(
      userId,
      userRole,
      { documentName: docName, documentType: docType, tags: docTags, notes: docNotes },
      file
    );
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Assign document to a speaker
 * POST /api/document/:documentId/assign
 */
export const assignDocumentToSpeaker = async (req, res) => {
  try {
    console.log('📋 Document assignment request received');
    
    const { documentId } = req.params;
    const { speakerId, relatedBookingId } = req.body;
    const organizerId = req.user._id;
    
    // Validate required fields
    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: 'Speaker ID is required'
      });
    }
    
    const result = await documentService.assignDocumentToSpeaker(
      documentId,
      speakerId,
      organizerId,
      relatedBookingId
    );
    
    res.status(200).json({
      success: true,
      message: 'Document assigned to speaker successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Assign document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Send document to speaker
 * POST /api/document/:documentId/send
 */
export const sendDocumentToSpeaker = async (req, res) => {
  try {
    console.log('📤 Send document request received');
    
    const { documentId } = req.params;
    const organizerId = req.user._id;
    
    const result = await documentService.sendDocumentToSpeaker(documentId, organizerId);
    
    res.status(200).json({
      success: true,
      message: 'Document sent to speaker successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Send document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Assign document to an organizer (for speakers)
 * POST /api/document/:documentId/assign-organizer
 */
export const assignDocumentToOrganizer = async (req, res) => {
  try {
    console.log('📋 Document assignment to organizer request received');
    
    const { documentId } = req.params;
    const { organizerId, relatedBookingId } = req.body;
    const speakerId = req.user._id;
    
    // Validate required fields
    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: 'Organizer ID is required'
      });
    }
    
    const result = await documentService.assignDocumentToOrganizer(
      documentId,
      organizerId,
      speakerId,
      relatedBookingId
    );
    
    res.status(200).json({
      success: true,
      message: 'Document assigned to organizer successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Assign document to organizer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign document to organizer',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Send document to organizer
 * POST /api/document/:documentId/send-to-organizer
 */
export const sendDocumentToOrganizer = async (req, res) => {
  try {
    console.log('📤 Send document to organizer request received');
    
    const { documentId } = req.params;
    const speakerId = req.user._id;
    
    const result = await documentService.sendDocumentToOrganizer(documentId, speakerId);
    
    res.status(200).json({
      success: true,
      message: 'Document sent to organizer successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Send document to organizer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send document to organizer',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get organizer's documents
 * GET /api/document/organizer
 */
export const getOrganizerDocuments = async (req, res) => {
  try {
    console.log('📋 Get organizer documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const organizerId = req.user._id;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getOrganizerDocuments(
      organizerId,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'Organizer documents fetched successfully',
      data: result.documents,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Get organizer documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch organizer documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get speaker's documents
 * GET /api/document/speaker
 */
export const getSpeakerDocuments = async (req, res) => {
  try {
    console.log('📋 Get speaker documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const speakerId = req.user._id;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getSpeakerDocuments(
      speakerId,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'Speaker documents fetched successfully',
      data: result.documents,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Get speaker documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch speaker documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all documents for current user (both incoming and outgoing)
 * GET /api/document/all
 */
export const getAllUserDocuments = async (req, res) => {
  try {
    console.log('📋 Get all user documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getAllUserDocuments(
      userId,
      userRole,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'All user documents fetched successfully',
      data: result.data,
      pagination: result.pagination,
      summary: result.summary
    });
    
  } catch (error) {
    console.error('❌ Get all user documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get single document by ID
 * GET /api/document/:documentId
 */
export const getDocumentById = async (req, res) => {
  try {
    console.log('📄 Get document by ID request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Import Document model for direct query
    const Document = (await import('../models/document.js')).default;
    
    const document = await Document.findById(documentId)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .populate('speaker', 'firstName lastName email profileImageUrl')
      .populate('relatedBooking', 'bookingId eventDetails');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Verify user has permission to view this document
    const { idToString } = await import('../../utils/db/idUtils.js');
    if (userRole === 'organizer') {
      if (idToString(document.organizer?._id) !== idToString(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view your own documents'
        });
      }
    } else if (userRole === 'speaker') {
      if (idToString(document.speaker?._id) !== idToString(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view documents assigned to you'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Document fetched successfully',
      data: document
    });
    
  } catch (error) {
    console.error('❌ Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update document status
 * PUT /api/document/:documentId/status
 */
export const updateDocumentStatus = async (req, res) => {
  try {
    console.log('🔄 Update document status request received');
    
    const { documentId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status values
    const validStatuses = [
      'uploaded', 'assigned', 'sent', 'pending_review', 
      'approved', 'signed', 'declined', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const result = await documentService.updateDocumentStatus(
      documentId,
      status,
      userId,
      userRole
    );
    
    res.status(200).json({
      success: true,
      message: 'Document status updated successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Update document status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update document status',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Download document
 * GET /api/document/:documentId/download
 */
export const downloadDocument = async (req, res) => {
  try {
    console.log('📥 Document download request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const result = await documentService.downloadDocument(documentId, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Document download processed successfully',
      data: {
        document: result.document,
        downloadUrl: result.downloadUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Download document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process document download',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Delete document
 * DELETE /api/document/:documentId
 */
export const deleteDocument = async (req, res) => {
  try {
    console.log('🗑️ Delete document request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    await documentService.deleteDocument(documentId, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get document statistics for organizer
 * GET /api/document/organizer/stats
 */
export const getOrganizerDocumentStats = async (req, res) => {
  try {
    console.log('📊 Get organizer document stats request received');
    
    const organizerId = req.user._id;
    
    const result = await documentService.getOrganizerDocumentStats(organizerId);
    
    res.status(200).json({
      success: true,
      message: 'Document statistics fetched successfully',
      data: result.stats
    });
    
  } catch (error) {
    console.error('❌ Get organizer document stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch document statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get document statistics for speaker
 * GET /api/document/speaker/stats
 */
export const getSpeakerDocumentStats = async (req, res) => {
  try {
    console.log('📊 Get speaker document stats request received');
    
    const speakerId = req.user._id;
    
    const result = await documentService.getSpeakerDocumentStats(speakerId);
    
    res.status(200).json({
      success: true,
      message: 'Speaker document statistics fetched successfully',
      data: result.stats
    });
    
  } catch (error) {
    console.error('❌ Get speaker document stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch speaker document statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Search documents
 * GET /api/document/search
 */
export const searchDocuments = async (req, res) => {
  try {
    console.log('🔍 Search documents request received');
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const { query, documentType, status, page = 1, limit = 10 } = req.query;
    
    // Import Document model for direct query
    const Document = (await import('../models/document.js')).default;
    const { normalizeId } = await import('../../utils/db/idUtils.js');
    
    // Build search query
    const searchQuery = {};
    
    if (userRole === 'organizer') {
      searchQuery.organizer = normalizeId(userId);
    } else if (userRole === 'speaker') {
      searchQuery.speaker = normalizeId(userId);
    }
    
    if (documentType) {
      searchQuery.documentType = documentType;
    }
    
    if (status) {
      searchQuery.status = status;
    }
    
    if (query) {
      searchQuery.$or = [
        { documentName: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const documents = await Document.find(searchQuery)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .populate('speaker', 'firstName lastName email profileImageUrl')
      .populate('relatedBooking', 'bookingId eventDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Document.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      message: 'Documents search completed successfully',
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Search documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get eligible organizers for speaker (organizers who have booked the speaker)
 * GET /api/document/speaker/eligible-organizers
 */
export const getEligibleOrganizers = async (req, res) => {
  try {
    console.log('👥 Get eligible organizers request received');
    
    const speakerId = req.user._id;
    
    const result = await documentService.getEligibleOrganizers(speakerId);
    
    res.status(200).json({
      success: true,
      message: 'Eligible organizers fetched successfully',
      data: result.organizers,
      total: result.total
    });
    
  } catch (error) {
    console.error('❌ Get eligible organizers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch eligible organizers',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

