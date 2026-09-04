/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/api";
import toast from "react-hot-toast";

export interface UserType {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "owner";
    avatar?: string;
}

interface AppContextType {
    user: UserType | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserType | null>(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
        return null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

    const refreshUser = async () => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await authAPI.getMe();
            if (res.success && res.data) {
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            }
        } catch {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await authAPI.login(email, password);
            if (res.success && res.data) {
                const { token: userToken, ...userData } = res.data;
                setToken(userToken);
                setUser(userData);
                localStorage.setItem("token", userToken);
                localStorage.setItem("user", JSON.stringify(userData));
                toast.success(`Welcome back, ${userData.name}!`);
                setAuthModalOpen(false);
                return true;
            }
            return false;
        } catch (error: any) {
            const validationError = error.response?.data?.data?.errors?.[0]?.message;
            const msg = validationError || error.response?.data?.message || "Login failed. Please check your credentials.";
            toast.error(msg);
            return false;
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        phone?: string,
        role?: string
    ): Promise<boolean> => {
        try {
            const res = await authAPI.register({
                name,
                email,
                password,
                phone: phone && phone.trim() !== "" ? phone.trim() : undefined,
                role
            });
            if (res.success && res.data) {
                const { token: userToken, ...userData } = res.data;
                setToken(userToken);
                setUser(userData);
                localStorage.setItem("token", userToken);
                localStorage.setItem("user", JSON.stringify(userData));
                toast.success("Account created successfully!");
                setAuthModalOpen(false);
                return true;
            }
            return false;
        } catch (error: any) {
            const validationError = error.response?.data?.data?.errors?.[0]?.message;
            const msg = validationError || error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(msg);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        toast.success("Signed out successfully.");
        window.location.href = "/";
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const value: AppContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }
    return context;
};
