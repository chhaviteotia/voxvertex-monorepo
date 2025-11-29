import { Router } from 'express';
import {
  getAvailability,
  setAvailability,
  getAvailabilityByDateRange,
  deleteAvailability,
  getAvailabilityById,
  getSpeakerAvailability,
} from '../controllers/availabilityController.js';

import { authenticateJWT } from '../../middleware/jwtAuth.js';
import { 
  validateAvailabilityId, 
  validateGetAvailability, 
  validateAvailability 
} from '../middleware/availabilityMiddleware.js';

const router = Router();

// Public route for organizers (MUST be before authentication middleware and other routes)
router.get("/speaker/:speakerId", getSpeakerAvailability);

// Apply authentication to all remaining routes
router.use(authenticateJWT);

// Get availability for a date range: GET /api/availability/range?startDate=...&endDate=...
// This must come before parameterized routes to avoid route conflicts
router.get('/range', getAvailabilityByDateRange);

// Get availability for a specific month: GET /api/availability/:year/:month
// This route uses two parameters, so it won't conflict with single-parameter routes
router.get('/:year/:month', validateGetAvailability, getAvailability);

// Get availability by ID: GET /api/availability/:availabilityId
// This route comes after /:year/:month because Express matches routes in order
// Since /:year/:month has two parameters, it won't match single-parameter requests
// But to be safe, we validate that availabilityId is a valid ObjectId
router.get("/:availabilityId", validateAvailabilityId, getAvailabilityById);

// Set availability for single or multiple dates
router.post('/', validateAvailability, setAvailability);

// Delete availability for specific dates
router.delete('/', deleteAvailability);

export default router;

