const { validationResult } = require("express-validator");

/**
 * Validation Runner Middleware.
 *
 * Place this after express-validator check() chains in route definitions.
 * If there are validation errors, it short-circuits the request with a 422
 * and returns all field-level errors in a consistent format.
 *
 * Usage in routes:
 *   router.post("/register", registerValidators, validate, registerController)
 *
 * Error response shape:
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "data": {
 *     "errors": [
 *       { "field": "email", "message": "Must be a valid email address" }
 *     ]
 *   }
 * }
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field:   err.path || err.param,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      data:    { errors: formattedErrors },
    });
  }

  next();
};

module.exports = { validate };
