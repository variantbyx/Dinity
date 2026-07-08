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
import { dummyRestaurant, dummyMyBookingsData } from "../assets/assets.ts";

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
        // Prefill form when user details load
        if (user) {
            (() => {
                setName(user.name);
                setEmail(user.email);
                if (user.phone) setPhone(user.phone);
            })();
        }
    }, [user]);

    useEffect(() => {
        const fetchRestaurant = async () => {
            const localRest = localStorage.getItem("dummyRestaurants");
            const restaurantsList = localRest ? JSON.parse(localRest) : dummyRestaurant;
            setRestaurant(restaurantsList.find((r: any) => r.slug === slug));
            setLoading(false);
        };

        if (slug) {
            fetchRestaurant();
        }
    }, [slug, navigate]);

    if (loading) {
        return <Loader text="Retrieving Dining Details..." />;
    }

    if (!restaurant) return null;

    const handleConfirmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!slot || !date) {
            toast.error("Reservation details are missing. Return to restaurant details.");
            return;
        }

        try {
            setConfirming(true);
            const newBooking = {
                _id: "booking_" + Date.now(),
                user: {
                    _id: user?._id || "6a32a3c50e88c825d8873f75",
                    name: name || user?.name || "Diner User",
                    email: email || user?.email || "diner@example.com"
                },
                restaurant: {
                    _id: restaurant._id,
                    name: restaurant.name,
                    slug: restaurant.slug,
                    location: restaurant.location,
                    address: restaurant.address,
                    image: restaurant.image,
                    cuisine: restaurant.cuisine
                },
                date: new Date(date).toISOString(),
                time: slot,
                guests: Number(guests),
                occasion: occasion,
                specialRequests: specialRequests,
                status: "confirmed",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                bookingId: "GR-" + Math.random().toString(36).substring(2, 10).toUpperCase()
            };

            const localBookings = localStorage.getItem("bookings");
            const bookingsList = localBookings ? JSON.parse(localBookings) : dummyMyBookingsData;

            if (!localBookings) {
                localStorage.setItem("bookings", JSON.stringify(dummyMyBookingsData));
            }

            const updatedBookings = [newBooking, ...(localBookings ? bookingsList : dummyMyBookingsData)];
            localStorage.setItem("bookings", JSON.stringify(updatedBookings));

            setConfirmedBooking(newBooking);
            toast.success("Reservation confirmed!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message);
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
                    <BookingSuccess confirmedBooking={confirmedBooking} restaurant={restaurant} date={date} slot={slot} guests={guests} />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />

            {/* Main Booking Content */}
            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-10 pb-4 border-b border-[#D5CFC8]/40 text-xs text-[#1A231E]/40">
                    <Link to={`/restaurant/${restaurant.slug}`} className="hover:text-[#A3704C] transition-fast">
                        {restaurant.name}
                    </Link>
                    <ChevronRight size={12} className="text-[#D5CFC8]" />
                    <span className="text-[#A3704C] font-medium">Details & Confirmation</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column (Reservation Summary) */}
                    <div className="lg:col-span-5">
                        <BookingSummary restaurant={restaurant} date={date} slot={slot} guests={guests} />
                    </div>

                    {/* Right Column (Guest Details Form) */}
                    <div className="lg:col-span-7">
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
