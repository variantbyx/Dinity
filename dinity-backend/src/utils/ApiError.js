/**
 * Custom error class for operational errors (predictable, safe-to-expose errors).
 *
 * Operational errors are things like "user not found", "wrong password",
 * "unauthorized access" — as opposed to programmer bugs or infrastructure failures.
 *
 * The centralized error middleware checks `error.isOperational` to decide
 * whether to expose the message to the client or return a generic 500.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 422, etc.)
   * @param {string} message - Error message safe to return to the client
   */
  constructor(statusCode, message) {
    super(message);

    this.statusCode      = statusCode;
    this.isOperational   = true; // Marks this as an expected, handled error

    // Capture stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
