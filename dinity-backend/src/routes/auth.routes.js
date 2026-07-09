const express = require("express");

const { register, login, getMe, updateProfile } = require("../controllers/auth.controller");
const { protect }                                = require("../middleware/auth.middleware");
const { uploadRestaurantImage }                  = require("../middleware/upload.middleware");
const { validate }                               = require("../middleware/validate.middleware");
const {
  registerValidators,
  loginValidators,
  updateProfileValidators,
} = require("../validators/auth.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user or restaurant owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: "Alex Mercer" }
 *               email:    { type: string, example: "alex@example.com" }
 *               password: { type: string, example: "securePass123" }
 *               role:     { type: string, enum: [user, owner], example: "owner" }
 *               phone:    { type: string, example: "+1234567890" }
 *     responses:
 *       201:
 *         description: Account created — returns user object with JWT token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */
router.post("/register", registerValidators, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "alex@example.com" }
 *               password: { type: string, example: "securePass123" }
 *     responses:
 *       200:
 *         description: Login successful — returns user object with JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidators, validate, login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update current user's name, phone, or avatar
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string }
 *               phone: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Not authenticated
 */
router.put(
  "/profile",
  protect,
  uploadRestaurantImage, // Reuse same multer instance for avatar upload
  updateProfileValidators,
  validate,
  updateProfile
);

module.exports = router;
