const { body } = require("express-validator");

const createRestaurantValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Restaurant name is required")
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20, max: 2000 }).withMessage("Description must be between 20 and 2000 characters"),

  body("cuisine")
    .trim()
    .notEmpty().withMessage("Cuisine type is required"),

  body("priceRange")
    .isIn(["$", "$$", "$$$", "$$$$"]).withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required"),

  body("location")
    .optional()
    .trim(),

  body("totalSeats")
    .isInt({ min: 1, max: 500 }).withMessage("Total seats must be a number between 1 and 500"),

  body("availableSlots")
    .optional()
    .custom((value) => {
      // Accept either an array or a JSON string representing an array
      const slots = typeof value === "string" ? JSON.parse(value) : value;
      if (!Array.isArray(slots)) throw new Error("Available slots must be an array");
      const timeRegex = /^\d{2}:\d{2}$/;
      for (const slot of slots) {
        if (!timeRegex.test(slot)) {
          throw new Error(`Invalid time slot format: "${slot}". Use HH:MM`);
        }
      }
      return true;
    }),

  body("chef")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Chef name cannot exceed 100 characters"),

  body("tags")
    .optional(),
];

const updateRestaurantValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage("Description must be between 20 and 2000 characters"),

  body("priceRange")
    .optional()
    .isIn(["$", "$$", "$$$", "$$$$"]).withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  body("totalSeats")
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage("Total seats must be a number between 1 and 500"),
];

module.exports = { createRestaurantValidators, updateRestaurantValidators };
