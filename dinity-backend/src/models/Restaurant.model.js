const mongoose = require("mongoose");
const slugify  = require("slugify");

/**
 * Restaurant Model
 *
 * Field design mirrors the frontend's dummyRestaurant data contract exactly.
 * All fields the UI reads are present and typed correctly.
 */
const restaurantSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────────────────────────────────────
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Restaurant must have an owner"],
    },

    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type:      String,
      required:  [true, "Restaurant name is required"],
      trim:      true,
      maxLength: [100, "Restaurant name cannot exceed 100 characters"],
    },

    slug: {
      type:   String,
      unique: true,
      index:  true, // Fast lookups by slug (used in frontend URLs)
    },

    description: {
      type:      String,
      required:  [true, "Description is required"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },

    cuisine: {
      type:     String,
      required: [true, "Cuisine type is required"],
      trim:     true,
    },

    priceRange: {
      type:    String,
      enum:    ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },

    chef: {
      type:  String,
      trim:  true,
    },

    tags: {
      type:    [String],
      default: [],
    },

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      type:  String, // City display string e.g. "Manhattan, NY"
      trim:  true,
    },

    address: {
      type:     String,
      required: [true, "Address is required"],
      trim:     true,
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    image: {
      type:    String, // Cloudinary URL
      default: "",
    },

    // ── Operations ────────────────────────────────────────────────────────────
    availableSlots: {
      type:    [String], // e.g. ["18:00", "19:00", "20:00"]
      default: [],
    },

    totalSeats: {
      type:    Number,
      default: 20,
      min:     [1, "Total seats must be at least 1"],
    },

    // ── Ratings (maintained by post-save hooks on Review model) ───────────────
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },

    reviewCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // ── Status & Flags ────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },

    featured: {
      type:    Boolean,
      default: false,
    },

    exclusive: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Include virtuals when converting to JSON/Object (for populate etc.)
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes for common query patterns ────────────────────────────────────────
restaurantSchema.index({ status: 1, cuisine: 1 });
restaurantSchema.index({ status: 1, rating: -1 });
restaurantSchema.index({ name: "text", description: "text", cuisine: "text", tags: "text" });

// ── Pre-Save Hook: Generate unique slug ──────────────────────────────────────
restaurantSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  let baseSlug = slugify(this.name, { lower: true, strict: true, trim: true });
  let slug     = baseSlug;
  let counter  = 1;

  // Ensure slug uniqueness by appending a counter if needed
  while (await mongoose.model("Restaurant").findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
