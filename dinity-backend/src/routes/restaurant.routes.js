const express = require("express");

const {
  getRestaurants,
  getRestaurantBySlug,
  getMyRestaurant,
  getAvailability,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurant.controller");

const { protect }               = require("../middleware/auth.middleware");
const { authorize }             = require("../middleware/role.middleware");
const { uploadRestaurantImage } = require("../middleware/upload.middleware");
const { validate }              = require("../middleware/validate.middleware");
const {
  createRestaurantValidators,
  updateRestaurantValidators,
} = require("../validators/restaurant.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant discovery and management
 */

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: List all approved restaurants (paginated, filtered, sorted)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search across name, description, cuisine, tags
 *       - in: query
 *         name: cuisine
 *         schema: { type: string }
 *         description: Comma-separated cuisine types (e.g. Italian,French)
 *       - in: query
 *         name: priceRange
 *         schema: { type: string }
 *         description: Comma-separated price ranges (e.g. $$$,$$$$)
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: City filter (partial match)
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [rating, reviewCount, price_low, price_high, newest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of restaurants with pagination metadata
 */
router.get("/", getRestaurants);

/**
 * @swagger
 * /restaurants/mine:
 *   get:
 *     summary: Get the logged-in owner's restaurant
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Owner's restaurant (or null if not yet registered)
 *       403:
 *         description: Not an owner
 */
// NOTE: /mine must be defined BEFORE /:slug to prevent "mine" being treated as a slug
router.get("/mine", protect, authorize("owner", "admin"), getMyRestaurant);

/**
 * @swagger
 * /restaurants/{slug}:
 *   get:
 *     summary: Get a single restaurant by URL slug
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found
 */
router.get("/:slug", getRestaurantBySlug);

/**
 * @swagger
 * /restaurants/{id}/availability:
 *   get:
 *     summary: Get real-time slot availability for a restaurant on a specific date
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Array of slot objects with isAvailable and availableSeats
 *       400:
 *         description: Missing date parameter
 *       404:
 *         description: Restaurant not found
 */
router.get("/:id/availability", getAvailability);

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Submit a new restaurant for admin approval
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, cuisine, address, totalSeats]
 *             properties:
 *               name:           { type: string }
 *               description:    { type: string }
 *               cuisine:        { type: string }
 *               priceRange:     { type: string, enum: [$, $$, $$$, $$$$] }
 *               address:        { type: string }
 *               location:       { type: string }
 *               chef:           { type: string }
 *               tags:           { type: string, description: "JSON array or comma-separated" }
 *               availableSlots: { type: string, description: "JSON array e.g. [\"18:00\",\"19:00\"]" }
 *               totalSeats:     { type: integer }
 *               image:          { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Restaurant submitted (pending approval)
 *       409:
 *         description: Owner already has a restaurant
 */
router.post(
  "/",
  protect,
  authorize("owner"),
  uploadRestaurantImage,
  createRestaurantValidators,
  validate,
  createRestaurant
);

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant (owner of restaurant or admin)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restaurant updated
 *       403:
 *         description: Not authorized to update this restaurant
 *       404:
 *         description: Restaurant not found
 */
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  uploadRestaurantImage,
  updateRestaurantValidators,
  validate,
  updateRestaurant
);

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant (owner or admin)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restaurant deleted
 *       403:
 *         description: Not authorized
 */
router.delete("/:id", protect, authorize("owner", "admin"), deleteRestaurant);

module.exports = router;
