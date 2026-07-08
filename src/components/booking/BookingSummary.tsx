/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Users, Clock, MapPin, ShieldCheck } from "lucide-react";

interface BookingSummaryProps {
    restaurant: any;
    date: string;
    slot: string;
    guests: string;
}

export default function BookingSummary({ restaurant, date, slot, guests }: BookingSummaryProps) {
    if (!restaurant) return null;

    return (
        <div className="bento-tile text-left overflow-hidden sticky top-24">
            {/* Restaurant image header */}
            <div className="relative h-40 overflow-hidden">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover brightness-[0.75]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11161B]/60 to-transparent" />
                <div className="absolute bottom-4 left-5">
                    <span className="text-[9px] text-[#A3704C] tracking-widest uppercase font-medium">{restaurant.cuisine}</span>
                    <h4 className="font-display text-lg font-semibold text-white leading-tight">{restaurant.name}</h4>
                </div>
            </div>

            <div className="p-5 space-y-5">
                <div className="divider-gold" />

                {/* Details */}
                <div className="space-y-3 text-sm text-[#1A231E]">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[#1A231E]/40 flex items-center gap-2">
                            <Calendar size={13} className="text-[#A3704C]" /> Date
                        </span>
                        <span className="font-medium text-xs">
                            {new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[#1A231E]/40 flex items-center gap-2">
                            <Clock size={13} className="text-[#A3704C]" /> Time
                        </span>
                        <span className="font-medium text-xs">{slot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[#1A231E]/40 flex items-center gap-2">
                            <Users size={13} className="text-[#A3704C]" /> Guests
                        </span>
                        <span className="font-medium text-xs">{guests} {Number(guests) === 1 ? "Guest" : "Guests"}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-[#1A231E]/40 flex items-center gap-2">
                            <MapPin size={13} className="text-[#A3704C]" /> Address
                        </span>
                        <span className="font-medium text-xs text-right max-w-[55%]">{restaurant.location}</span>
                    </div>
                </div>

                <div className="divider-gold" />

                {/* Policy */}
                <div className="flex items-start gap-3 bg-[#F5F2EF] rounded-xl p-3.5">
                    <ShieldCheck size={15} className="text-[#A3704C] shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[9px] font-semibold text-[#A3704C] tracking-wider uppercase mb-1">Cancellation Policy</p>
                        <p className="text-[10px] text-[#1A231E]/45 leading-relaxed">
                            Free cancellation up to 24 hours before your reservation. Tables held for 15 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
