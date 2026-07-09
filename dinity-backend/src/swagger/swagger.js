const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title:       "Dinity API",
      version:     "1.0.0",
      description: "REST API for Dinity — Restaurant Discovery & Table Reservation Platform",
      contact: {
        name: "Dinity Team",
      },
    },
    servers: [
      {
        url:         `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: "Local development server",
      },
      {
        url:         "https://dinity-backend.onrender.com/api/v1",
        description: "Production server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type:         "http",
          scheme:       "bearer",
          bearerFormat: "JWT",
          description:  "Enter your JWT token from the login response",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id:       { type: "string" },
            name:      { type: "string" },
            email:     { type: "string" },
            role:      { type: "string", enum: ["user", "owner", "admin"] },
            phone:     { type: "string" },
            avatar:    { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            _id:            { type: "string" },
            name:           { type: "string" },
            slug:           { type: "string" },
            description:    { type: "string" },
            cuisine:        { type: "string" },
            priceRange:     { type: "string", enum: ["$", "$$", "$$$", "$$$$"] },
            rating:         { type: "number" },
            reviewCount:    { type: "integer" },
            location:       { type: "string" },
            address:        { type: "string" },
            image:          { type: "string" },
            chef:           { type: "string" },
            tags:           { type: "array", items: { type: "string" } },
            availableSlots: { type: "array", items: { type: "string" } },
            totalSeats:     { type: "integer" },
            status:         { type: "string", enum: ["pending", "approved", "rejected"] },
            featured:       { type: "boolean" },
            exclusive:      { type: "boolean" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id:             { type: "string" },
            bookingId:       { type: "string" },
            user:            { $ref: "#/components/schemas/User" },
            restaurant:      { $ref: "#/components/schemas/Restaurant" },
            date:            { type: "string", format: "date-time" },
            time:            { type: "string" },
            guests:          { type: "integer" },
            occasion:        { type: "string" },
            specialRequests: { type: "string" },
            status:          { type: "string", enum: ["pending", "confirmed", "cancelled", "completed"] },
            createdAt:       { type: "string", format: "date-time" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            data:    { type: "object", nullable: true, example: null },
          },
        },
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data:    { type: "object" },
          },
        },
      },
    },
  },
  // Scan route files for JSDoc @swagger annotations
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
