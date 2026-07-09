import React from "react";

interface BookingFormProps {
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    occasion: string;
    setOccasion: (val: string) => void;
    specialRequests: string;
    setSpecialRequests: (val: string) => void;
    confirming: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const occasions = [
    { value: "Birthday", emoji: "🎂", label: "Birthday" },
    { value: "Anniversary", emoji: "💍", label: "Anniversary" },
    { value: "Date Night", emoji: "🥂", label: "Date Night" },
    { value: "Business Dining", emoji: "💼", label: "Business" },
    { value: "Celebration", emoji: "🎉", label: "Celebrate" },
];

export default function BookingForm({
    name, setName, email, setEmail, phone, setPhone,
    occasion, setOccasion, specialRequests, setSpecialRequests,
    confirming, onSubmit,
}: BookingFormProps) {

    const inputClass = "w-full bg-transparent border-b border-[#D5CFC8]/80 focus:border-[#A3704C] text-[#1A231E] text-sm py-2 pt-3 outline-none transition-fast placeholder:text-[#1A231E]/25";
    const labelClass = "block text-[9px] font-semibold text-[#A3704C] tracking-[0.2em] uppercase mb-1";

    return (
        <div className="bento-tile p-8 text-left">
            <h3 className="font-display text-xl font-semibold text-[#1A231E] mb-2">Guest Details</h3>
            <div className="divider-gold mb-6" />

            <form onSubmit={onSubmit} className="space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className={inputClass} placeholder="Your full name" required />
                    </div>
                    <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className={inputClass} placeholder="your@email.com" required />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className={inputClass} placeholder="+1 (555) 000-0000" required />
                </div>

                {/* Occasion chips */}
                <div>
                    <label className={labelClass}>Special Occasion (Optional)</label>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {occasions.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => setOccasion(occasion === o.value ? "" : o.value)}
                                className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border transition-fast cursor-pointer ${
                                    occasion === o.value
                                        ? "bg-[#A3704C] border-[#A3704C] text-white"
                                        : "border-[#D5CFC8]/80 text-[#1A231E]/50 hover:border-[#A3704C]/50 hover:text-[#A3704C]"
                                }`}
                            >
                                <span>{o.emoji}</span>
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Special Requests */}
                <div>
                    <label className={labelClass}>Special Requests (Optional)</label>
                    <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                        placeholder="Allergies, dietary restrictions, seating preference, or any special setup..."
                        className="w-full mt-2 bg-[#F5F2EF] border border-[#D5CFC8]/60 rounded-xl p-4 text-sm focus:border-[#A3704C] focus:outline-none resize-none text-[#1A231E] placeholder:text-[#1A231E]/30"
                    />
                </div>

                {/* Newsletter opt-in */}
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" id="newsletterOpt" className="mt-0.5 accent-[#A3704C] cursor-pointer" defaultChecked />
                    <span className="text-xs text-[#1A231E]/40 leading-relaxed">
                        Send me exclusive invitations and seasonal tasting menu announcements from Dinity.
                    </span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={confirming}
                    className="btn-press w-full bg-[#A3704C] hover:bg-[#8a5c3a] disabled:opacity-60 text-white py-4 text-xs font-semibold tracking-widest uppercase rounded-xl transition-fast cursor-pointer shadow-gold"
                >
                    {confirming ? "Confirming your table..." : "Book Table"}
                </button>
            </form>
        </div>
    );
}
