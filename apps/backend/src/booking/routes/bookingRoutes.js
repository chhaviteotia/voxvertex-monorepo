import express from "express";
import {
  createBooking,
  getBookingById,
  getOrganizerBookings,
  getSpeakerBookings,
  acceptBooking,
  declineBooking,
  cancelBooking,
  addNegotiation,
  updateBooking,
  getOrganizerStats,
  getSpeakerStats,
} from "../controllers/bookingController.js";
import { authenticateJWT, authorizeRoles } from "../../middleware/jwtAuth.js";

const router = express.Router();

/**
 * Booking Routes
 * All routes require authentication
 * 
 * Organizer routes: create, update, view own bookings
 * Speaker routes: accept, decline, view own bookings
 * Both: cancel, negotiate, view booking details
 */

// Create booking (Organizer only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["organizer"]),
  createBooking
);

// Get booking by ID (Organizer or Speaker)
router.get("/:id", authenticateJWT, getBookingById);

// Get all bookings for organizer
router.get(
  "/organizer/all",
  authenticateJWT,
  authorizeRoles(["organizer"]),
  getOrganizerBookings
);

// Get all bookings for speaker
router.get(
  "/speaker/all",
  authenticateJWT,
  authorizeRoles(["speaker"]),
  getSpeakerBookings
);

// Accept booking (Speaker only)
router.post(
  "/:id/accept",
  authenticateJWT,
  authorizeRoles(["speaker"]),
  acceptBooking
);

// Decline booking (Speaker only)
router.post(
  "/:id/decline",
  authenticateJWT,
  authorizeRoles(["speaker"]),
  declineBooking
);

// Cancel booking (Organizer or Speaker)
router.post(
  "/:id/cancel",
  authenticateJWT,
  authorizeRoles(["organizer", "speaker"]),
  cancelBooking
);

// Add negotiation proposal (Organizer or Speaker)
router.post(
  "/:id/negotiate",
  authenticateJWT,
  authorizeRoles(["organizer", "speaker"]),
  addNegotiation
);

// Update booking (Organizer only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["organizer"]),
  updateBooking
);

// Get booking statistics for organizer
router.get(
  "/organizer/stats",
  authenticateJWT,
  authorizeRoles(["organizer"]),
  getOrganizerStats
);

// Get booking statistics for speaker
router.get(
  "/speaker/stats",
  authenticateJWT,
  authorizeRoles(["speaker"]),
  getSpeakerStats
);

export default router;

