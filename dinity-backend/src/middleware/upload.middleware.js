const multer       = require("multer");
const streamifier  = require("streamifier");
const { cloudinary } = require("../config/cloudinary");
const ApiError     = require("../utils/ApiError");

// ── File Filter ───────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, and WebP image formats are supported."), false);
  }
};

// ── Multer: Memory Storage ────────────────────────────────────────────────────
// We buffer the file in memory and manually upload to Cloudinary.
// This avoids the multer-storage-cloudinary v1/v2 peer dependency conflict.
const upload = multer({
  storage:    multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 *
 * @param {Buffer} buffer   - File buffer from multer memory storage
 * @param {string} folder   - Cloudinary folder path
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadToCloudinary = (buffer, folder = "dinity/restaurants") => {
  return new Promise((resolve, reject) => {
    const isConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY    &&
      process.env.CLOUDINARY_API_SECRET;

    if (!isConfigured) {
      // Cloudinary not configured — return a placeholder
      return resolve("");
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 800, crop: "fill", quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(new ApiError(500, `Image upload failed: ${error.message}`));
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Middleware for uploading a single restaurant cover image.
 * Field name must be "image" in the multipart form.
 */
const uploadRestaurantImage = upload.single("image");

module.exports = { uploadRestaurantImage, uploadToCloudinary };
