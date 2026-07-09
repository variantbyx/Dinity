require("dotenv").config();

const app       = require("./app");
const connectDB = require("./config/db");

const PORT = parseInt(process.env.PORT || "5000", 10);

/**
 * Application entry point.
 *
 * Starts the HTTP server only AFTER successfully connecting to MongoDB.
 * This prevents the app from accepting traffic when the database is unavailable.
 */
const startServer = async () => {
  // Connect to MongoDB first — exits process if connection fails
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║              DINITY BACKEND — RUNNING                ║
╠══════════════════════════════════════════════════════╣
║  Environment : ${(process.env.NODE_ENV || "development").padEnd(36)}║
║  Port        : ${String(PORT).padEnd(36)}║
║  API Base    : http://localhost:${PORT}/api/v1${" ".repeat(18 - String(PORT).length)}║
║  API Docs    : http://localhost:${PORT}/api-docs${" ".repeat(16 - String(PORT).length)}║
╚══════════════════════════════════════════════════════╝
    `);
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  // Handle SIGTERM (Render, Docker) and SIGINT (Ctrl+C in dev)
  const gracefulShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log("[Server] HTTP server closed. Exiting process.");
      process.exit(0);
    });

    // Force exit if graceful shutdown takes more than 10 seconds
    setTimeout(() => {
      console.error("[Server] Graceful shutdown timed out. Forcing exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

  // ── Unhandled Rejections (e.g. DB errors mid-runtime) ────────────────────
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Server] Unhandled Promise Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
};

startServer();
