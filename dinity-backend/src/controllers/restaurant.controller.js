const Restaurant          = require("../models/Restaurant.model");
const Booking             = require("../models/Booking.model");
const ApiResponse         = require("../utils/ApiResponse");
const ApiError            = require("../utils/ApiError");
const { uploadToCloudinary } = require("../middleware/upload.middleware");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all approved restaurants (paginated, filtered, sorted)
// @route   GET /api/v1/restaurants
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      priceRange,
      city,
      sort      = "rating",
      page      = 1,
      limit     = 12,
      featured,
    } = req.query;

    // ── Build filter query ────────────────────────────────────────────────────
    const filter = { status: "approved" };

    // Full-text search across name, description, cuisine, and tags
    if (search) {
      filter.$text = { $search: search };
    }

    // Cuisine filter — supports comma-separated values: ?cuisine=Italian,French
    if (cuisine) {
      const cuisineList = cuisine.split(",").map((c) => c.trim());
      filter.cuisine = { $in: cuisineList.map((c) => new RegExp(`^${c}$`, "i")) };
    }

    // Price range filter — supports comma-separated: ?priceRange=$$$,$$$$
    if (priceRange) {
      filter.priceRange = { $in: priceRange.split(",").map((p) => p.trim()) };
    }

    // City/location filter
    if (city) {
      filter.location = { $regex: city, $options: "i" };
    }

    // Featured filter
    if (featured === "true") {
      filter.featured = true;
    }

    // ── Build sort options ────────────────────────────────────────────────────
    let sortOptions = {};
    switch (sort) {
      case "rating":
        sortOptions = { rating: -1 };
        break;
      case "reviewCount":
        sortOptions = { reviewCount: -1 };
        break;
      case "price_low":
        // Mongo can't sort on string length natively — use aggregate for this
        // For simplicity, we sort alphabetically on priceRange ($, $$, $$$, $$$$)
        sortOptions = { priceRange: 1 };
        break;
      case "price_high":
        sortOptions = { priceRange: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { rating: -1 };
    }

    // ── Pagination ────────────────────────────────────────────────────────────
    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize   = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip       = (pageNumber - 1) * pageSize;

    // ── Execute query + count in parallel ────────────────────────────────────
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate("owner", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .lean(), // lean() returns plain JS objects — faster for read-only
      Restaurant.countDocuments(filter),
    ]);

    const pagination = {
      page:       pageNumber,
      limit:      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext:    pageNumber < Math.ceil(total / pageSize),
      hasPrev:    pageNumber > 1,
    };

    return ApiResponse.success(
      res,
      200,
      "Restaurants retrieved successfully.",
      restaurants,
      pagination
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single restaurant by slug
// @route   GET /api/v1/restaurants/:slug
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getRestaurantBySlug = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug })
      .populate("owner", "name email");

    if (!restaurant) {
      return next(new ApiError(404, "Restaurant not found."));
    }

    // Allow owners and admins to see their own pending/rejected restaurants
    if (
      restaurant.status !== "approved" &&
      req.user?.role !== "admin" &&
      String(restaurant.owner._id) !== String(req.user?._id)
    ) {
      return next(new ApiError(404, "Restaurant not found."));
    }

    return ApiResponse.success(res, 200, "Restaurant retrieved successfully.", restaurant);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the logged-in owner's restaurant
// @route   GET /api/v1/restaurants/mine
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return ApiResponse.success(res, 200, "No restaurant registered yet.", null);
    }

    return ApiResponse.success(res, 200, "Restaurant retrieved successfully.", restaurant);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get available time slots for a restaurant on a specific date
