require("dotenv").config();

const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const morgan       = require("morgan");
const rateLimit    = require("express-rate-limit");
const swaggerUi    = require("swagger-ui-express");

const { configureCloudinary } = require("./config/cloudinary");
const swaggerSpec              = require("./swagger/swagger");
const errorMiddleware          = require("./middleware/error.middleware");
const ApiResponse              = require("./utils/ApiResponse");

// ── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes                              = require("./routes/auth.routes");
const restaurantRoutes                        = require("./routes/restaurant.routes");
const bookingRoutes                           = require("./routes/booking.routes");
const reviewRoutes                            = require("./routes/review.routes");
const { reviewNestedRouter }                  = require("./routes/review.routes");
const adminRoutes                             = require("./routes/admin.routes");

// ── Initialize External Services ──────────────────────────────────────────────
configureCloudinary();

// ── Create Express Application ────────────────────────────────────────────────
const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow Cloudinary image loads
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://dinity.vercel.app", // Add your actual Vercel URL here after deployment
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.some((allowed) => origin === allowed || origin.endsWith(".vercel.app"))) {
        return callback(null, true);
      }

      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    },
    credentials:     true,
    allowedHeaders:  ["Content-Type", "Authorization"],
    methods:         ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  // In production, log only errors (combined format with response time)
  app.use(morgan("combined", {
    skip: (req, res) => res.statusCode < 400,
  }));
}

// ── Global Rate Limiting ──────────────────────────────────────────────────────
// Prevents brute-force attacks across the entire API
const globalLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 minutes
  max:               200,            // 200 requests per 15 min per IP
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
    data:    null,
  },
});

// Stricter limiter for auth endpoints to prevent credential stuffing
const authLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 minutes
  max:               20,             // 20 login attempts per 15 min per IP
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
    data:    null,
  },
});

app.use("/api", globalLimiter);
app.use("/api/v1/auth", authLimiter);

// ── API Documentation ─────────────────────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Dinity API Docs",
    customCss:       ".swagger-ui .topbar { display: none }",
  })
);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  ApiResponse.success(res, 200, "Dinity API is running", {
    environment: process.env.NODE_ENV || "development",
    timestamp:   new Date().toISOString(),
    version:     "1.0.0",
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",                    authRoutes);
app.use("/api/v1/restaurants",             restaurantRoutes);
app.use("/api/v1/restaurants",             reviewNestedRouter); // nested: /restaurants/:id/reviews
app.use("/api/v1/bookings",                bookingRoutes);
app.use("/api/v1/reviews",                 reviewRoutes);
app.use("/api/v1/admin",                   adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data:    null,
  });
});

// ── Centralized Error Middleware ──────────────────────────────────────────────
// MUST be registered last, after all routes
app.use(errorMiddleware);

module.exports = app;
