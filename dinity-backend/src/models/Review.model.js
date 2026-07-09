const mongoose = require("mongoose");

/**
 * Review Model
 *
 * One user can review one restaurant only once (enforced by compound unique index).
 * After every review save/delete, the parent restaurant's rating and reviewCount
 * are recalculated via a static method called from post-save/post-remove hooks.
 */
const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Restaurant",
      required: [true, "Review must belong to a restaurant"],
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Review must belong to a user"],
    },

    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating cannot exceed 5"],
    },

    comment: {
      type:      String,
      required:  [true, "Review comment is required"],
      trim:      true,
      minLength: [10,   "Comment must be at least 10 characters"],
      maxLength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Optional: date the user actually visited (can differ from review date)
    visitedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Prevent duplicate reviews ─────────────────────────────────────────────────
// A user can only leave one review per restaurant
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

// ── Static Method: Recalculate Restaurant Rating ──────────────────────────────
reviewSchema.statics.recalculateRating = async function (restaurantId) {
  const stats = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id:         "$restaurant",
        avgRating:   { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const Restaurant = require("./Restaurant.model");

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating:      Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      reviewCount: stats[0].reviewCount,
    });
  } else {
    // No reviews left — reset to zero
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: 0, reviewCount: 0 });
  }
};

// ── Hooks: Trigger rating recalculation ──────────────────────────────────────
reviewSchema.post("save", function () {
  this.constructor.recalculateRating(this.restaurant);
});

// Use post findOneAndDelete hook for deletion
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.recalculateRating(doc.restaurant);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