// @route   GET /api/v1/restaurants/:id/availability?date=YYYY-MM-DD
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return next(new ApiError(400, "Query parameter 'date' is required (format: YYYY-MM-DD)."));
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || restaurant.status !== "approved") {
      return next(new ApiError(404, "Restaurant not found."));
    }

    const targetDate       = new Date(date);
    const nextDay          = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Count confirmed/pending bookings grouped by time slot for this date
    const bookedSlots = await Booking.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          date:       { $gte: targetDate, $lt: nextDay },
          status:     { $in: ["confirmed", "pending"] },
        },
      },
      {
        $group: {
          _id:          "$time",
          bookedGuests: { $sum: "$guests" },
        },
      },
    ]);

    // Map booked slots for O(1) lookup
    const bookedMap = {};
    bookedSlots.forEach((s) => {
      bookedMap[s._id] = s.bookedGuests;
    });

    // Build availability response for each slot
    const availability = restaurant.availableSlots.map((time) => {
      const booked         = bookedMap[time] || 0;
      const availableSeats = restaurant.totalSeats - booked;
      return {
        time,
        availableSeats: Math.max(0, availableSeats),
        isAvailable:    availableSeats > 0,
      };
    });

    return ApiResponse.success(res, 200, "Availability retrieved successfully.", {
      restaurant: { _id: restaurant._id, name: restaurant.name },
      date,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new restaurant (owner submits for admin approval)
// @route   POST /api/v1/restaurants
// @access  Private (owner only)
// ─────────────────────────────────────────────────────────────────────────────
const createRestaurant = async (req, res, next) => {
  try {
    // Each owner can only have one restaurant
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) {
      return next(
        new ApiError(409, "You already have a registered restaurant. Update it instead of creating a new one.")
      );
    }

    // Parse availableSlots from form (multipart sends arrays as JSON strings)
    let availableSlots = req.body.availableSlots;
    if (typeof availableSlots === "string") {
      try { availableSlots = JSON.parse(availableSlots); } catch { availableSlots = []; }
    }

    // Parse tags similarly
    let tags = req.body.tags;
    if (typeof tags === "string") {
      // Handle both JSON array and comma-separated string
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    // Upload image to Cloudinary if provided
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "dinity/restaurants");
    }

    const restaurant = await Restaurant.create({
      owner:          req.user._id,
      name:           req.body.name,
      description:    req.body.description,
      cuisine:        req.body.cuisine,
      priceRange:     req.body.priceRange     || "$$",
      chef:           req.body.chef           || "",
      tags:           tags                    || [],
      location:       req.body.location       || "",
      address:        req.body.address,
      image:          imageUrl,
      availableSlots: availableSlots          || [],
      totalSeats:     parseInt(req.body.totalSeats, 10) || 20,
      status:         "pending", // Always starts pending — admin must approve
    });

    // Populate owner details for the response
    await restaurant.populate("owner", "name email");

    return ApiResponse.success(
      res,
      201,
      "Restaurant submitted successfully. It is now pending admin approval.",
      restaurant
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update restaurant details
// @route   PUT /api/v1/restaurants/:id
// @access  Private (owner of this restaurant, or admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(new ApiError(404, "Restaurant not found."));
    }

    // Ownership check — admins can edit any restaurant
    if (
      req.user.role !== "admin" &&
      String(restaurant.owner) !== String(req.user._id)
    ) {
      return next(new ApiError(403, "You are not authorized to update this restaurant."));
    }

    // Handle image upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "dinity/restaurants");
      if (imageUrl) req.body.image = imageUrl;
    }

    // Parse availableSlots / tags if sent as string
    if (typeof req.body.availableSlots === "string") {
      try { req.body.availableSlots = JSON.parse(req.body.availableSlots); } catch { /* keep as-is */ }
    }
    if (typeof req.body.tags === "string") {
      try { req.body.tags = JSON.parse(req.body.tags); } catch {
        req.body.tags = req.body.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    // Owners cannot change their own approval status
    if (req.user.role !== "admin") {
      delete req.body.status;
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("owner", "name email");

    return ApiResponse.success(res, 200, "Restaurant updated successfully.", updated);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private (owner of this restaurant, or admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return next(new ApiError(404, "Restaurant not found."));
    }

    if (
      req.user.role !== "admin" &&
      String(restaurant.owner) !== String(req.user._id)
    ) {
      return next(new ApiError(403, "You are not authorized to delete this restaurant."));
    }

    // Also cancel all pending/confirmed bookings for this restaurant
    await Booking.updateMany(
      { restaurant: restaurant._id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" }
    );

    await restaurant.deleteOne();

    return ApiResponse.success(res, 200, "Restaurant deleted successfully.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantBySlug,
  getMyRestaurant,
  getAvailability,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
