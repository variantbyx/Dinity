/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, MapPin, CheckCircle2 } from "lucide-react";

interface BookingSuccessProps {
    confirmedBooking: any;
    restaurant: any;
    date: string;
    slot: string;
    guests: string;
}

export default function BookingSuccess({ confirmedBooking, restaurant, date, slot, guests }: BookingSuccessProps) {
    if (!confirmedBooking || !restaurant) return null;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="max-w-lg w-full text-center fade-up">
            {/* Success checkmark */}
            <div className="w-16 h-16 bg-[#A3704C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <CheckCircle2 size={30} className="text-white" />
            </div>

            <div className="mb-8">
                <h2 className="font-display text-3xl font-medium text-[#1A231E] mb-2">Reservation Confirmed</h2>
                <p className="text-sm text-[#1A231E]/45 max-w-sm mx-auto leading-relaxed">
                    Your table has been secured at{" "}
                    <span className="text-[#A3704C] font-medium">{restaurant.name}</span>.
                    We look forward to hosting you.
                </p>
            </div>

            {/* Boarding-pass card */}
            <div className="bg-white border border-[#D5CFC8]/60 rounded-2xl shadow-gourmet-md overflow-hidden text-left">
                {/* Card header */}
                <div className="bg-[#1A231E] p-6 flex justify-between items-start">
                    <div>
                        <span className="text-[9px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">Dinity Reserve</span>
                        <h3 className="font-display text-xl text-white mt-1">{restaurant.name}</h3>
                        <p className="text-xs text-white/40 mt-0.5">{restaurant.cuisine} · {restaurant.priceRange}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-[#A3704C] tracking-wider uppercase">Ref</p>
                        <p className="text-sm font-semibold text-white font-mono">{confirmedBooking.bookingId}</p>
                    </div>
                </div>

                {/* Dashed divider (boarding-pass effect) */}
                <div className="boarding-pass-divider mx-0" />

                {/* Details */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] text-[#1A231E]/35 tracking-wider uppercase mb-1">Date</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-[#1A231E]">
                                <Calendar size={13} className="text-[#A3704C]" />
                                {formattedDate}
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] text-[#1A231E]/35 tracking-wider uppercase mb-1">Time</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-[#1A231E]">
                                <Clock size={13} className="text-[#A3704C]" />
                                {slot}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] text-[#1A231E]/35 tracking-wider uppercase mb-1">Guests</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-[#1A231E]">
                                <Users size={13} className="text-[#A3704C]" />
                                {guests} Guests
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] text-[#1A231E]/35 tracking-wider uppercase mb-1">Location</p>
                            <div className="flex items-center gap-1.5 text-xs text-[#1A231E]/60">
                                <MapPin size={13} className="text-[#A3704C] shrink-0" />
                                <span className="line-clamp-1">{restaurant.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR placeholder */}
                    <div className="boarding-pass-divider my-4" />
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-[#F5F2EF] rounded-lg border border-[#D5CFC8]/50 flex items-center justify-center">
                            <div className="grid grid-cols-3 gap-0.5 opacity-30">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={`w-4 h-4 bg-[#1A231E] rounded-sm ${i % 3 === 1 ? "opacity-50" : ""}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[9px] text-[#1A231E]/25 tracking-wider">SHOW QR AT RESTAURANT ENTRANCE</p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                    to="/dashboard"
                    className="btn-press flex-1 bg-[#1A231E] hover:bg-[#A3704C] text-white py-3.5 text-xs font-semibold tracking-widest uppercase text-center rounded-xl transition-smooth"
                >
                    My Bookings
                </Link>
                <Link
                    to="/"
                    className="btn-press flex-1 border border-[#D5CFC8]/80 hover:border-[#A3704C] text-[#1A231E] hover:text-[#A3704C] py-3.5 text-xs font-semibold tracking-widest uppercase text-center rounded-xl transition-fast"
                >
                    Discover More
                </Link>
            </div>
        </div>
    );
}