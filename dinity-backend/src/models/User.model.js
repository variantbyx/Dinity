const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

/**
 * User Model
 *
 * Supports three roles:
 *  - user  : Regular diner — can search, book, review
 *  - owner : Restaurant owner — can create/manage their restaurant
 *  - admin : Platform admin — can approve/reject restaurants, manage users
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minLength: [2,  "Name must be at least 2 characters"],
      maxLength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email address is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      select:    false, // Never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ["user", "owner", "admin"],
      default: "user",
    },

    phone: {
      type:  String,
      trim:  true,
      match: [/^\+?[\d\s\-().]{7,20}$/, "Please provide a valid phone number"],
    },

    avatar: {
      type: String, // Cloudinary URL or empty
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-Save Hook: Hash Password ──────────────────────────────────────────────
// Only re-hashes if the password field was modified (prevents double-hashing on profile updates)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance Method: Compare Password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Generate JWT ─────────────────────────────────────────────
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
