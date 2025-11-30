import { Router } from 'express';
import {
    createDispute,
    getUserDisputes,
    getDisputeById,
    addMessage,
    escalateDispute,
    assignMediator,
    resolveDispute,
    getDisputeStats,
    submitEvidence
} from '../controllers/disputeController.js';
import { authenticateJWT } from '../../middleware/jwtAuth.js';

const router = Router();

/**
 * Dispute Routes
 * All routes require authentication via JWT middleware
 * 
 * Routes:
 * - POST   /                    Create new dispute
 * - GET    /                    Get user's disputes (with pagination)
 * - GET    /stats               Get dispute statistics
 * - GET    /:disputeId          Get specific dispute by ID
 * - POST   /:disputeId/messages Add message to dispute
 * - POST   /:disputeId/escalate Escalate dispute to next stage
 * - POST   /:disputeId/resolve  Resolve dispute
 * - POST   /:disputeId/evidence Submit evidence to dispute
 * - POST   /:disputeId/assign-mediator Assign mediator (admin/mediator only)
 */

// All dispute routes require authentication
router.use(authenticateJWT);

// Dispute CRUD operations
router.post('/', createDispute);                    // Create new dispute
router.get('/', getUserDisputes);                   // Get user's disputes
router.get('/stats', getDisputeStats);             // Get dispute statistics
router.get('/:disputeId', getDisputeById);         // Get specific dispute

// Dispute actions
router.post('/:disputeId/messages', addMessage);           // Add message to dispute
router.post('/:disputeId/escalate', escalateDispute);      // Escalate dispute
router.post('/:disputeId/resolve', resolveDispute);        // Resolve dispute
router.post('/:disputeId/evidence', submitEvidence);       // Submit evidence

// Mediation specific
router.post('/:disputeId/assign-mediator', assignMediator); // Assign mediator

export default router;

