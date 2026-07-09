/**
 * Standardized API success response wrapper.
 *
 * Every successful response from this API follows this exact shape:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... },
 *   "pagination": { ... }   // only present on paginated list endpoints
 * }
 */
class ApiResponse {
  /**
   * @param {import('express').Response} res - Express response object
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {string} message - Human-readable success message
   * @param {*} data - Response payload (object, array, or null)
   * @param {object} [pagination] - Optional pagination metadata
   */
  static success(res, statusCode, message, data = null, pagination = null) {
    const payload = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
