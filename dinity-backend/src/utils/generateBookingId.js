const crypto = require("crypto");

/**
 * Generates a unique booking reference ID in the format GR-XXXXXXXX.
 *
 * This matches the format already used in the frontend:
 * "GR-71B448A7", "GR-17743C76", "GR-F82DDD63", etc.
 *
 * Uses Node's crypto module for cryptographically random bytes,
 * which avoids the birthday-problem collisions of Math.random().
 *
 * @returns {string} e.g. "GR-A3F9C120"
 */
const generateBookingId = () => {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `GR-${hex}`;
};

module.exports = generateBookingId;
