const User        = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");

/**
 * Builds the user payload returned on login/register.
 * The token field name matches what the existing frontend AppContext expects:
 *   localStorage.setItem("token", user.token)
 *
 * @param {import('../models/User.model')} user - Mongoose User document
 * @returns {object} Serialized user + token
 */
const buildAuthPayload = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  phone:     user.phone  || null,
  avatar:    user.avatar || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  token:     user.generateAuthToken(),
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user or restaurant owner
// @route   POST /api/v1/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check for existing account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, "An account with this email already exists."));
    }

    // Prevent self-registration as admin
    const safeRole = role === "admin" ? "user" : (role || "user");

    const user = await User.create({ name, email, password, role: safeRole, phone });

    return ApiResponse.success(res, 201, "Account created successfully.", buildAuthPayload(user));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Log in with email and password
// @route   POST /api/v1/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password because the model uses select: false
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Generic message to prevent email enumeration attacks
      return next(new ApiError(401, "Invalid email or password."));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new ApiError(401, "Invalid email or password."));
    }

    return ApiResponse.success(res, 200, "Login successful.", buildAuthPayload(user));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the currently authenticated user's profile
// @route   GET /api/v1/auth/me
// @access  Private (any authenticated role)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by protect middleware (no password)
    return ApiResponse.success(res, 200, "Profile retrieved successfully.", req.user);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update the current user's name, phone, or avatar
// @route   PUT /api/v1/auth/profile
// @access  Private (any authenticated role)
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    // Build update object — only update fields that were sent
    const updateData = {};
    if (name)  updateData.name  = name;
    if (phone) updateData.phone = phone;

    // Handle avatar upload if a file was sent
    if (req.file) {
      const { uploadToCloudinary } = require("../middleware/upload.middleware");
      const imageUrl = await uploadToCloudinary(req.file.buffer, "dinity/avatars");
      if (imageUrl) updateData.avatar = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, 200, "Profile updated successfully.", updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
