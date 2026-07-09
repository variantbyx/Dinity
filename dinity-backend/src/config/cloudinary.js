const cloudinary = require("cloudinary").v2;

/**
 * Configures the Cloudinary SDK using environment variables.
 * Called once at application startup in app.js.
 */
const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      "[Cloudinary] Credentials not fully configured. Image uploads will be disabled.\n" +
      "             Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
    );
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure:     true, // Always use HTTPS URLs
  });

  console.log(`[Cloudinary] Configured for cloud: ${CLOUDINARY_CLOUD_NAME}`);
};

module.exports = { cloudinary, configureCloudinary };
