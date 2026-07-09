const express = require("express");
const { getReviews, createReview, deleteReview } = require("../controllers/review.controller");
const { protect }   = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

/**
 * Reviews are mounted at /api/v1/reviews for delete operations,
 * and also under restaurant routes for get/create via app.js mergeParams.
 */

/** DELETE /api/v1/reviews/:id */
router.delete("/:id", protect, deleteReview);

module.exports = router;

/**
 * Nested router for restaurant reviews (used in restaurant.routes.js).
 * Mount with: router.use("/:id/reviews", reviewNestedRouter)
 */
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.get("/",  getReviews);
nestedRouter.post("/", protect, authorize("user"), createReview);

module.exports.reviewNestedRouter = nestedRouter;
