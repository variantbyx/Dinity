/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { dummyUser } from "../assets/assets.js";

interface UserType {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "owner";
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
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        console.log(email, password);
        let loggedInUser = { ...dummyUser };
        if (email === "admin@example.com") {
            loggedInUser.role = "admin";
            loggedInUser.name = "Admin User";
            loggedInUser.email = "admin@example.com";
            loggedInUser._id = "admin-id-123";
        } else if (email === "diner@example.com" || email === "user@example.com") {
            loggedInUser.role = "user";
            loggedInUser.name = "Diner User";
            loggedInUser.email = email;
            loggedInUser._id = "diner-id-123";
        } else {
            loggedInUser.role = "owner";
            loggedInUser.name = "Alex Mercer";
            loggedInUser.email = email;
            loggedInUser._id = "6a32a3c50e88c825d8873f75";
        }
        setToken(loggedInUser.token);
        setUser(loggedInUser as any);
        localStorage.setItem("token", loggedInUser.token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        return true;
    };

    const register = async (name: string, email: string, password: string, phone?: string, role?: string): Promise<boolean> => {
        console.log(name, email, password, phone, role);
        const registeredUser = {
            _id: "user_" + Date.now(),
            name,
            email,
            phone,
            role: (role as any) || "user",
            token: "xyz"
        };
        setToken(registeredUser.token);
        setUser(registeredUser as any);
        localStorage.setItem("token", registeredUser.token);
        localStorage.setItem("user", JSON.stringify(registeredUser));
        return true;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(dummyUser as any);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

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
