const ApiError = require("../utils/ApiError");

/**
 * Role-based Authorization Middleware Factory.
 *
 * Returns a middleware that allows access only to users with the specified roles.
 * Must be used AFTER the `protect` middleware (which populates req.user).
 *
 * Usage:
 *   router.post("/restaurants", protect, authorize("owner", "admin"), createRestaurant)
 *   router.get("/admin/stats",  protect, authorize("admin"),          getStats)
 *
 * @param {...string} roles - Allowed roles: "user" | "owner" | "admin"
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. This action requires one of the following roles: [${roles.join(", ")}]. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
