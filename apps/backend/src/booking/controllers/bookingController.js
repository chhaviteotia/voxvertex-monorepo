import BookingService from "../services/booking.service.js";
import { normalizeId, isValidId } from "../../utils/db/idUtils.js";

/**
 * Booking Controller - Handles HTTP requests for booking operations
 * Database-agnostic - uses service layer for all database operations
 */

/**
 * Create a new booking request (Organizer)
 * POST /api/booking
 */
export const createBooking = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const {
      speakerId,
      eventId,
      eventDetails,
      compensationAndArrangements,
      organizerNotes,
      tags,
    } = req.body;

    // Validation
    if (!speakerId || !isValidId(speakerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid speaker ID is required",
      });
    }

    if (!eventDetails || !eventDetails.eventName || !eventDetails.date) {
      return res.status(400).json({
        success: false,
        message: "Event details (eventName, date) are required",
      });
    }

    if (
      !compensationAndArrangements ||
      !compensationAndArrangements.primaryCompensation ||
      !compensationAndArrangements.primaryCompensation.speakerFeeAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Compensation details are required",
      });
    }

    const booking = await BookingService.createBooking({
      organizerId,
      speakerId,
      eventId,
      eventDetails,
      compensationAndArrangements,
      organizerNotes,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

/**
 * Get booking by ID
 * GET /api/booking/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingService.getBookingById(id);

    // Check authorization
    const isOrganizer = booking.organizer._id.toString() === userId.toString();
    const isSpeaker = booking.speaker._id.toString() === userId.toString();

    if (!isOrganizer && !isSpeaker) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get booking",
    });
  }
};

/**
 * Get all bookings for organizer
 * GET /api/booking/organizer
 */
export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { status } = req.query;

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const result = await BookingService.getOrganizerBookings(organizerId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get organizer bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get organizer bookings",
    });
  }
};

/**
 * Get all bookings for speaker
 * GET /api/booking/speaker
 */
export const getSpeakerBookings = async (req, res) => {
  try {
    const speakerId = req.user._id;
    const { status } = req.query;

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const result = await BookingService.getSpeakerBookings(speakerId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get speaker bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get speaker bookings",
    });
  }
};

/**
 * Accept booking (Speaker)
 * POST /api/booking/:id/accept
 */
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const speakerId = req.user._id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingService.acceptBooking(id, speakerId);

    res.json({
      success: true,
      message: "Booking accepted successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to accept booking",
    });
  }
};

/**
 * Decline booking (Speaker)
 * POST /api/booking/:id/decline
 */
export const declineBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const speakerId = req.user._id;
    const { reason } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingService.declineBooking(id, speakerId, reason);

    res.json({
      success: true,
      message: "Booking declined successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Decline booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to decline booking",
    });
  }
};

/**
 * Cancel booking (Organizer or Speaker)
 * POST /api/booking/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingService.cancelBooking(id, userId);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel booking",
    });
  }
};

/**
 * Add negotiation proposal
 * POST /api/booking/:id/negotiate
 */
export const addNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { proposedAmount, message } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!proposedAmount || proposedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid proposed amount is required",
      });
    }

    const booking = await BookingService.addNegotiation(
      id,
      userId,
      proposedAmount,
      message
    );

    res.json({
      success: true,
      message: "Negotiation proposal added successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Add negotiation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add negotiation",
    });
  }
};

/**
 * Update booking (Organizer)
 * PUT /api/booking/:id
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user._id;
    const updateData = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingService.updateBooking(id, organizerId, updateData);

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking",
    });
  }
};

/**
 * Get booking statistics for organizer
 * GET /api/booking/organizer/stats
 */
export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const stats = await BookingService.getOrganizerStats(organizerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get organizer stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get organizer stats",
    });
  }
};

/**
 * Get booking statistics for speaker
 * GET /api/booking/speaker/stats
 */
export const getSpeakerStats = async (req, res) => {
  try {
    const speakerId = req.user._id;
    const stats = await BookingService.getSpeakerStats(speakerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get speaker stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get speaker stats",
    });
  }
};

