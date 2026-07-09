import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import { Menu, X, LogOut, CalendarDays, ShieldCheck, ChevronDown } from "lucide-react";

export default function Navbar() {
    const { user, logout, setAuthModalOpen } = useAppContext();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return;
        const handler = () => setDropdownOpen(false);
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, [dropdownOpen]);

    const handleDashboardClick = () => {
        if (!user) {
            setAuthModalOpen(true);
        } else {
            navigate("/dashboard");
        }
    };

    const navLinkClass = (active: boolean) =>
        `text-sm transition-fast cursor-pointer border-b border-transparent pb-0.5 ${
            active
                ? "text-[#A3704C] border-[#A3704C]"
                : isHome && !scrolled
                  ? "text-white/80 hover:text-white hover:border-white/40"
                  : "text-[#e8e0d5]/70 hover:text-[#e8e0d5] hover:border-[#A3704C]/50"
        }`;

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                scrolled
                    ? "glass-nav-light shadow-gourmet h-16"
                    : "glass-nav h-20"
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-6 md:px-10">
                {/* Logo */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span
                            className={`font-display text-xl font-semibold tracking-tight transition-fast ${
                                scrolled ? "text-[#1A231E]" : "text-white"
                            }`}
                        >
                            Dinity
                        </span>
                        <span
                            className={`text-[10px] tracking-[0.2em] uppercase border px-1.5 py-0.5 transition-fast ${
                                scrolled
                                    ? "border-[#A3704C]/40 text-[#A3704C]"
                                    : "border-white/20 text-white/60"
                            }`}
                        >
                            Reserve
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex gap-7 items-center">
                        <Link to="/" className={navLinkClass(location.pathname === "/")}>
                            Discover
                        </Link>
                        <Link to="/search" className={navLinkClass(location.pathname.startsWith("/search"))}>
                            Restaurants
                        </Link>
                        <button
                            onClick={handleDashboardClick}
                            className={navLinkClass(location.pathname === "/dashboard")}
                        >
                            My Bookings
                        </button>
                    </div>
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center gap-5">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                                className={`flex items-center gap-2.5 cursor-pointer group transition-fast`}
                            >
                                <span className="w-8 h-8 rounded-full bg-[#A3704C] flex items-center justify-center text-white text-xs font-semibold uppercase shadow-gold">
                                    {user.name.charAt(0)}
                                </span>
                                <span className={`text-sm max-w-[100px] truncate transition-fast ${scrolled ? "text-[#1A231E]" : "text-white"}`}>
                                    {user.name.split(" ")[0]}
                                </span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""} ${scrolled ? "text-[#1A231E]" : "text-white/70"}`} />
                            </button>

                            {dropdownOpen && (
                                <div
                                    className="absolute right-0 mt-3 w-60 bg-[#1A231E] border border-[#A3704C]/20 shadow-gourmet-lg rounded-xl py-2 z-50 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-4 py-3 border-b border-[#A3704C]/15">
                                        <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-[#e8e0d5]/50 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleDashboardClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#e8e0d5]/70 hover:text-white hover:bg-white/5 transition-fast text-left cursor-pointer"
                                    >
                                        <CalendarDays size={14} className="text-[#A3704C]" />
                                        My Bookings
                                    </button>
                                    {user.role === "admin" && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#e8e0d5]/70 hover:text-white hover:bg-white/5 transition-fast cursor-pointer"
                                        >
                                            <ShieldCheck size={14} className="text-[#A3704C]" />
                                            Admin Console
                                        </Link>
                                    )}
                                    {user.role === "owner" && (
                                        <Link
                                            to="/owner/dashboard"
                                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#e8e0d5]/70 hover:text-white hover:bg-white/5 transition-fast cursor-pointer"
                                        >
                                            <ShieldCheck size={14} className="text-[#A3704C]" />
                                            Owner Portal
                                        </Link>
                                    )}
                                    <div className="border-t border-[#A3704C]/15 mt-1 pt-1">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-fast text-left cursor-pointer"
                                        >
                                            <LogOut size={14} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className={`text-sm transition-fast cursor-pointer ${scrolled ? "text-[#1A231E]/70 hover:text-[#1A231E]" : "text-white/70 hover:text-white"}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="btn-press text-xs font-semibold tracking-wider uppercase px-5 py-2.5 bg-[#A3704C] hover:bg-[#8a5c3a] text-white rounded-lg transition-fast cursor-pointer shadow-gold"
                            >
                                Reserve a Table
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`md:hidden p-2 transition-fast cursor-pointer ${scrolled ? "text-[#1A231E]" : "text-white"}`}
                    aria-label="Toggle Menu"
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute inset-x-0 top-full bg-[#1A231E] border-t border-[#A3704C]/20 py-6 px-6 z-40 flex flex-col gap-5 shadow-gourmet-lg">
                    <Link to="/" className="text-base text-[#e8e0d5] hover:text-white transition-fast">Discover</Link>
                    <Link to="/search" className="text-base text-[#e8e0d5] hover:text-white transition-fast">Restaurants</Link>
                    <button onClick={handleDashboardClick} className="text-base text-[#e8e0d5] hover:text-white transition-fast text-left cursor-pointer">My Bookings</button>

                    <div className="border-t border-[#A3704C]/15 pt-4">
                        {user ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-[#A3704C] flex items-center justify-center text-white text-sm uppercase font-semibold">
                                        {user.name.charAt(0)}
                                    </span>
                                    <div>
                                        <p className="text-sm text-white">{user.name}</p>
                                        <p className="text-xs text-[#e8e0d5]/50">{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="text-sm text-[#e8e0d5]/70 hover:text-white">My Bookings</Link>
                                {user.role === "admin" && <Link to="/admin/dashboard" className="text-sm text-[#e8e0d5]/70 hover:text-white">Admin Console</Link>}
                                {user.role === "owner" && <Link to="/owner/dashboard" className="text-sm text-[#e8e0d5]/70 hover:text-white">Owner Portal</Link>}
                                <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 text-left cursor-pointer">Sign Out</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button onClick={() => setAuthModalOpen(true)} className="w-full border border-[#A3704C]/40 text-center py-3 text-sm text-[#e8e0d5] hover:border-[#A3704C] rounded-lg cursor-pointer transition-fast">Sign In</button>
                                <button onClick={() => setAuthModalOpen(true)} className="w-full bg-[#A3704C] text-white text-center py-3 text-xs font-semibold tracking-widest uppercase rounded-lg cursor-pointer transition-fast">Reserve a Table</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
