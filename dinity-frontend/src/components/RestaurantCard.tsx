import { Link, useNavigate } from "react-router-dom";
import { Star, MapPinIcon, Clock } from "lucide-react";
import { dummyRating } from "../assets/assets.ts";

interface RestaurantCardProps {
    restaurant: {
        _id: string;
        name: string;
        slug: string;
        cuisine: string;
        priceRange: string;
        rating: number;
        reviewCount: number;
        location: string;
        image: string;
        availableSlots: string[];
        featured?: boolean;
        exclusive?: boolean;
    };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const navigate = useNavigate();

    const handleSlotClick = (e: React.MouseEvent, slot: string) => {
        e.preventDefault();
        e.stopPropagation();
        const today = new Date().toISOString().split("T")[0];
        navigate(`/booking/${restaurant.slug}?slot=${slot}&date=${today}`);
    };

    const isLunch = (slot: string) => {
        const hour = parseInt(slot.split(":")[0]);
        return hour < 17;
    };

    const upcomingSlots = restaurant.availableSlots
        .filter((slot) => {
            const [h, m] = slot.split(":").map(Number);
            const now = new Date();
            return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
        })
        .slice(0, 3);

    return (
        <div className="restaurant-card group relative bg-white border border-[#D5CFC8]/60 card-lift overflow-hidden rounded-2xl flex flex-col h-full shadow-gourmet">
            {/* Image */}
            <Link to={`/restaurant/${restaurant.slug}`} className="relative h-56 overflow-hidden block">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="restaurant-card-img w-full h-full object-cover"
                    loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {restaurant.exclusive && (
                        <span className="text-[9px] font-semibold tracking-widest text-white bg-[#A3704C] py-1 px-2.5 rounded-full uppercase">
                            Exclusive
                        </span>
                    )}
                    {restaurant.featured && (
                        <span className="text-[9px] font-semibold tracking-widest text-[#1A231E] bg-[#C9A96E] py-1 px-2.5 rounded-full uppercase">
                            Recommended
                        </span>
                    )}
                </div>

                {/* Cuisine overlay bottom-left */}
                <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] font-medium tracking-widest text-white/80 uppercase">
                        {restaurant.cuisine}
                    </span>
                </div>

                {/* Rating bottom-right */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2 py-1">
                    <Star size={10} fill="#C9A96E" className="text-[#C9A96E]" />
                    <span className="text-[10px] font-semibold text-white">{dummyRating.toFixed(1)}</span>
                </div>
            </Link>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <Link to={`/restaurant/${restaurant.slug}`}>
                            <h3 className="font-display text-lg font-semibold text-[#1A231E] group-hover:text-[#A3704C] transition-fast line-clamp-1 leading-snug">
                                {restaurant.name}
                            </h3>
                        </Link>
                        <span className="text-[11px] font-medium text-[#A3704C] ml-2 shrink-0">{restaurant.priceRange}</span>
                    </div>

                    <p className="text-xs text-[#1A231E]/45 mb-3 flex items-center gap-1.5">
                        <MapPinIcon size={12} className="text-[#A3704C]/60" />
                        {restaurant.location}
                    </p>
                </div>

                {/* Quick Slots */}
                <div>
                    <div className="border-t border-[#D5CFC8]/50 my-3" />
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-semibold text-[#1A231E]/40 tracking-widest uppercase flex items-center gap-1.5">
                            <Clock size={10} className="text-[#A3704C]" />
                            Quick Reserve
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {upcomingSlots.map((slot) => (
                            <button
                                key={slot}
                                onClick={(e) => handleSlotClick(e, slot)}
                                className={`text-[10px] font-medium border rounded-lg px-3 py-1.5 transition-fast cursor-pointer ${
                                    isLunch(slot)
                                        ? "border-[#D5CFC8] text-[#1A231E]/50 hover:border-[#A3704C] hover:text-[#A3704C]"
                                        : "border-[#A3704C]/25 text-[#A3704C] hover:bg-[#A3704C] hover:text-white"
                                }`}
                            >
                                {slot}
                            </button>
                        ))}
                        <Link
                            to={`/restaurant/${restaurant.slug}`}
                            className="text-[10px] font-semibold border border-[#A3704C]/25 text-[#A3704C] px-3 py-1.5 rounded-lg hover:bg-[#A3704C] hover:text-white transition-fast cursor-pointer"
                        >
                            All →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
