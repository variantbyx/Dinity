const Review      = require("../models/Review.model");
const Restaurant  = require("../models/Restaurant.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all reviews for a restaurant
// @route   GET /api/v1/restaurants/:id/reviews
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(50, parseInt(limit, 10));

    const [reviews, total] = await Promise.all([
      Review.find({ restaurant: req.params.id })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Review.countDocuments({ restaurant: req.params.id }),
    ]);

    return ApiResponse.success(
      res, 200, "Reviews retrieved successfully.", reviews,
      { page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a review for a restaurant
// @route   POST /api/v1/restaurants/:id/reviews
// @access  Private (user)
// ─────────────────────────────────────────────────────────────────────────────
const createReview = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || restaurant.status !== "approved") {
      return next(new ApiError(404, "Restaurant not found."));
    }

    // Owners cannot review their own restaurant
    if (String(restaurant.owner) === String(req.user._id)) {
      return next(new ApiError(403, "Restaurant owners cannot review their own establishment."));
    }

    const { rating, comment, visitedDate } = req.body;

    if (!rating || !comment) {
      return next(new ApiError(422, "Rating and comment are required."));
    }

    if (rating < 1 || rating > 5) {
      return next(new ApiError(422, "Rating must be between 1 and 5."));
    }

    // Create review (compound unique index prevents duplicate — throws 11000 if duplicate)
    const review = await Review.create({
      restaurant: req.params.id,
      user:       req.user._id,
      rating:     parseInt(rating, 10),
      comment,
      visitedDate: visitedDate ? new Date(visitedDate) : undefined,
    });

    await review.populate("user", "name avatar");

    // Note: restaurant.rating recalculation is handled by the Review post-save hook

    return ApiResponse.success(res, 201, "Review submitted successfully.", review);
  } catch (error) {
    // Mongoose duplicate key — user already reviewed this restaurant
    if (error.code === 11000) {
      return next(new ApiError(409, "You have already reviewed this restaurant."));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a review (user deletes own, admin can delete any)
// @route   DELETE /api/v1/reviews/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError(404, "Review not found."));
    }

    if (req.user.role !== "admin" && String(review.user) !== String(req.user._id)) {
      return next(new ApiError(403, "You are not authorized to delete this review."));
    }

    // Use findOneAndDelete so the post hook fires and recalculates rating
    await Review.findOneAndDelete({ _id: req.params.id });

    return ApiResponse.success(res, 200, "Review deleted successfully.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, deleteReview };
