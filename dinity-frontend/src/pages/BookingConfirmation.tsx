/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import BookingSuccess from "../components/booking/BookingSuccess.tsx";
import BookingSummary from "../components/booking/BookingSummary.tsx";
import BookingForm from "../components/booking/BookingForm.tsx";
import { bookingAPI, restaurantAPI } from "../api/api";
import { dummyRestaurant } from "../assets/assets.ts";

export default function BookingConfirmation() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAppContext();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

    // Form inputs
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [occasion, setOccasion] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");

    // From Query Params
    const slot = searchParams.get("slot") || "";
    const date = searchParams.get("date") || "";
    const guests = searchParams.get("guests") || "2";

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            if (user.phone) setPhone(user.phone);
        }
    }, [user]);

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!slug) return;
            try {
                const res = await restaurantAPI.getRestaurantBySlug(slug);
                if (res.success && res.data) {
                    setRestaurant(res.data);
                } else {
                    const fallback = dummyRestaurant.find((r: any) => r.slug === slug);
                    setRestaurant(fallback || null);
                }
            } catch (error) {
                console.error("Failed to load restaurant:", error);
                const fallback = dummyRestaurant.find((r: any) => r.slug === slug);
                setRestaurant(fallback || null);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [slug]);

    if (loading) {
        return <Loader text="Retrieving Dining Details..." />;
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
                <Navbar />
                <main className="grow flex flex-col items-center justify-center py-20 text-center px-6">
                    <h2 className="font-display text-2xl font-bold text-[#1A231E] mb-2">Establishment Not Found</h2>
                    <button onClick={() => navigate("/search")} className="btn-press bg-[#A3704C] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider mt-4">
                        Return to Search
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    const handleConfirmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!slot || !date) {
            toast.error("Reservation details are missing. Return to restaurant details.");
            return;
        }

        try {
            setConfirming(true);
            const bookingPayload = {
                restaurantId: restaurant._id,
                date: new Date(date).toISOString(),
                time: slot,
                guests: parseInt(guests, 10),
                occasion: occasion.trim(),
                specialRequests: specialRequests.trim(),
            };

            const res = await bookingAPI.createBooking(bookingPayload);
            if (res.success && res.data) {
                setConfirmedBooking(res.data);
                toast.success("Table reserved successfully!");
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            const msg =
                error.response?.data?.message ||
                "Failed to reserve table. The slot may have filled up or is no longer available.";
            toast.error(msg);
        } finally {
            setConfirming(false);
        }
    };

    // Render Success Screen
    if (confirmedBooking) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
                <Navbar />
                <main className="grow flex items-center justify-center py-16 px-6 bg-[#F5F2EF]">
                    <BookingSuccess
                        confirmedBooking={confirmedBooking}
                        restaurant={restaurant}
                        date={date}
                        slot={slot}
                        guests={guests}
                    />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />

            {/* Breadcrumb Header */}
            <div className="bg-white border-b border-[#D5CFC8]/40 py-5">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center gap-2 text-xs text-[#1A231E]/40 font-medium">
                    <Link to="/" className="hover:text-[#A3704C] transition-fast">Home</Link>
                    <ChevronRight size={12} />
                    <Link to={`/restaurant/${restaurant.slug}`} className="hover:text-[#A3704C] transition-fast">{restaurant.name}</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#A3704C] font-semibold">Confirm Reservation</span>
                </div>
            </div>

            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left: Summary Card */}
                    <div className="lg:col-span-4 lg:sticky lg:top-36">
                        <BookingSummary restaurant={restaurant} date={date} slot={slot} guests={guests} />
                    </div>

                    {/* Right: Guest Form */}
                    <div className="lg:col-span-8">
                        <BookingForm
                            name={name}
                            setName={setName}
                            email={email}
                            setEmail={setEmail}
                            phone={phone}
                            setPhone={setPhone}
                            occasion={occasion}
                            setOccasion={setOccasion}
                            specialRequests={specialRequests}
                            setSpecialRequests={setSpecialRequests}
                            confirming={confirming}
                            onSubmit={handleConfirmSubmit}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
