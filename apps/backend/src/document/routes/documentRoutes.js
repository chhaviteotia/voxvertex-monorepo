import express from 'express';
import multer from 'multer';
import { authenticateJWT, authorizeRoles } from '../../middleware/jwtAuth.js';
import {
  uploadDocument,
  assignDocumentToSpeaker,
  sendDocumentToSpeaker,
  assignDocumentToOrganizer,
  sendDocumentToOrganizer,
  getOrganizerDocuments,
  getSpeakerDocuments,
  getAllUserDocuments,
  updateDocumentStatus,
  downloadDocument,
  deleteDocument,
  getOrganizerDocumentStats,
  getSpeakerDocumentStats,
  getDocumentById,
  searchDocuments,
  getEligibleOrganizers
} from '../controllers/documentController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Multer fileFilter - file:', file);
    console.log('🔍 Multer fileFilter - mimetype:', file.mimetype);
    
    // Allow only PDF, DOC, and DOCX files
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log('✅ File type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, DOC, and DOCX files are allowed.`), false);
    }
  }
});

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// ============================================================================
// DOCUMENT UPLOAD ROUTES
// ============================================================================

/**
 * @route   POST /api/document/upload
 * @desc    Upload a new document
 * @access  Private (Organizer or Speaker)
 * @body    { documentName, documentType, tags?, notes? }
 * @file    file (PDF, DOC, DOCX)
 */
router.post('/upload', authorizeRoles('organizer', 'speaker'), upload.single('file'), uploadDocument);

// ============================================================================
// DOCUMENT ASSIGNMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/document/:documentId/assign
 * @desc    Assign document to a speaker
 * @access  Private (Organizer only)
 * @body    { speakerId, relatedBookingId? }
 */
router.post('/:documentId/assign', authorizeRoles('organizer'), assignDocumentToSpeaker);

/**
 * @route   POST /api/document/:documentId/send
 * @desc    Send document to speaker
 * @access  Private (Organizer only)
 */
router.post('/:documentId/send', authorizeRoles('organizer'), sendDocumentToSpeaker);

/**
 * @route   POST /api/document/:documentId/assign-organizer
 * @desc    Assign document to an organizer (for speakers)
 * @access  Private (Speaker only)
 * @body    { organizerId, relatedBookingId? }
 */
router.post('/:documentId/assign-organizer', authorizeRoles('speaker'), assignDocumentToOrganizer);

/**
 * @route   POST /api/document/:documentId/send-to-organizer
 * @desc    Send document to organizer
 * @access  Private (Speaker only)
 */
router.post('/:documentId/send-to-organizer', authorizeRoles('speaker'), sendDocumentToOrganizer);

// ============================================================================
// DOCUMENT RETRIEVAL ROUTES
// ============================================================================

/**
 * @route   GET /api/document/organizer
 * @desc    Get organizer's documents
 * @access  Private (Organizer only)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/organizer', authorizeRoles('organizer'), getOrganizerDocuments);

/**
 * @route   GET /api/document/speaker
 * @desc    Get speaker's documents
 * @access  Private (Speaker only)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/speaker', authorizeRoles('speaker'), getSpeakerDocuments);

/**
 * @route   GET /api/document/all
 * @desc    Get all documents for current user (both incoming and outgoing)
 * @access  Private (Organizer or Speaker)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/all', authorizeRoles('organizer', 'speaker'), getAllUserDocuments);

/**
 * @route   GET /api/document/:documentId
 * @desc    Get single document by ID
 * @access  Private (Organizer or Speaker)
 */
router.get('/:documentId', authorizeRoles('organizer', 'speaker'), getDocumentById);

// ============================================================================
// DOCUMENT STATUS ROUTES
// ============================================================================

/**
 * @route   PUT /api/document/:documentId/status
 * @desc    Update document status
 * @access  Private (Organizer or Speaker)
 * @body    { status }
 */
router.put('/:documentId/status', authorizeRoles('organizer', 'speaker'), updateDocumentStatus);

// ============================================================================
// DOCUMENT ACTION ROUTES
// ============================================================================

/**
 * @route   GET /api/document/:documentId/download
 * @desc    Download document (track download)
 * @access  Private (Organizer or Speaker)
 */
router.get('/:documentId/download', authorizeRoles('organizer', 'speaker'), downloadDocument);

/**
 * @route   DELETE /api/document/:documentId
 * @desc    Delete document
 * @access  Private (Organizer only)
 */
router.delete('/:documentId', authorizeRoles('organizer'), deleteDocument);

// ============================================================================
// DOCUMENT STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/document/organizer/stats
 * @desc    Get document statistics for organizer
 * @access  Private (Organizer only)
 */
router.get('/organizer/stats', authorizeRoles('organizer'), getOrganizerDocumentStats);

/**
 * @route   GET /api/document/speaker/stats
 * @desc    Get document statistics for speaker
 * @access  Private (Speaker only)
 */
router.get('/speaker/stats', authorizeRoles('speaker'), getSpeakerDocumentStats);

// ============================================================================
// DOCUMENT SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/document/search
 * @desc    Search documents
 * @access  Private (Organizer or Speaker)
 * @query   { query?, documentType?, status?, page?, limit? }
 */
router.get('/search', authorizeRoles('organizer', 'speaker'), searchDocuments);

/**
 * @route   GET /api/document/speaker/eligible-organizers
 * @desc    Get organizers who have booked the speaker (for document assignment)
 * @access  Private (Speaker only)
 */
router.get('/speaker/eligible-organizers', authorizeRoles('speaker'), getEligibleOrganizers);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

// Handle other errors
router.use((error, req, res) => {
  console.error('❌ Document route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;

