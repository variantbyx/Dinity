const express = require("express");

const {
  getStats,
  getPendingRestaurants,
  getAllRestaurants,
  updateRestaurantStatus,
  getAllUsers,
  deleteUser,
} = require("../controllers/admin.controller");

const { protect }   = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Platform administration — admin role required
 */

/** @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stats object with users, restaurants, bookings, latestBookings
 */
router.get("/stats", getStats);

/** @swagger
 * /admin/pending:
 *   get:
 *     summary: Get all restaurants pending approval (FIFO queue)
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of pending restaurant objects with populated owner
 */
router.get("/pending", getPendingRestaurants);

/** @swagger
 * /admin/restaurants:
 *   get:
 *     summary: Get all restaurants (any status)
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *     responses:
 *       200:
 *         description: Paginated list of all restaurants
 */
router.get("/restaurants", getAllRestaurants);

/** @swagger
 * /admin/restaurants/{id}/status:
 *   patch:
 *     summary: Approve or reject a restaurant registration
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [approved, rejected] }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 */
router.patch("/restaurants/:id/status", updateRestaurantStatus);

/** @swagger
 * /admin/users:
 *   get:
 *     summary: Get all user accounts
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, owner, admin] }
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get("/users", getAllUsers);

/** @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted and active bookings cancelled
 *       400:
 *         description: Cannot delete own account
 */
router.delete("/users/:id", deleteUser);

module.exports = router;
