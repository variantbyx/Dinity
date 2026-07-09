const Booking            = require("../models/Booking.model");
const Restaurant         = require("../models/Restaurant.model");
const ApiResponse        = require("../utils/ApiResponse");
const ApiError           = require("../utils/ApiError");
const generateBookingId  = require("../utils/generateBookingId");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new booking with conflict detection
// @route   POST /api/v1/bookings
// @access  Private (user)
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { restaurantId, date, time, guests, occasion, specialRequests } = req.body;

    // ── Validate restaurant exists and is approved ────────────────────────────
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.status !== "approved") {
      return next(new ApiError(404, "Restaurant not found or not accepting reservations."));
    }

    // ── Validate the time slot is offered by this restaurant ──────────────────
    if (!restaurant.availableSlots.includes(time)) {
      return next(
        new ApiError(400, `Time slot "${time}" is not available at this restaurant.`)
      );
    }

    // ── Booking Conflict Detection ─────────────────────────────────────────────
    // Count total guests already booked for this restaurant + date + time
    const bookingDate = new Date(date);
    const nextDay     = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflictAggregation = await Booking.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          date:       { $gte: bookingDate, $lt: nextDay },
          time,
          status:     { $in: ["confirmed", "pending"] },
        },
      },
      {
        $group: {
          _id:          null,
          totalBooked:  { $sum: "$guests" },
        },
      },
    ]);

    const totalBooked     = conflictAggregation[0]?.totalBooked || 0;
    const remainingSeats  = restaurant.totalSeats - totalBooked;

    if (remainingSeats < guests) {
      return next(
        new ApiError(
          409,
          `Not enough seats available. Only ${Math.max(0, remainingSeats)} seat(s) remaining for this slot.`
        )
      );
    }

    // ── Prevent duplicate bookings for the same user on the same date/time ────
    const duplicateBooking = await Booking.findOne({
      user:       req.user._id,
      restaurant: restaurant._id,
      date:       { $gte: bookingDate, $lt: nextDay },
      time,
      status:     { $in: ["confirmed", "pending"] },
    });

    if (duplicateBooking) {
      return next(
        new ApiError(409, "You already have an active booking for this restaurant at this date and time.")
      );
    }

    // ── Create the booking ────────────────────────────────────────────────────
    const booking = await Booking.create({
      user:            req.user._id,
      restaurant:      restaurant._id,
      date:            bookingDate,
      time,
      guests:          parseInt(guests, 10),
      occasion:        occasion        || "",
      specialRequests: specialRequests || "",
      status:          "confirmed",
      bookingId:       generateBookingId(),
    });

    // Populate for the frontend response (matches dummyBookingData shape)
    await booking.populate([
      { path: "user",       select: "name email phone" },
      { path: "restaurant", select: "name slug location address image cuisine" },
    ]);

    return ApiResponse.success(res, 201, "Table reserved successfully.", booking);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all bookings for the currently logged-in user
// @route   GET /api/v1/bookings/my
// @access  Private (user)
// ─────────────────────────────────────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip       = (pageNumber - 1) * pageSize;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("restaurant", "name slug location address image cuisine")
        .sort({ date: -1 }) // Most recent first
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return ApiResponse.success(
      res,
      200,
      "Bookings retrieved successfully.",
      bookings,
      { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Cancel a booking (user cancels their own booking)
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private (user who owns the booking)
// ─────────────────────────────────────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ApiError(404, "Booking not found."));
    }

    // Only the user who made the booking can cancel it
    if (String(booking.user) !== String(req.user._id)) {
      return next(new ApiError(403, "You are not authorized to cancel this booking."));
    }

    if (booking.status === "cancelled") {
      return next(new ApiError(400, "This booking is already cancelled."));
    }

    if (booking.status === "completed") {
      return next(new ApiError(400, "Completed bookings cannot be cancelled."));
    }

    booking.status = "cancelled";
    await booking.save();

    return ApiResponse.success(res, 200, "Booking cancelled successfully.", booking);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all bookings for the owner's restaurant
// @route   GET /api/v1/bookings/restaurant
// @access  Private (owner)
// ─────────────────────────────────────────────────────────────────────────────
const getRestaurantBookings = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return next(new ApiError(404, "You don't have a registered restaurant yet."));
    }

    const { status, date, page = 1, limit = 20 } = req.query;

    const filter = { restaurant: restaurant._id };
    if (status) filter.status = status;

    // Filter by specific date if provided
    if (date) {
      const targetDate = new Date(date);
      const nextDay    = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip       = (pageNumber - 1) * pageSize;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "name email phone")
        .sort({ date: -1, time: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return ApiResponse.success(
      res,
      200,
      "Restaurant bookings retrieved successfully.",
      bookings,
      { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getRestaurantBookings };
