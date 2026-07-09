# Dinity 🍽️ — Multi-Tenant Restaurant Discovery & Table Reservation Platform

Dinity is a production-ready, security-hardened full-stack reservation engine designed to support multiple restaurant tenants, complex customer workflows, and interactive administrative management dashboards.

## 🚀 Live Links & Documentation
* **GitHub Repository:** [https://github.com/variantbyx/dinity](https://github.com/variantbyx/dinity)
* **API Interactive Documentation:** Swagger UI is exposed at `http://localhost:5000/api-docs` (in development)

---

## 🏗️ System Architecture
Dinity uses a decoupled, modular client-server architecture:

```
                  ┌───────────────────────┐
                  │   React 19 Client     │ (TypeScript, Tailwind v4, React Router v7)
                  └───────────┬───────────┘
                              │
                    HTTPS REST requests / JSON
                              │
                              ▼
                  ┌───────────────────────┐
                  │    Express API Gateway│ (Security Headers, Rate Limiting)
                  └───────────┬───────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
  ┌──────────────────┐┌────────────────┐┌───────────────┐
  │ RBAC Middleware  ││Booking Engine  ││Cloud Assets   │
  │ (JWT, Bcrypt)    ││(Aggregation)   ││(Streamifier)  │
  └─────────┬────────┘└───────┬────────┘└───────┬───────┘
            │                 │                 │
            ▼                 ▼                 ▼
      ┌───────────┐     ┌───────────┐     ┌───────────┐
      │  MongoDB  │     │  MongoDB  │     │Cloudinary │ (Cloud Assets)
      │  (Users)  │     │ (Bookings)│     └───────────┘
      └───────────┘     └───────────┘
```

---

## 🛠️ Tech Stack

### Frontend (`dinity-frontend`)
* **Core:** React 19, TypeScript
* **Routing:** React Router v7 (nested client-side routes, role-based route protection)
* **Styling:** Tailwind CSS v4
* **State & Querying:** Context API, Axios

### Backend (`dinity-backend`)
* **Runtime:** Node.js, Express.js (REST API server)
* **Database:** MongoDB with Mongoose ODM (indexing, validation, schema definitions)
* **Security:** Helmet (HTTP security headers), Express-Rate-Limit (DDOS & brute-force protection), Express-Validator (input sanitation)
* **Authentication:** JWT (JSON Web Tokens), BcryptJS (salted hashing)
* **Media & Storage:** Multer, Cloudinary, Streamifier (non-blocking stream-based cloud asset pipeline)
* **Documentation:** Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)

---

## ⚡ Key Engineering Achievements & Features

### 1. Dynamic Table Booking Concurrency & Conflict Prevention
Instead of naive booking checks, the booking engine utilizes **MongoDB Aggregation Pipelines** to dynamically count active bookings for any specific date, restaurant, and time slot. Remaining seat capacity is computed in real-time on the server. Attempted reservations exceeding available seats or producing overlapping slot bookings are rejected at the database level, preventing double-bookings.

### 2. Multi-Tenant Role-Based Access Control (RBAC)
Features isolated custom route guards and middleware filtering requests into three roles:
* **Customers:** Discover restaurants, view live time slots, register bookings, and submit reviews.
* **Restaurant Owners:** Build a restaurant profile (menu, location, total seats, slot durations), accept/reject reservations, and monitor booking analytics.
* **Administrators:** Approve or reject new restaurant onboardings to enforce marketplace quality control.

### 3. Non-Blocking Cloud Asset Pipeline
To prevent memory leaks and local server disk-space exhaustion, the platform processes restaurant banner uploads using a stream-based design. High-resolution images uploaded via `Multer` are piped directly from incoming buffer streams into `Cloudinary` cloud storage using `streamifier`. This prevents writes to the API's local filesystem and minimizes the memory footprint under concurrent upload loads.

---

## 📂 Project Directory Structure

```
Dinity/
├── README.md                  # Root Project Documentation
├── dinity-backend/            # Express.js REST API
│   ├── src/
│   │   ├── config/            # Cloudinary & Db Connections
│   │   ├── controllers/       # Route Handler Functions
│   │   ├── middleware/        # JWT Auth, RBAC, Rate-Limiting, Error Handler
│   │   ├── models/            # Mongoose Schemas (User, Restaurant, Booking, Review)
│   │   ├── routes/            # REST Endpoints
│   │   ├── swagger/           # Swagger Specification
│   │   ├── utils/             # Helper utilities & API response models
│   │   └── server.js          # Server entry point
│   ├── package.json
│   └── render.yaml
└── dinity-frontend/           # React 19 Frontend
    ├── src/
    │   ├── components/        # Reusable UI Components
    │   ├── context/           # Global Auth and App State
    │   ├── pages/             # Pages (Home, Search, Dashboard, Booking Confirmation)
    │   └── main.tsx           # Client entry point
    ├── package.json
    └── vite.config.ts
```

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (version >= 18.0.0)
* [MongoDB Atlas](https://www.mongodb.com/) or local MongoDB server instance
* [Cloudinary Account](https://cloudinary.com/) (for restaurant image uploads)

### Step 1: Clone the Repository
```bash
git clone https://github.com/variantbyx/Dinity.git
cd Dinity
```

### Step 2: Configure Environment Variables

#### Backend (`dinity-backend/.env`)
Create a `.env` file in the `dinity-backend` folder using the provided `.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_signing_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

#### Frontend (`dinity-frontend/.env`)
Create a `.env` file in the `dinity-frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 3: Run the Application

#### Run Backend Server
```bash
cd dinity-backend
npm install
npm run dev # Starts on http://localhost:5000
```

#### Run Frontend Client
```bash
cd ../dinity-frontend
npm install
npm run dev # Starts on http://localhost:5173
```

---

## 🔒 Security Best Practices Implemented
* **Salting & Hashing:** All password hashes use `bcrypt` with a work factor of 10.
* **JWT Identity Token Verification:** User credentials are exchanged for secure JWTs, which are stored in the client application headers and parsed via auth middleware.
* **Global & Endpoint-Specific Rate Limiters:** Endpoint-level protection restricts critical operations (like authentication/booking attempts) to mitigate DDoS/brute-force attacks.
* **HTTP Header Security:** `Helmet` is configured to secure Express headers and prevent malicious scripts or unauthorized domain framing.
