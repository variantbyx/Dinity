import React, { useState } from "react";
import { useAppContext } from "../context/AppContext.tsx";
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, login, register } = useAppContext();
    const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [formLoading, setFormLoading] = useState(false);

    if (!isAuthModalOpen) return null;

    const resetForm = () => {
        setName(""); setEmail(""); setPassword(""); setPhone(""); setIsOwner(false);
    };

    const handleClose = () => { resetForm(); setAuthModalOpen(false); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        let success: boolean;
        if (isLoginTab) {
            success = await login(email, password);
        } else {
            success = await register(name, email, password, phone, isOwner ? "owner" : "user");
        }
        setFormLoading(false);
        if (success) handleClose();
    };

    const inputClass = "w-full bg-transparent border-b border-white/15 focus:border-[#A3704C] text-white text-sm py-2 pt-4 outline-none transition-fast placeholder:text-white/25";
    const labelClass = "block text-[9px] font-medium text-[#A3704C] tracking-[0.2em] uppercase mb-1";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md glass-modal border border-white/8 rounded-2xl overflow-hidden z-10 shadow-gourmet-lg">
                {/* Close */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-fast cursor-pointer z-10"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="px-10 pt-10 pb-6">
                    <div className="divider-gold mb-6" />
                    <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase block mb-2">
                        {isLoginTab ? "Member Access" : "Join Dinity"}
                    </span>
                    <h2 className="font-display text-2xl font-medium text-white mb-1">
                        {isLoginTab ? "Welcome Back" : "Create Your Account"}
                    </h2>
                    <p className="text-xs text-white/35 leading-relaxed">
                        {isLoginTab
                            ? "Sign in to access your reservations and curated dining profile."
                            : "Join the inner circle for exclusive access and priority bookings."}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/8 px-10">
                    {["Sign In", "Sign Up"].map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setIsLoginTab(i === 0)}
                            className={`pb-3 mr-6 text-xs tracking-wider uppercase transition-fast cursor-pointer border-b-2 ${
                                (i === 0) === isLoginTab
                                    ? "text-[#A3704C] border-[#A3704C]"
                                    : "text-white/30 border-transparent hover:text-white/50"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">
                    {!isLoginTab && (
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <div className="relative">
                                <User size={14} className="absolute left-0 top-4 text-white/25" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${inputClass} pl-6`}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Email Address</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-0 top-4 text-white/25" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputClass} pl-6`}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Password</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-0 top-4 text-white/25" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pl-6 pr-8`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-4 text-white/25 hover:text-white/50 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {!isLoginTab && (
                        <>
                            <div>
                                <label className={labelClass}>Phone (Optional)</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-0 top-4 text-white/25" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={`${inputClass} pl-6`}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    onClick={() => setIsOwner(!isOwner)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-fast ${
                                        isOwner ? "bg-[#A3704C] border-[#A3704C]" : "border-white/20 group-hover:border-[#A3704C]/50"
                                    }`}
                                >
                                    {isOwner && <span className="text-white text-xs">✓</span>}
                                </div>
                                <span className="text-xs text-white/40 leading-relaxed">I am a restaurant owner</span>
                            </label>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={formLoading}
                        className="btn-press w-full bg-[#A3704C] hover:bg-[#8a5c3a] disabled:opacity-60 text-white py-3.5 text-xs font-semibold tracking-widest uppercase rounded-xl transition-fast cursor-pointer shadow-gold mt-2"
                    >
                        {formLoading ? "Please wait..." : isLoginTab ? "Sign In" : "Create Account"}
                    </button>

                    <p className="text-center text-xs text-white/25 pt-2">
                        By continuing, you agree to our{" "}
                        <span className="text-[#A3704C] cursor-pointer hover:underline">Terms of Service</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
