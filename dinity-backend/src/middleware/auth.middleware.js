const jwt     = require("jsonwebtoken");
const User    = require("../models/User.model");
const ApiError = require("../utils/ApiError");

/**
 * JWT Authentication Middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it, fetches the user document from MongoDB,
 * and attaches it to req.user for downstream handlers.
 *
 * Usage: router.get("/protected", protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Authentication required. Please log in."));
    }

    const token = authHeader.split(" ")[1];

    // Throws JsonWebTokenError or TokenExpiredError — caught by error middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (catches deleted/suspended accounts mid-session)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "The user belonging to this token no longer exists."));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
