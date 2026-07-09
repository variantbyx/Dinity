const { body } = require("express-validator");

const createBookingValidators = [
  body("restaurantId")
    .notEmpty().withMessage("Restaurant ID is required")
    .isMongoId().withMessage("Invalid restaurant ID"),

  body("date")
    .notEmpty().withMessage("Booking date is required")
    .isISO8601().withMessage("Date must be a valid ISO 8601 date string")
    .custom((value) => {
      const bookingDate = new Date(value);
      const today       = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        throw new Error("Booking date cannot be in the past");
      }
      return true;
    }),

  body("time")
    .notEmpty().withMessage("Booking time is required")
    .matches(/^\d{2}:\d{2}$/).withMessage("Time must be in HH:MM format (e.g. 19:00)"),

  body("guests")
    .isInt({ min: 1, max: 20 }).withMessage("Guests must be between 1 and 20"),

  body("occasion")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Occasion cannot exceed 100 characters"),

  body("specialRequests")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Special requests cannot exceed 500 characters"),
];

module.exports = { createBookingValidators };
