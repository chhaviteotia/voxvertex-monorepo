import Availability from '../models/availability.js';

// Get availability for a specific month
export const getAvailability = async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    // Create date range for the month
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const availabilityDocs = await Availability.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Filter out blocked time slots for each availability
    const filteredAvailability = availabilityDocs.map(doc => {
      const availabilityObj = doc.toObject();
      // Replace timeSlots with available (non-blocked) time slots
      availabilityObj.timeSlots = doc.getAvailableTimeSlots();
      return availabilityObj;
    });

    res.status(200).json({ success: true, data: filteredAvailability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
};

// Get availability for a specific speaker (for organizers to view)
export const getSpeakerAvailability = async (req, res) => {
  try {
    const { speakerId } = req.params;

    console.log("🔍 getSpeakerAvailability called with:", { speakerId });

    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: "Speaker ID is required",
      });
    }

    // Build query for date range
    let query = { userId: speakerId };

    console.log("🔍 Query:", query);

    const availabilityDocs = await Availability.find(query).sort({ date: 1 });

    console.log("🔍 Found availability docs matching query:", availabilityDocs.length);

    if (!availabilityDocs || availabilityDocs.length === 0) {
      console.log("⚠️ No availability found for speaker:", speakerId);
      return res.status(404).json({
        success: false,
        message: "No availability found for this speaker",
      });
    }

    // Filter out blocked time slots for each availability
    const filteredAvailabilityDocs = availabilityDocs.map(doc => {
      const availabilityObj = doc.toObject();
      // Replace timeSlots with available (non-blocked) time slots
      availabilityObj.timeSlots = doc.getAvailableTimeSlots();
      return availabilityObj;
    });

    // Extract dates safely (skip if no date)
    const availableDates = filteredAvailabilityDocs
      .filter(doc => doc.date instanceof Date)
      .map(doc => doc.date.toISOString().split("T")[0]);

    // Pick common settings from the first valid doc
    const firstValidDoc = filteredAvailabilityDocs.find(doc => doc.date instanceof Date) || filteredAvailabilityDocs[0];

    console.log("🔍 Available dates (formatted):", availableDates);

    return res.status(200).json({
      success: true,
      data: {
        speakerId: speakerId,
        dates: availableDates,
        eventTypes: firstValidDoc?.eventTypes || [],
        modes: firstValidDoc?.modes || [],
        timeSlots: firstValidDoc?.timeSlots || [],
        count: availabilityDocs.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching speaker availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speaker availability",
    });
  }
};

// Get availability for a date range (query: startDate, endDate)
export const getAvailabilityByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    // Convert query dates to proper Date objects
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    
    const availabilities = await Availability.find({
      userId: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    return res.status(200).json({ 
      success: true,
      count: availabilities.length,
      data: availabilities 
    });

  } catch (error) {
    console.error("Error fetching availability by range:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get availability by ID
export const getAvailabilityById = async (req, res) => {
  try {
    const { availabilityId } = req.params;

    // Fetch the availability
    const availability = await Availability.findOne({
      _id: availabilityId,
      userId: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching availability by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
    });
  }
};

// Set availability for single or multiple dates - creates separate documents per date
export const setAvailability = async (req, res, next) => {
  try {
    // Only speakers can set availability
    if (req.user.role !== "speaker") {
      return res.status(403).json({ 
        success: false,
        message: "Only speakers can set availability" 
      });
    }

    const { dates, eventTypes, modes, timeSlots } = req.body;
    const userId = req.user._id;

    console.log("📅 Setting availability for SPEAKER:", userId, { dates, eventTypes, modes, timeSlots });

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one date is required" 
      });
    }

    // Create/update separate Availability documents for each date
    const results = [];
    
    for (const dateStr of dates) {
      let date;
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-").map(Number);
        date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // store as UTC
      } else {
        date = new Date(dateStr);
      }

      const availability = await Availability.findOneAndUpdate(
        { userId, date },
        {
          $set: {
            eventTypes,
            modes,
            timeSlots,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
            userId,
            date,
          },
        },
        { new: true, upsert: true }
      );
      
      results.push(availability);
    }

    console.log("✅ Availability saved successfully:", {
      documentsCreated: results.length,
      datesCount: dates.length,
      userId: userId
    });

    return res.status(200).json({
      success: true,
      message: `Availability updated for ${dates.length} date(s)`,
      data: {
        documentsCreated: results.length,
        datesCount: dates.length,
        dates: dates,
        eventTypes: results[0]?.eventTypes || eventTypes,
        modes: results[0]?.modes || modes,
        timeSlots: results[0]?.timeSlots || timeSlots,
        availabilities: results
      },
    });
  } catch (error) {
    console.error("❌ Error setting availability:", error);
    next(error);
  }
};

// Delete availability for specific dates
export const deleteAvailability = async (req, res) => {
  try {
    const { dates } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dates array is required' 
      });
    }

    // Normalize dates to UTC midnight for consistent comparison
    const normalizedDates = dates.map(d => {
      let date;
      if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = d.split("-").map(Number);
        date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      } else {
        date = new Date(d);
        date.setHours(0, 0, 0, 0);
      }
      return date;
    });

    const result = await Availability.deleteMany({
      userId,
      date: { $in: normalizedDates }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} availability entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete availability' 
    });
  }
};

