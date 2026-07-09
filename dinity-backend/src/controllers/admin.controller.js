const Restaurant  = require("../models/Restaurant.model");
const Booking     = require("../models/Booking.model");
const User        = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get platform-wide stats (matches dummyAdminStats shape exactly)
// @route   GET /api/v1/admin/stats
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    // Run all aggregations in parallel for performance
    const [userStats, restaurantCount, bookingCount, latestBookings] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id:  "$role",
            count: { $sum: 1 },
          },
        },
      ]),
      Restaurant.countDocuments(),
      Booking.countDocuments(),
      Booking.find()
        .populate("user",       "name email")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Reshape user aggregation into the exact shape the frontend expects:
    // { totalUsers: N, totalOwners: N, total: N }
    const totalUsers  = userStats.find((s) => s._id === "user"  )?.count || 0;
    const totalOwners = userStats.find((s) => s._id === "owner" )?.count || 0;
    const totalAdmins = userStats.find((s) => s._id === "admin" )?.count || 0;

    const stats = {
      users: {
        totalUsers,
        totalOwners,
        total: totalUsers + totalOwners + totalAdmins,
      },
      restaurants: {
        total:    restaurantCount,
        approved: await Restaurant.countDocuments({ status: "approved" }),
        pending:  await Restaurant.countDocuments({ status: "pending"  }),
        rejected: await Restaurant.countDocuments({ status: "rejected" }),
      },
      bookings: {
        total:     bookingCount,
        confirmed: await Booking.countDocuments({ status: "confirmed"  }),
        cancelled: await Booking.countDocuments({ status: "cancelled"  }),
      },
      latestBookings,
    };

    return ApiResponse.success(res, 200, "Admin stats retrieved successfully.", stats);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all pending restaurant registrations
// @route   GET /api/v1/admin/pending
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getPendingRestaurants = async (req, res, next) => {
  try {
    const pending = await Restaurant.find({ status: "pending" })
      .populate("owner", "name email phone createdAt")
      .sort({ createdAt: 1 }) // Oldest requests first — FIFO review queue
      .lean();

    return ApiResponse.success(res, 200, "Pending restaurants retrieved.", pending);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all restaurants (for admin view)
// @route   GET /api/v1/admin/restaurants
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllRestaurants = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(100, parseInt(limit, 10));

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Restaurant.countDocuments(filter),
    ]);

    return ApiResponse.success(
      res, 200, "All restaurants retrieved.", restaurants,
      { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve or reject a restaurant
// @route   PATCH /api/v1/admin/restaurants/:id/status
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return next(new ApiError(400, "Status must be 'approved' or 'rejected'."));
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("owner", "name email");

    if (!restaurant) {
      return next(new ApiError(404, "Restaurant not found."));
    }

    const message = status === "approved"
      ? `Restaurant "${restaurant.name}" approved successfully.`
      : `Restaurant "${restaurant.name}" rejected.`;

    return ApiResponse.success(res, 200, message, restaurant);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(100, parseInt(limit, 10));

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(), // password is already excluded via select: false
      User.countDocuments(filter),
    ]);

    return ApiResponse.success(
      res, 200, "Users retrieved successfully.", users,
      { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a user account
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting their own account via API
    if (String(req.params.id) === String(req.user._id)) {
      return next(new ApiError(400, "Administrators cannot delete their own account."));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ApiError(404, "User not found."));
    }

    // Clean up: cancel all active bookings for this user
    await Booking.updateMany(
      { user: req.params.id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" }
    );

    return ApiResponse.success(res, 200, `User "${user.name}" deleted successfully.`, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getPendingRestaurants,
  getAllRestaurants,
  updateRestaurantStatus,
  getAllUsers,
  deleteUser,
};
