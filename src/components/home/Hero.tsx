import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, ChevronRight } from "lucide-react";
import { assets } from "../../assets/assets";

const filterTags = [
    { label: "Fine Dining", emoji: "🕯️" },
    { label: "Rooftop", emoji: "🌆" },
    { label: "Outdoor Seating", emoji: "🌿" },
    { label: "Live Music", emoji: "🎻" },
    { label: "Private Room", emoji: "🔒" },
    { label: "Pet Friendly", emoji: "🐾" },
    { label: "Waterfront", emoji: "🌊" },
];

export default function Hero() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [guests, setGuests] = useState("2");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (location) params.append("location", location);
        if (date) params.append("date", date);
        if (guests) params.append("guests", guests);
        if (activeFilter) params.append("tag", activeFilter);
        navigate(`/search?${params.toString()}`);
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    alt="Elegant Dining"
                    className="w-full h-full object-cover"
                    src={assets.hero_bg_img}
                />
                {/* Multi-layer overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#11161B]/80 via-[#11161B]/50 to-[#11161B]/80" />
                <div className="absolute inset-0 bg-[#A3704C]/5 mix-blend-multiply" />
            </div>

            {/* Floating label top-right */}
            <div className="absolute top-32 right-8 md:right-16 hidden md:flex flex-col items-end gap-1 z-10">
                <span className="text-[9px] text-[#A3704C]/70 tracking-[0.3em] uppercase">Est. 2024</span>
                <div className="w-12 h-px bg-[#A3704C]/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl px-6 md:px-10 text-center fade-up">
                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-8 bg-[#A3704C]/50" />
                    <span className="text-[10px] text-[#A3704C] tracking-[0.35em] uppercase font-medium">
                        Exquisite Dining Experiences
                    </span>
                    <div className="h-px w-8 bg-[#A3704C]/50" />
                </div>

                <h1 className="font-display text-5xl md:text-7xl text-white mb-4 max-w-4xl mx-auto leading-[1.08] font-medium tracking-tight">
                    Curation for the{" "}
                    <span className="gold-shimmer italic">Discerning</span>{" "}
                    Palate
                </h1>

                <p className="text-sm text-white/45 mb-12 max-w-md mx-auto leading-relaxed">
                    Reserve a table at the world's finest restaurants, curated for connoisseurs of exceptional cuisine.
                </p>

                {/* Search Widget */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-gourmet-lg overflow-hidden max-w-4xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Search */}
                        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#D5CFC8]/60">
                            <Search size={16} className="text-[#A3704C] shrink-0" />
                            <input
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-[#1A231E] placeholder:text-[#1A231E]/35"
                                placeholder="Cuisine, restaurant, or chef..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Location */}
                        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#D5CFC8]/60">
                            <MapPin size={16} className="text-[#A3704C] shrink-0" />
                            <input
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-[#1A231E] placeholder:text-[#1A231E]/35"
                                placeholder="City or neighbourhood..."
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#D5CFC8]/60">
                            <Calendar size={16} className="text-[#A3704C] shrink-0" />
                            <input
                                className="bg-transparent border-none focus:outline-none text-sm text-[#1A231E] cursor-pointer w-32"
                                type="date"
                                value={date}
                                min={today}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        {/* Guests */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#D5CFC8]/60">
                            <Users size={16} className="text-[#A3704C] shrink-0" />
                            <select
                                className="bg-transparent border-none focus:outline-none text-sm text-[#1A231E] cursor-pointer"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                            >
                                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                    <option key={n} value={String(n)}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-press flex items-center gap-2 bg-[#A3704C] hover:bg-[#8a5c3a] text-white text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-fast cursor-pointer"
                        >
                            Find a Table
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </form>

                {/* Filter Pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {filterTags.map((tag) => (
                        <button
                            key={tag.label}
                            type="button"
                            onClick={() => setActiveFilter(activeFilter === tag.label ? null : tag.label)}
                            className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border transition-fast cursor-pointer ${
                                activeFilter === tag.label
                                    ? "bg-[#A3704C] border-[#A3704C] text-white"
                                    : "border-white/20 text-white/60 hover:border-[#A3704C]/60 hover:text-white/80 bg-white/5 backdrop-blur-sm"
                            }`}
                        >
                            <span>{tag.emoji}</span>
                            {tag.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
                <span className="text-[9px] text-white tracking-[0.3em] uppercase">Explore</span>
                <div className="w-px h-10 bg-white/30 animate-pulse" />
            </div>
        </section>
    );
}
