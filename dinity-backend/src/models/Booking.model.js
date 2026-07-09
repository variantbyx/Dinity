const mongoose = require("mongoose");

/**
 * Booking Model
 *
 * Field names mirror the frontend's dummyMyBookingsData and dummyBookingData exactly.
 * The `restaurant` field stores a snapshot of key restaurant details so that
 * bookings remain valid even if the restaurant changes its info later.
 */
const bookingSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Booking must belong to a user"],
    },

    restaurant: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Restaurant",
      required: [true, "Booking must reference a restaurant"],
    },

    // ── Reservation Details ───────────────────────────────────────────────────
    date: {
      type:     Date,
      required: [true, "Booking date is required"],
    },

    time: {
      type:     String, // "HH:MM" format, e.g. "19:00"
      required: [true, "Booking time is required"],
      match:    [/^\d{2}:\d{2}$/, "Time must be in HH:MM format"],
    },

    guests: {
      type:    Number,
      required:[true, "Number of guests is required"],
      min:     [1,  "At least 1 guest is required"],
      max:     [20, "Maximum 20 guests per booking"],
    },

    // ── Optional Fields ───────────────────────────────────────────────────────
    occasion: {
      type:    String,
      trim:    true,
      default: "",
    },

    specialRequests: {
      type:    String,
      trim:    true,
      default: "",
      maxLength: [500, "Special requests cannot exceed 500 characters"],
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed", // Auto-confirm on creation (owner can change later)
    },

    // ── Unique Booking Reference ───────────────────────────────────────────────
    bookingId: {
      type:   String,
      unique: true,
      index:  true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Compound index for conflict detection ─────────────────────────────────────
// Used to count existing bookings for (restaurant, date, time) in O(log n)
bookingSchema.index({ restaurant: 1, date: 1, time: 1, status: 1 });

// ── Index for user's booking history queries ──────────────────────────────────
bookingSchema.index({ user: 1, date: -1 });

// ── Index for owner's restaurant booking queries ──────────────────────────────
bookingSchema.index({ restaurant: 1, date: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
