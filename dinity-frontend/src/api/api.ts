import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Extract error messages
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Handle token expiry
        }
        return Promise.reject(error);
    }
);

// ── Auth APIs ──────────────────────────────────────────────────────────────────
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    },
    register: async (data: { name: string; email: string; password: string; phone?: string; role?: string }) => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },
    updateProfile: async (data: { name?: string; phone?: string }) => {
        const response = await api.put("/auth/profile", data);
        return response.data;
    },
};

// ── Restaurant APIs ────────────────────────────────────────────────────────────
export const restaurantAPI = {
    getRestaurants: async (params?: {
        search?: string;
        cuisine?: string;
        priceRange?: string;
        city?: string;
        sort?: string;
        page?: number;
        limit?: number;
        featured?: boolean;
    }) => {
        const response = await api.get("/restaurants", { params });
        return response.data;
    },
    getRestaurantBySlug: async (slug: string) => {
        const response = await api.get(`/restaurants/${slug}`);
        return response.data;
    },
    getAvailability: async (restaurantId: string, date: string) => {
        const response = await api.get(`/restaurants/${restaurantId}/availability`, {
            params: { date },
        });
        return response.data;
    },
    getMyRestaurant: async () => {
        const response = await api.get("/restaurants/mine");
        return response.data;
    },
    createRestaurant: async (formData: FormData) => {
        const response = await api.post("/restaurants", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    updateRestaurant: async (id: string, formData: FormData) => {
        const response = await api.put(`/restaurants/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    deleteRestaurant: async (id: string) => {
        const response = await api.delete(`/restaurants/${id}`);
        return response.data;
    },
};

// ── Booking APIs ───────────────────────────────────────────────────────────────
export const bookingAPI = {
    createBooking: async (data: {
        restaurantId: string;
        date: string;
        time: string;
        guests: number;
        occasion?: string;
        specialRequests?: string;
    }) => {
        const response = await api.post("/bookings", data);
        return response.data;
    },
    getMyBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get("/bookings/my", { params });
        return response.data;
    },
    cancelBooking: async (bookingId: string) => {
        const response = await api.patch(`/bookings/${bookingId}/cancel`);
        return response.data;
    },
    getRestaurantBookings: async (params?: { status?: string; date?: string; page?: number; limit?: number }) => {
        const response = await api.get("/bookings/restaurant", { params });
        return response.data;
    },
};

// ── Review APIs ────────────────────────────────────────────────────────────────
export const reviewAPI = {
    getRestaurantReviews: async (restaurantId: string, params?: { page?: number; limit?: number }) => {
        const response = await api.get(`/restaurants/${restaurantId}/reviews`, { params });
        return response.data;
    },
    createReview: async (restaurantId: string, data: { rating: number; comment: string }) => {
        const response = await api.post(`/restaurants/${restaurantId}/reviews`, data);
        return response.data;
    },
};

// ── Admin APIs ─────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: async () => {
        const response = await api.get("/admin/stats");
        return response.data;
    },
    getPendingRestaurants: async () => {
        const response = await api.get("/admin/pending");
        return response.data;
    },
    getAllRestaurants: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get("/admin/restaurants", { params });
        return response.data;
    },
    updateRestaurantStatus: async (restaurantId: string, status: "approved" | "rejected") => {
        const response = await api.patch(`/admin/restaurants/${restaurantId}/status`, { status });
        return response.data;
    },
};

export default api;
