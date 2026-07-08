/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star, MapPin } from "lucide-react";
import { dummyRating, dummyReviewCount } from "../../assets/assets.ts";

interface RestaurantHeroProps {
    restaurant: any;
}

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
    if (!restaurant) return null;

    return (
        <section className="relative h-[520px] w-full overflow-hidden">
            <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover brightness-[0.65]"
            />
            {/* Gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#11161B]/80 via-[#11161B]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#11161B]/30 to-transparent" />

            {/* Info */}
            <div className="absolute bottom-0 inset-x-0 py-10">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="space-y-4 max-w-2xl">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-semibold tracking-widest text-[#1A231E] bg-[#A3704C] py-1 px-3 rounded-full uppercase">
                                {restaurant.cuisine}
                            </span>
                            {restaurant.exclusive && (
                                <span className="text-[10px] font-semibold tracking-widest text-white border border-white/30 py-1 px-3 rounded-full uppercase">
                                    Exclusive Club
                                </span>
                            )}
                        </div>

                        <h1 className="font-display text-4xl md:text-6xl font-semibold text-white tracking-tight leading-tight">
                            {restaurant.name}
                        </h1>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs">
                            <div className="flex items-center gap-1.5">
                                <Star size={13} fill="#C9A96E" className="text-[#C9A96E]" />
                                <span className="font-semibold text-white">{dummyRating.toFixed(1)}</span>
                                <span className="text-white/40">({dummyReviewCount} reviews)</span>
                            </div>
                            <span className="text-white/20">·</span>
                            <span className="font-medium text-[#C9A96E]">{restaurant.priceRange}</span>
                            <span className="text-white/20">·</span>
                            <span className="flex items-center gap-1">
                                <MapPin size={11} className="text-[#A3704C]" />
                                {restaurant.location}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
