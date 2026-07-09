/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin, Clock, Utensils, ChefHat, Tag } from "lucide-react";

interface RestaurantInfoProps {
    restaurant: any;
}

export default function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
    if (!restaurant) return null;

    return (
        <div className="space-y-8 text-left">
            {/* Info Ribbon — Bento tiles */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: ChefHat, label: "Chef", value: restaurant.chef },
                    { icon: Utensils, label: "Cuisine", value: restaurant.cuisine },
                    { icon: Clock, label: "Hours", value: "5 PM – 11 PM" },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bento-tile p-4 text-center flex flex-col items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#A3704C]/10 flex items-center justify-center">
                            <Icon size={16} className="text-[#A3704C]" />
                        </div>
                        <span className="text-[9px] tracking-wider text-[#1A231E]/40 uppercase font-medium">{label}</span>
                        <span className="text-xs font-medium text-[#1A231E] text-center leading-tight">{value}</span>
                    </div>
                ))}
            </div>

            {/* About */}
            <div className="bento-tile p-6 space-y-3">
                <h3 className="font-display text-xl font-semibold text-[#1A231E]">About the Dining Room</h3>
                <div className="divider-gold" />
                <p className="text-sm text-[#1A231E]/50 leading-relaxed">{restaurant.description}</p>
                <div className="flex items-start gap-2 text-xs text-[#1A231E]/40 pt-1">
                    <MapPin size={13} className="text-[#A3704C] shrink-0 mt-0.5" />
                    <span>{restaurant.address}</span>
                </div>
            </div>

            {/* Tags */}
            {restaurant.tags?.length > 0 && (
                <div className="bento-tile p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag size={13} className="text-[#A3704C]" />
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-[#1A231E]/40 uppercase">Dining Highlights</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {restaurant.tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="text-[10px] font-medium text-[#A3704C] bg-[#A3704C]/8 border border-[#A3704C]/20 px-3 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
