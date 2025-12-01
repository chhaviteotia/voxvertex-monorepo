import Booking from "../models/booking.js";
import { normalizeId, idToString } from "../../utils/db/idUtils.js";

/**
 * Booking Service - Database-agnostic business logic
 * All database operations are abstracted here for easy migration
 */
class BookingService {
  /**
   * Generate unique booking ID
   * Format: BK-YYYYMMDD-HHMMSS-XXXXX (for easy migration to SQL)
   */
  static generateBookingId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BK-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  }

  /**
   * Create a new booking request
   */
  static async createBooking(bookingData) {
    try {
      const bookingId = this.generateBookingId();
      const booking = new Booking({
        ...bookingData,
        bookingId,
        organizer: normalizeId(bookingData.organizerId),
        speaker: normalizeId(bookingData.speakerId),
        event: bookingData.eventId ? normalizeId(bookingData.eventId) : undefined,
        status: "pending",
      });

      await booking.save();
      return await this.getBookingById(booking._id);
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId))
        .populate("organizer", "firstName lastName email profileImageUrl")
        .populate("speaker", "firstName lastName email profileImageUrl areaOfExpertise")
        .populate("event", "eventName startDate endDate location");

      if (!booking) {
        throw new Error("Booking not found");
      }

      return booking;
    } catch (error) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  }

  /**
   * Get booking by bookingId (string identifier)
   */
  static async getBookingByBookingId(bookingId) {
    try {
      const booking = await Booking.findByBookingId(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }
      return booking;
    } catch (error) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  }

  /**
   * Get all bookings for an organizer
   */
  static async getOrganizerBookings(organizerId, filters = {}) {
    try {
      const bookings = await Booking.findByOrganizer(normalizeId(organizerId), filters);

      // Group by status
      const grouped = {
        inProgress: [],
        confirmed: [],
        declined: [],
      };

      bookings.forEach((booking) => {
        const status = booking.status;
        if (status === "pending" || status === "negotiating") {
          grouped.inProgress.push(booking);
        } else if (status === "accepted") {
          grouped.confirmed.push(booking);
        } else if (status === "declined" || status === "cancelled") {
          grouped.declined.push(booking);
        }
      });

      return {
        bookings: grouped,
        counts: {
          inProgress: grouped.inProgress.length,
          confirmed: grouped.confirmed.length,
          declined: grouped.declined.length,
          total: bookings.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get organizer bookings: ${error.message}`);
    }
  }

  /**
   * Get all bookings for a speaker
   */
  static async getSpeakerBookings(speakerId, filters = {}) {
    try {
      const bookings = await Booking.findBySpeaker(normalizeId(speakerId), filters);

      // Group by status
      const grouped = {
        pending: [],
        accepted: [],
        declined: [],
      };

      bookings.forEach((booking) => {
        const status = booking.status;
        if (status === "pending" || status === "negotiating") {
          grouped.pending.push(booking);
        } else if (status === "accepted") {
          grouped.accepted.push(booking);
        } else if (status === "declined" || status === "cancelled") {
          grouped.declined.push(booking);
        }
      });

      return {
        bookings: grouped,
        counts: {
          pending: grouped.pending.length,
          accepted: grouped.accepted.length,
          declined: grouped.declined.length,
          total: bookings.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get speaker bookings: ${error.message}`);
    }
  }

  /**
   * Accept a booking (speaker action)
   */
  static async acceptBooking(bookingId, speakerId) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (idToString(booking.speaker) !== idToString(speakerId)) {
        throw new Error("Not authorized to accept this booking");
      }

      await booking.accept(normalizeId(speakerId));
      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to accept booking: ${error.message}`);
    }
  }

  /**
   * Decline a booking (speaker action)
   */
  static async declineBooking(bookingId, speakerId, reason) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (idToString(booking.speaker) !== idToString(speakerId)) {
        throw new Error("Not authorized to decline this booking");
      }

      await booking.decline(normalizeId(speakerId), reason);
      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to decline booking: ${error.message}`);
    }
  }

  /**
   * Cancel a booking (organizer or speaker action)
   */
  static async cancelBooking(bookingId, userId) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }

      const isOrganizer = idToString(booking.organizer) === idToString(userId);
      const isSpeaker = idToString(booking.speaker) === idToString(userId);

      if (!isOrganizer && !isSpeaker) {
        throw new Error("Not authorized to cancel this booking");
      }

      await booking.cancel(normalizeId(userId));
      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  /**
   * Add negotiation proposal
   */
  static async addNegotiation(bookingId, initiatedBy, proposedAmount, message) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }

      const isOrganizer = idToString(booking.organizer) === idToString(initiatedBy);
      const isSpeaker = idToString(booking.speaker) === idToString(initiatedBy);

      if (!isOrganizer && !isSpeaker) {
        throw new Error("Not authorized to negotiate this booking");
      }

      await booking.addNegotiation(normalizeId(initiatedBy), proposedAmount, message);
      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to add negotiation: ${error.message}`);
    }
  }

  /**
   * Update booking details (organizer only)
   */
  static async updateBooking(bookingId, organizerId, updateData) {
    try {
      const booking = await Booking.findById(normalizeId(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (idToString(booking.organizer) !== idToString(organizerId)) {
        throw new Error("Not authorized to update this booking");
      }

      // Only allow updates to certain fields
      const allowedFields = [
        "eventDetails",
        "compensationAndArrangements",
        "organizerNotes",
        "tags",
      ];

      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          booking[field] = updateData[field];
        }
      });

      await booking.save();
      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  /**
   * Get booking statistics for organizer
   */
  static async getOrganizerStats(organizerId) {
    try {
      const bookings = await Booking.findByOrganizer(normalizeId(organizerId));
      
      const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        negotiating: bookings.filter((b) => b.status === "negotiating").length,
        accepted: bookings.filter((b) => b.status === "accepted").length,
        declined: bookings.filter((b) => b.status === "declined").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        completed: bookings.filter((b) => b.status === "completed").length,
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get organizer stats: ${error.message}`);
    }
  }

  /**
   * Get booking statistics for speaker
   */
  static async getSpeakerStats(speakerId) {
    try {
      const bookings = await Booking.findBySpeaker(normalizeId(speakerId));
      
      const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending" || b.status === "negotiating").length,
        accepted: bookings.filter((b) => b.status === "accepted").length,
        declined: bookings.filter((b) => b.status === "declined").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        completed: bookings.filter((b) => b.status === "completed").length,
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get speaker stats: ${error.message}`);
    }
  }
}

export default BookingService;

