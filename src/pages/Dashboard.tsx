/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import RestaurantCard from "../components/RestaurantCard.tsx";
import AuthModal from "../components/AuthModal.tsx";
import { CalendarIcon, UsersIcon, ClockIcon, MapPinIcon, CalendarDaysIcon } from "lucide-react";
import toast from "react-hot-toast";
import { dummyFeaturedRestaurants, dummyMyBookingsData } from "../assets/assets.ts";

const statusColors: Record<string, string> = {
    confirmed: "bg-[#A3704C]/10 text-[#A3704C] border-[#A3704C]/25",
    completed: "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/25",
    cancelled: "bg-[#C62828]/10 text-[#C62828] border-[#C62828]/25",
};

export default function Dashboard() {
    const { user } = useAppContext();
    const [bookings, setBookings] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    useEffect(() => {
        if (!user) return;
        const local = localStorage.getItem("bookings");
        const bookingsList = local ? JSON.parse(local) : dummyMyBookingsData;
        if (!local) localStorage.setItem("bookings", JSON.stringify(dummyMyBookingsData));
        const userBookings = bookingsList.filter((b: any) => b.user?._id === user?._id || b.user === user?._id);
        setBookings(userBookings);
        setLoadingBookings(false);
    }, [user]);

    useEffect(() => {
        setRecommendations(dummyFeaturedRestaurants);
    }, []);

    const handleCancelBooking = async (bookingId: string) => {
        if (!window.confirm("Cancel this reservation?")) return;
        try {
            const local = localStorage.getItem("bookings");
            const bookingsList = local ? JSON.parse(local) : dummyMyBookingsData;
            const updated = bookingsList.map((b: any) => b._id === bookingId ? { ...b, status: "cancelled" } : b);
            localStorage.setItem("bookings", JSON.stringify(updated));
            setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: "cancelled" } : b));
            toast.success("Reservation cancelled.");
        } catch (error: any) {
            toast.error(error?.message || "Could not cancel.");
        }
    };

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingBookings = bookings.filter((b) => new Date(b.date) >= today && b.status === "confirmed");
    const pastBookings = bookings.filter((b) => new Date(b.date) < today || b.status !== "confirmed");

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />
            <AuthModal />

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-14">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-px bg-[#A3704C]" />
                        <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">My Reservations</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1A231E] mb-2">
                        Welcome, {user.name.split(" ")[0]}
                    </h2>
                    <p className="text-sm text-[#1A231E]/45">Manage your upcoming and past dining experiences.</p>
                </div>

                <div className="space-y-12">
                    {/* Upcoming Bookings */}
                    <section>
                        <h3 className="font-display text-xl font-semibold text-[#1A231E] mb-5">Upcoming Reservations</h3>

                        {loadingBookings ? (
                            <div className="bento-tile p-12 flex justify-center">
                                <div className="w-8 h-8 border-2 border-[#A3704C]/20 border-t-[#A3704C] rounded-full animate-spin" />
                            </div>
                        ) : upcomingBookings.length === 0 ? (
                            <div className="bento-tile p-14 text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F5F2EF] flex items-center justify-center mx-auto mb-4">
                                    <CalendarDaysIcon size={24} className="text-[#A3704C]/40" />
                                </div>
                                <p className="text-sm text-[#1A231E]/40 mb-5">No upcoming reservations scheduled.</p>
                                <Link
                                    to="/search"
                                    className="btn-press inline-block bg-[#A3704C] hover:bg-[#8a5c3a] text-white text-xs font-semibold tracking-widest uppercase px-7 py-3 rounded-xl transition-fast cursor-pointer"
                                >
                                    Discover Restaurants
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingBookings.map((b) => (
                                    <div key={b._id} className="bento-tile p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                                        {/* Restaurant info */}
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-gourmet">
                                                <img src={b.restaurant?.image} alt={b.restaurant?.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-semibold text-[#A3704C] tracking-widest uppercase">{b.restaurant?.cuisine}</span>
                                                <h4 className="font-display text-base font-semibold text-[#1A231E] mt-0.5">{b.restaurant?.name}</h4>
                                                <p className="text-xs text-[#1A231E]/40 flex items-center gap-1 mt-0.5">
                                                    <MapPinIcon size={11} className="text-[#A3704C]" />
                                                    {b.restaurant?.location}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Booking details chip row */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#1A231E] w-full md:w-auto">
                                            <div className="flex items-center gap-1.5 bg-[#F5F2EF] border border-[#D5CFC8]/50 px-3 py-1.5 rounded-lg">
                                                <CalendarIcon size={12} className="text-[#A3704C]" />
                                                <span>{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-[#F5F2EF] border border-[#D5CFC8]/50 px-3 py-1.5 rounded-lg">
                                                <ClockIcon size={12} className="text-[#A3704C]" />
                                                <span>{b.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-[#F5F2EF] border border-[#D5CFC8]/50 px-3 py-1.5 rounded-lg">
                                                <UsersIcon size={12} className="text-[#A3704C]" />
                                                <span>{b.guests} Guests</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => handleCancelBooking(b._id)}
                                            className="btn-press px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#C62828] hover:bg-[#C62828]/10 border border-[#C62828]/30 hover:border-[#C62828]/60 rounded-xl cursor-pointer transition-fast whitespace-nowrap"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Dining History */}
                    {!loadingBookings && pastBookings.length > 0 && (
                        <section>
                            <h3 className="font-display text-xl font-semibold text-[#1A231E] mb-5">Dining History</h3>
                            <div className="bento-tile overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-[#F5F2EF] border-b border-[#D5CFC8]/50">
                                            {["Restaurant", "Date & Time", "Party", "Status"].map((h) => (
                                                <th key={h} className="px-5 py-3 text-[9px] font-semibold tracking-[0.2em] text-[#1A231E]/40 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#D5CFC8]/30">
                                        {pastBookings.map((b) => (
                                            <tr key={b._id} className="hover:bg-[#F5F2EF]/50 transition-fast">
                                                <td className="px-5 py-4">
                                                    <Link to={`/restaurant/${b.restaurant?.slug}`} className="font-semibold text-[#1A231E] hover:text-[#A3704C] transition-fast">
                                                        {b.restaurant?.name}
                                                    </Link>
                                                    <p className="text-[10px] text-[#1A231E]/35 mt-0.5">{b.restaurant?.cuisine}</p>
                                                </td>
                                                <td className="px-5 py-4 text-[#1A231E]/60">
                                                    {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {b.time}
                                                </td>
                                                <td className="px-5 py-4 text-[#1A231E]/60">{b.guests} {b.guests === 1 ? "Guest" : "Guests"}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center border text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full ${statusColors[b.status] || statusColors.confirmed}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <section className="pt-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-6 h-px bg-[#A3704C]" />
                                <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">Curated for You</span>
                            </div>
                            <h3 className="font-display text-xl font-semibold text-[#1A231E] mb-5">Recommended Experiences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.slice(0, 3).map((r) => (
                                    <RestaurantCard key={r._id} restaurant={r} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
