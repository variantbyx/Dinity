const mongoose = require("mongoose");

/**
 * Connects to MongoDB Atlas with retry logic.
 * Logs connection status to stdout for Render/production visibility.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[DB] MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // These are the recommended settings for Mongoose 8+
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection Error: ${error.message}`);
    // Exit process — Render/PM2 will restart the container automatically
    process.exit(1);
  }
};

// Log disconnections so we notice transient Atlas issues in production logs
mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("[DB] MongoDB reconnected.");
});

module.exports = connectDB;
