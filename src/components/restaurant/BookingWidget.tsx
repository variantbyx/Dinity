/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Users, Flame } from "lucide-react";

interface BookingWidgetProps {
    restaurant: any;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedGuests: string;
    setSelectedGuests: (guests: string) => void;
    selectedSlot: string;
    setSelectedSlot: (slot: string) => void;
    slotsAvailability: any[];
    loadingSlots: boolean;
    isAuthenticated: boolean;
    handleReserveClick: () => void;
}

// Classify slots
const isLunchSlot = (time: string) => parseInt(time.split(":")[0]) < 17;
const isHighDemand = (time: string) => ["19:00", "19:30", "20:00", "20:30"].includes(time);

export default function BookingWidget({
    restaurant,
    selectedDate,
    setSelectedDate,
    selectedGuests,
    setSelectedGuests,
    selectedSlot,
    setSelectedSlot,
    slotsAvailability,
    loadingSlots,
    isAuthenticated,
    handleReserveClick,
}: BookingWidgetProps) {
    if (!restaurant) return null;

    const today = new Date().toISOString().split("T")[0];

    const allSlots: any[] =
        slotsAvailability.length > 0
            ? slotsAvailability
            : (restaurant.availableSlots || []).map((s: string) => ({
                  time: s,
                  availableSeats: 20,
                  isAvailable: true,
              }));

    const isToday = selectedDate === today;
    const visibleSlots = allSlots.filter((slotInfo: any) => {
        if (!isToday) return true;
        const [h, m] = slotInfo.time.split(":").map(Number);
        const now = new Date();
        return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
    });

    const lunchSlots = visibleSlots.filter((s: any) => isLunchSlot(s.time));
    const dinnerSlots = visibleSlots.filter((s: any) => !isLunchSlot(s.time));

    const renderSlot = (slotInfo: any) => {
        const slot = slotInfo.time;
        const isSelected = selectedSlot === slot;
        const isFull = !slotInfo.isAvailable || slotInfo.availableSeats < Number(selectedGuests);
        const highDemand = isHighDemand(slot);

        return (
            <button
                key={slot}
                type="button"
                disabled={isFull}
                onClick={() => setSelectedSlot(slot)}
                className={`relative py-2 px-2 text-center text-[10px] font-semibold tracking-wider rounded-xl border transition-fast ${
                    isSelected
                        ? "slot-selected"
                        : isFull
                          ? "bg-[#F5F2EF] border-[#D5CFC8]/40 text-[#1A231E]/25 cursor-not-allowed"
                          : "border-[#D5CFC8]/60 text-[#1A231E]/60 hover:border-[#A3704C] hover:text-[#A3704C] bg-white cursor-pointer"
                }`}
            >
                {slot}
                {isFull && <span className="block text-[8px] text-[#C62828] mt-0.5">Full</span>}
                {highDemand && !isFull && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C62828] rounded-full pulse-dot" title="High Demand" />
                )}
            </button>
        );
    };

    return (
        <div className="bento-tile p-6 text-left sticky top-24">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold text-[#1A231E]">Reserve a Table</h3>
                <span className="text-[10px] text-[#A3704C] font-medium tracking-wider bg-[#A3704C]/10 px-2.5 py-1 rounded-full">
                    Free cancellation
                </span>
            </div>
            <div className="divider-gold mb-5" />

            <div className="space-y-5">
                {/* Party Size */}
                <div>
                    <label className="block text-[9px] font-semibold text-[#1A231E]/40 tracking-[0.2em] uppercase mb-2">Party Size</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3704C]" size={15} />
                        <select
                            value={selectedGuests}
                            onChange={(e) => setSelectedGuests(e.target.value)}
                            className="w-full bg-[#F5F2EF] pl-9 pr-3 py-2.5 text-sm border border-[#D5CFC8]/60 focus:border-[#A3704C] focus:outline-none rounded-xl cursor-pointer text-[#1A231E]"
                        >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                <option key={n} value={String(n)}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-[9px] font-semibold text-[#1A231E]/40 tracking-[0.2em] uppercase mb-2">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3704C]" size={15} />
                        <input
                            type="date"
                            value={selectedDate}
                            min={today}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-[#F5F2EF] pl-9 pr-3 py-2.5 text-sm border border-[#D5CFC8]/60 focus:border-[#A3704C] focus:outline-none rounded-xl cursor-pointer text-[#1A231E]"
                        />
                    </div>
                </div>

                {/* Slots */}
                <div>
                    <label className="block text-[9px] font-semibold text-[#1A231E]/40 tracking-[0.2em] uppercase mb-3">Available Times</label>

                    {loadingSlots ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-[#A3704C]/20 border-t-[#A3704C] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Lunch */}
                            {lunchSlots.length > 0 && (
                                <div>
                                    <span className="text-[9px] text-[#1A231E]/30 tracking-wider uppercase font-medium block mb-2">Lunch</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {lunchSlots.map(renderSlot)}
                                    </div>
                                </div>
                            )}
                            {/* Dinner */}
                            {dinnerSlots.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] text-[#1A231E]/30 tracking-wider uppercase font-medium">Dinner</span>
                                        <Flame size={10} className="text-[#C62828]/60" />
                                        <span className="text-[9px] text-[#C62828]/50">High demand on weekends</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {dinnerSlots.map(renderSlot)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <button
                    onClick={handleReserveClick}
                    className="btn-press w-full bg-[#A3704C] hover:bg-[#8a5c3a] text-white py-4 text-xs font-semibold tracking-widest uppercase rounded-xl transition-fast cursor-pointer shadow-gold mt-2"
                >
                    {isAuthenticated ? "Reserve Now" : "Sign In to Reserve"}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#1A231E]/30">
                    <span>🔒</span>
                    <span>No charge · Free cancellation up to 24h before</span>
                </div>
            </div>
        </div>
    );
}
