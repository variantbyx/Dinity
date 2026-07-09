const express = require("express");

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getRestaurantBookings,
} = require("../controllers/booking.controller");

const { protect }   = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate }  = require("../middleware/validate.middleware");
const { createBookingValidators } = require("../validators/booking.validator");

const router = express.Router();

// All booking routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Table reservation management
 */

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get all bookings for the current user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: User's bookings (most recent first)
 */
router.get("/my", authorize("user", "admin"), getMyBookings);

/**
 * @swagger
 * /bookings/restaurant:
 *   get:
 *     summary: Get all bookings for the owner's restaurant
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Filter by specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Restaurant bookings
 *       404:
 *         description: Owner has no registered restaurant
 */
router.get("/restaurant", authorize("owner"), getRestaurantBookings);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new table booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurantId, date, time, guests]
 *             properties:
 *               restaurantId:    { type: string }
 *               date:            { type: string, format: date }
 *               time:            { type: string, example: "19:00" }
 *               guests:          { type: integer, minimum: 1, maximum: 20 }
 *               occasion:        { type: string }
 *               specialRequests: { type: string }
 *     responses:
 *       201:
 *         description: Booking confirmed
 *       409:
 *         description: No seats available or duplicate booking
 *       400:
 *         description: Invalid time slot or past date
 */
router.post("/", authorize("user"), createBookingValidators, validate, createBooking);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       403:
 *         description: Not your booking
 *       400:
 *         description: Already cancelled or completed
 */
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
