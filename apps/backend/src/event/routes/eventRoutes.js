import express from 'express';
import {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  getUserEvents,
  updateEvent,
  deleteEvent,
  publishEvent,
  validateEvent,
  getDisputeEligibleEvents,
  uploadBanner,
  uploadBannerImage
} from '../controllers/eventController.js';
import { authenticateJWT, authorizeRoles } from '../../middleware/jwtAuth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllEvents); // Get all published events
router.get('/upcoming', getUpcomingEvents); // Get upcoming events with available tickets

// Apply authentication to all other routes
router.use(authenticateJWT);

// Protected routes
router.get('/user/me', getUserEvents); // Get user's events (role-based)
router.get('/dispute-eligible', getDisputeEligibleEvents); // Get events eligible for disputes
router.get('/:id', getEventById); // Get specific event (with access control)

// Organizer-only routes
router.post('/', authorizeRoles('organizer'), createEvent);
router.put('/:id', authorizeRoles('organizer'), updateEvent);
router.delete('/:id', authorizeRoles('organizer'), deleteEvent);
router.patch('/:id/publish', authorizeRoles('organizer'), publishEvent);
router.post('/:id/validate', authorizeRoles('organizer'), validateEvent);

// Banner image upload (Organizer only)
router.post('/upload/banner', authorizeRoles('organizer'), uploadBannerImage, uploadBanner);

export default router;

