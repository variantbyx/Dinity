import { assets } from "../../assets/assets";
import { BadgeCheck, Armchair, Gem } from "lucide-react";

const benefits = [
    {
        icon: BadgeCheck,
        title: "Last-Minute Reservations",
        desc: "Unlock tables held exclusively for club members during peak weekends and holidays.",
    },
    {
        icon: Armchair,
        title: "Curated Tasting Invites",
        desc: "Receive personalized invitations to private kitchen tasting sessions with acclaimed chefs.",
    },
    {
        icon: Gem,
        title: "Priority Access",
        desc: "First access to new restaurant openings and seasonal chef collaboration dinners.",
    },
];

export default function MembershipSection() {
    return (
        <section className="py-28 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Image */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-gourmet-lg">
                            <img
                                src={assets.membership_section_img}
                                alt="Chef's Table"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#11161B]/40 to-transparent" />
                        </div>
                        {/* Floating card */}
                        <div className="absolute -bottom-5 -right-5 hidden lg:block bg-[#A3704C] text-white rounded-xl p-5 shadow-gourmet-md">
                            <p className="font-display text-2xl font-semibold">150+</p>
                            <p className="text-[10px] tracking-wider uppercase text-white/70 mt-1">Partner Restaurants</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-6 lg:pl-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-px bg-[#A3704C]" />
                            <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">
                                Premium Club Membership
                            </span>
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl text-[#1A231E] mb-5 leading-tight">
                            Access the Exquisite{" "}
                            <span className="italic text-[#A3704C]">Chef's Table</span>
                        </h2>
                        <p className="text-sm text-[#1A231E]/50 mb-10 leading-relaxed">
                            Join GourmetReserve and receive priority access to seasonal chef collaborations,
                            private dining club events, and table guarantees at the most sought-after venues.
                        </p>

                        <div className="space-y-6">
                            {benefits.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-[#A3704C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#A3704C]/20 transition-fast">
                                        <Icon size={18} className="text-[#A3704C]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#1A231E] mb-1">{title}</h4>
                                        <p className="text-xs text-[#1A231E]/45 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn-press mt-10 bg-[#1A231E] hover:bg-[#A3704C] text-white text-xs font-semibold tracking-widest uppercase px-8 py-4 rounded-xl transition-smooth cursor-pointer">
                            Explore Membership
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
