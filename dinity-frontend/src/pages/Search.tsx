/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import RestaurantCard from "../components/RestaurantCard.tsx";
import AuthModal from "../components/AuthModal.tsx";
import { SlidersHorizontal, Search as SearchIcon, X, Check, MapPin, SearchXIcon } from "lucide-react";
import { dummyRestaurant } from "../assets/assets.ts";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const searchVal = searchParams.get("search") || "";
    const locationVal = searchParams.get("location") || "";
    const cuisinesSelected = searchParams.getAll("cuisine");
    const pricesSelected = searchParams.getAll("priceRange");
    const sortVal = searchParams.get("sort") || "";

    const [tempSearch, setTempSearch] = useState(searchVal);
    const [tempLocation, setTempLocation] = useState(locationVal);

    useEffect(() => {
        setTempSearch(searchVal);
        setTempLocation(locationVal);
    }, [searchVal, locationVal]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            const localRest = localStorage.getItem("dummyRestaurants");
            const allRestaurants = localRest ? JSON.parse(localRest) : dummyRestaurant;
            if (!localRest) localStorage.setItem("dummyRestaurants", JSON.stringify(dummyRestaurant));

            const approved = allRestaurants.filter((r: any) => r.status === "approved");
            const filtered = approved.filter((r: any) => {
                const matchesSearch = !searchVal ||
                    r.name.toLowerCase().includes(searchVal.toLowerCase()) ||
                    r.cuisine.toLowerCase().includes(searchVal.toLowerCase()) ||
                    (r.tags && r.tags.some((t: string) => t.toLowerCase().includes(searchVal.toLowerCase())));
                const matchesLocation = !locationVal ||
                    r.location.toLowerCase().includes(locationVal.toLowerCase()) ||
                    r.address.toLowerCase().includes(locationVal.toLowerCase());
                const matchesCuisine = cuisinesSelected.length === 0 ||
                    cuisinesSelected.some((c: string) => c.toLowerCase() === r.cuisine.toLowerCase());
                const matchesPrice = pricesSelected.length === 0 || pricesSelected.includes(r.priceRange);
                return matchesSearch && matchesLocation && matchesCuisine && matchesPrice;
            });

            if (sortVal === "price_low") filtered.sort((a: any, b: any) => a.priceRange.length - b.priceRange.length);
            else if (sortVal === "price_high") filtered.sort((a: any, b: any) => b.priceRange.length - a.priceRange.length);

            setRestaurants(filtered);
            setLoading(false);
        };
        fetchRestaurants();
    }, [searchParams, searchVal, locationVal, cuisinesSelected, pricesSelected, sortVal]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextParams = new URLSearchParams(searchParams);
        if (tempSearch) nextParams.set("search", tempSearch); else nextParams.delete("search");
        if (tempLocation) nextParams.set("location", tempLocation); else nextParams.delete("location");
        setSearchParams(nextParams);
    };

    const handleCuisineToggle = (cuisine: string) => {
        const nextParams = new URLSearchParams(searchParams);
        const current = nextParams.getAll("cuisine");
        if (current.includes(cuisine)) {
            const updated = current.filter((c) => c !== cuisine);
            nextParams.delete("cuisine");
            updated.forEach((u) => nextParams.append("cuisine", u));
        } else { nextParams.append("cuisine", cuisine); }
        setSearchParams(nextParams);
    };

    const handlePriceToggle = (price: string) => {
        const nextParams = new URLSearchParams(searchParams);
        const current = nextParams.getAll("priceRange");
        if (current.includes(price)) {
            const updated = current.filter((p) => p !== price);
            nextParams.delete("priceRange");
            updated.forEach((u) => nextParams.append("priceRange", u));
        } else { nextParams.append("priceRange", price); }
        setSearchParams(nextParams);
    };

    const handleSortChange = (sort: string) => {
        const nextParams = new URLSearchParams(searchParams);
        if (sort) nextParams.set("sort", sort); else nextParams.delete("sort");
        setSearchParams(nextParams);
    };

    const clearAllFilters = () => {
        setSearchParams(new URLSearchParams());
        setTempSearch("");
        setTempLocation("");
    };

    const priceOptions = ["$", "$$", "$$$", "$$$$"];
    const cuisineOptions = ["Italian", "French", "Japanese", "Steakhouse", "Vegetarian"];
    const hasActiveFilters = cuisinesSelected.length > 0 || pricesSelected.length > 0 || searchVal || locationVal;

    const FilterSidebar = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#D5CFC8]/40">
                <h3 className="font-display text-lg font-semibold text-[#1A231E]">Filters</h3>
                {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-[10px] font-semibold text-[#A3704C] hover:text-[#8a5c3a] tracking-widest uppercase cursor-pointer transition-fast">
                        Clear All
                    </button>
                )}
            </div>

            {/* Cuisine */}
            <div className="space-y-3">
                <h4 className="text-[9px] font-semibold text-[#1A231E]/40 tracking-[0.2em] uppercase">Cuisine</h4>
                <div className="space-y-1">
                    {cuisineOptions.map((c) => {
                        const active = cuisinesSelected.includes(c);
                        return (
                            <button
                                key={c}
                                onClick={() => handleCuisineToggle(c)}
                                className="w-full flex items-center justify-between text-left text-sm text-[#1A231E]/60 hover:text-[#1A231E] transition-fast cursor-pointer py-2 px-3 rounded-xl hover:bg-[#A3704C]/5"
                            >
                                <span>{c}</span>
                                <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-fast ${active ? "bg-[#A3704C] border-[#A3704C]" : "border-[#D5CFC8]"}`}>
                                    {active && <Check size={10} className="text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
                <h4 className="text-[9px] font-semibold text-[#1A231E]/40 tracking-[0.2em] uppercase">Price Range</h4>
                <div className="grid grid-cols-4 gap-2">
                    {priceOptions.map((p) => {
                        const active = pricesSelected.includes(p);
                        return (
                            <button
                                key={p}
                                onClick={() => handlePriceToggle(p)}
                                className={`py-2 text-center text-xs font-semibold rounded-xl border transition-fast cursor-pointer ${
                                    active
                                        ? "bg-[#A3704C] border-[#A3704C] text-white"
                                        : "border-[#D5CFC8]/60 text-[#1A231E]/50 hover:border-[#A3704C] hover:text-[#A3704C]"
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />
            <AuthModal />

            {/* Search Sub-header */}
            <div className="bg-white border-b border-[#D5CFC8]/40 py-3.5 sticky top-16 z-30 shadow-gourmet">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleTextSubmit} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative grow sm:grow-0 min-w-[200px]">
                            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3704C]" />
                            <input
                                type="text"
                                placeholder="Cuisine, restaurant..."
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#D5CFC8]/60 rounded-xl focus:border-[#A3704C] focus:outline-none bg-[#F5F2EF] text-[#1A231E] placeholder:text-[#1A231E]/30"
                            />
                        </div>
                        <div className="relative grow sm:grow-0 min-w-[180px]">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3704C]" />
                            <input
                                type="text"
                                placeholder="Location..."
                                value={tempLocation}
                                onChange={(e) => setTempLocation(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#D5CFC8]/60 rounded-xl focus:border-[#A3704C] focus:outline-none bg-[#F5F2EF] text-[#1A231E] placeholder:text-[#1A231E]/30"
                            />
                        </div>
                        <button type="submit" className="btn-press bg-[#A3704C] hover:bg-[#8a5c3a] text-white text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-xl cursor-pointer transition-fast">
                            Search
                        </button>
                    </form>

                    <div className="flex gap-3 w-full md:w-auto justify-end">
                        {/* Active filter pills */}
                        {cuisinesSelected.map((c) => (
                            <span key={c} className="hidden md:flex items-center gap-1.5 text-[10px] bg-[#A3704C]/10 text-[#A3704C] border border-[#A3704C]/20 px-3 py-1 rounded-full font-medium">
                                {c}
                                <button onClick={() => handleCuisineToggle(c)} className="cursor-pointer"><X size={10} /></button>
                            </span>
                        ))}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="md:hidden flex items-center gap-1.5 border border-[#D5CFC8]/60 rounded-xl text-sm font-medium px-4 py-2.5 bg-white cursor-pointer transition-fast text-[#1A231E] hover:border-[#A3704C]"
                        >
                            <SlidersHorizontal size={14} className="text-[#A3704C]" />
                            Filters {hasActiveFilters ? `(${cuisinesSelected.length + pricesSelected.length})` : ""}
                        </button>
                    </div>
                </div>
            </div>

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-10 flex gap-10">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-60 shrink-0">
                    <div className="sticky top-36 bg-white rounded-2xl border border-[#D5CFC8]/50 shadow-gourmet p-5">
                        <FilterSidebar />
                    </div>
                </aside>

                {/* Results */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-sm text-[#1A231E]/50 font-medium">
                            <span className="text-[#1A231E] font-semibold">{restaurants.length}</span>{" "}
                            {restaurants.length === 1 ? "Restaurant" : "Restaurants"} found
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#1A231E]/35 tracking-wider uppercase hidden md:block">Sort:</span>
                            <select
                                value={sortVal}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="text-xs bg-white border border-[#D5CFC8]/60 px-3 py-2 rounded-xl focus:outline-none cursor-pointer text-[#1A231E] focus:border-[#A3704C]"
                            >
                                <option value="">Default</option>
                                <option value="price_low">Price: Low → High</option>
                                <option value="price_high">Price: High → Low</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grow flex justify-center items-center py-28">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-2 border-[#A3704C]/15" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#A3704C] animate-spin" />
                            </div>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="grow flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#F5F2EF] flex items-center justify-center mb-5">
                                <SearchXIcon size={26} className="text-[#A3704C]/40" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold text-[#1A231E] mb-2">No Restaurants Found</h3>
                            <p className="text-sm text-[#1A231E]/40 max-w-sm mb-7 leading-relaxed">
                                We couldn't find any establishments matching your search. Try adjusting your filters or widening your search.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="btn-press bg-[#A3704C] hover:bg-[#8a5c3a] text-white text-xs font-semibold tracking-widest uppercase px-7 py-3 rounded-xl transition-fast cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Filters Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm md:hidden">
                    <div className="w-80 bg-white h-full p-6 flex flex-col shadow-gourmet-lg">
                        <div className="flex-1 overflow-y-auto">
                            <div className="flex justify-between items-center pb-4 mb-4">
                                <h3 className="font-display text-lg font-semibold text-[#1A231E]">Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-1.5 text-[#1A231E]/40 hover:text-[#1A231E] transition-fast cursor-pointer rounded-full hover:bg-[#F5F2EF]">
                                    <X size={18} />
                                </button>
                            </div>
                            <FilterSidebar />
                        </div>
                        <div className="pt-4 flex gap-3 border-t border-[#D5CFC8]/40 mt-4">
                            <button onClick={clearAllFilters} className="flex-1 border border-[#D5CFC8]/60 py-3 text-xs font-semibold tracking-widest uppercase cursor-pointer rounded-xl text-[#1A231E]/60 hover:border-[#A3704C]">
                                Clear
                            </button>
                            <button onClick={() => setShowMobileFilters(false)} className="flex-1 bg-[#A3704C] text-white py-3 text-xs font-semibold tracking-widest uppercase cursor-pointer rounded-xl hover:bg-[#8a5c3a]">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
