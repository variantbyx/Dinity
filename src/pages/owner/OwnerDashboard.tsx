/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import Navbar from "../../components/Navbar.tsx";
import Footer from "../../components/Footer.tsx";
import Loader from "../../components/Loader.tsx";
import { CalendarIcon, SettingsIcon, LogOut } from "lucide-react";
import RestaurantWizard from "../../components/owner/RestaurantWizard.tsx";
import PendingApproval from "../../components/owner/PendingApproval.tsx";
import RequestRejected from "../../components/owner/RequestRejected.tsx";
import OwnerBookings from "../../components/owner/OwnerBookings.tsx";
import OwnerProfileDetails from "../../components/owner/OwnerProfileDetails.tsx";
import { dummyMyBookingsData, dummyRestaurant } from "../../assets/assets.ts";

export default function OwnerDashboard() {
    const { logout } = useAppContext();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"bookings" | "details">("bookings");

    const fetchOwnerData = async () => {
        const localRest = localStorage.getItem("dummyRestaurants");
        const restaurantsList = localRest ? JSON.parse(localRest) : dummyRestaurant;
        if (!localRest) localStorage.setItem("dummyRestaurants", JSON.stringify(dummyRestaurant));

        const userRestaurant = restaurantsList.find((r: any) => r.owner === "6a32a3c50e88c825d8873f77");
        setRestaurant(userRestaurant || null);

        const localBookings = localStorage.getItem("bookings");
        const bookingsList = localBookings ? JSON.parse(localBookings) : dummyMyBookingsData;
        if (!localBookings) localStorage.setItem("bookings", JSON.stringify(dummyMyBookingsData));

        if (userRestaurant) {
            const restaurantBookings = bookingsList.filter(
                (b: any) => (b.restaurant?._id === userRestaurant._id) || (b.restaurant === userRestaurant._id)
            );
            setBookings(restaurantBookings);
        } else {
            setBookings([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        (async () => await fetchOwnerData())();
    }, []);

    if (loading) return <Loader text="Loading Owner Portal..." />;

    const navItems = [
        { id: "bookings", label: `Reservations (${bookings.length})`, icon: CalendarIcon },
        { id: "details", label: "Restaurant Details", icon: SettingsIcon },
    ] as const;

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-14">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-px bg-[#A3704C]" />
                            <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">Owner Portal</span>
                        </div>
                        <h1 className="font-display text-3xl font-semibold text-[#1A231E]">Restaurant Portal</h1>
                        <p className="text-sm text-[#1A231E]/45 mt-1">Manage your reservations and restaurant details.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="btn-press flex items-center gap-2 border border-[#D5CFC8]/60 text-[#1A231E]/60 hover:text-[#C62828] hover:border-[#C62828]/40 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-xl cursor-pointer transition-fast"
                    >
                        <LogOut size={13} />
                        Sign Out
                    </button>
                </div>

                {/* Case 1: No Restaurant */}
                {!restaurant ? (
                    <RestaurantWizard setRestaurant={setRestaurant} />
                ) : restaurant.status === "pending" ? (
                    <PendingApproval restaurant={restaurant} />
                ) : restaurant.status === "rejected" ? (
                    <RequestRejected restaurantName={restaurant.name} />
                ) : (
                    /* Approved: Full dashboard */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <aside className="lg:col-span-3">
                            <div className="bento-tile p-5 h-fit sticky top-28">
                                {/* Restaurant identity */}
                                <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[#D5CFC8]/40">
                                    <div className="w-11 h-11 rounded-xl bg-[#A3704C] flex items-center justify-center text-white font-display text-lg font-semibold">
                                        {restaurant.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[#1A231E] text-sm line-clamp-1">{restaurant.name}</h4>
                                        <span className="text-[9px] font-semibold text-[#2E7D32] tracking-widest uppercase bg-[#2E7D32]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                            ✓ Approved
                                        </span>
                                    </div>
                                </div>

                                <nav className="flex flex-col gap-1">
                                    {navItems.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wide rounded-xl text-left cursor-pointer transition-fast ${
                                                activeTab === id
                                                    ? "bg-[#A3704C] text-white shadow-gold"
                                                    : "text-[#1A231E]/50 hover:text-[#1A231E] hover:bg-[#F5F2EF]"
                                            }`}
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-9">
                            {activeTab === "bookings" && (
                                <OwnerBookings bookings={bookings} setBookings={setBookings} totalSeats={restaurant.totalSeats} />
                            )}
                            {activeTab === "details" && (
                                <OwnerProfileDetails restaurant={restaurant} setRestaurant={setRestaurant} />
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
