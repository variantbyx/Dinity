const ApiError = require("../utils/ApiError");

/**
 * Centralized Express error handling middleware.
 *
 * Must be the LAST middleware registered in app.js (after all routes).
 * Catches every error thrown via next(error) or throw in async handlers.
 *
 * Error response shape is always:
 * {
 *   "success": false,
 *   "message": "...",
 *   "data": null
 * }
 */
const errorMiddleware = (err, req, res, next) => {
  // Clone so we don't mutate the original error object
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";

  // ── Mongoose: Document not found ─────────────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message    = "Resource not found (invalid ID format)";
  }

  // ── Mongoose: Duplicate key (e.g. unique email) ───────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode  = 409;
    message     = `An account with this ${field} already exists`;
  }

  // ── Mongoose: Validation error ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT: Invalid token ────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid or malformed authentication token";
  }

  // ── JWT: Expired token ────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Your session has expired. Please log in again";
  }

  // ── Non-operational errors (bugs): do not leak internals in production ────
  if (!err.isOperational && process.env.NODE_ENV === "production") {
    console.error("[ERROR] Non-operational error:", err);
    statusCode = 500;
    message    = "An unexpected error occurred. Please try again later.";
  }

  // Log all errors in development for easy debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${statusCode} — ${message}`);
    if (!err.isOperational) console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    data:    null,
  });
};

module.exports = errorMiddleware;
