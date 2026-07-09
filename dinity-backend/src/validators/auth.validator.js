const { body } = require("express-validator");

/**
 * Validators for /api/v1/auth/* endpoints.
 * Each export is an array of express-validator check() chains.
 * Pass these arrays directly into route definitions before the validate middleware.
 */

const registerValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email address is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["user", "owner"]).withMessage("Role must be either 'user' or 'owner'"),

  body("phone")
    .optional()
    .isMobilePhone("any", { strictMode: false }).withMessage("Please provide a valid phone number"),
];

const loginValidators = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email address is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

const updateProfileValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters"),

  body("phone")
    .optional()
    .isMobilePhone("any", { strictMode: false }).withMessage("Please provide a valid phone number"),
];

module.exports = { registerValidators, loginValidators, updateProfileValidators };
