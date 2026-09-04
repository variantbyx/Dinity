/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import AuthModal from "../components/AuthModal.tsx";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import RestaurantHero from "../components/restaurant/RestaurantHero.tsx";
import RestaurantInfo from "../components/restaurant/RestaurantInfo.tsx";
import RestaurantReviews from "../components/restaurant/RestaurantReviews.tsx";
import BookingWidget from "../components/restaurant/BookingWidget.tsx";
import { restaurantAPI } from "../api/api";
import { dummyRestaurant } from "../assets/assets.ts";

export default function RestaurantDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated, setAuthModalOpen } = useAppContext();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Booking Widget states
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [selectedGuests, setSelectedGuests] = useState("2");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [slotsAvailability, setSlotsAvailability] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await restaurantAPI.getRestaurantBySlug(slug);
                if (res.success && res.data) {
                    setRestaurant(res.data);
                } else {
                    const fallback = dummyRestaurant.find((r: any) => r.slug === slug);
                    setRestaurant(fallback || null);
                }
            } catch (error) {
                console.error("Failed to load restaurant from backend:", error);
                const fallback = dummyRestaurant.find((r: any) => r.slug === slug);
                setRestaurant(fallback || null);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [slug]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!restaurant?._id || !selectedDate) return;
            setLoadingSlots(true);
            try {
                const res = await restaurantAPI.getAvailability(restaurant._id, selectedDate);
                if (res.success && res.data?.availability) {
                    setSlotsAvailability(res.data.availability);
                } else {
                    setSlotsAvailability([]);
                }
            } catch (error) {
                console.error("Failed to load real-time slot availability:", error);
                setSlotsAvailability([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [restaurant?._id, selectedDate]);

    if (loading) {
        return <Loader text="Loading Restaurant Details..." />;
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
                <Navbar />
                <main className="grow flex flex-col items-center justify-center py-20 text-center px-6">
                    <h2 className="font-display text-2xl font-bold text-[#1A231E] mb-2">Restaurant Not Found</h2>
                    <p className="text-sm text-[#1A231E]/40 mb-6">The requested establishment could not be retrieved.</p>
                    <button onClick={() => navigate("/search")} className="btn-press bg-[#A3704C] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider">
                        Browse Restaurants
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    const handleReserveClick = () => {
        if (!selectedDate) {
            toast.error("Please select a reservation date.");
            return;
        }

        if (!selectedSlot) {
            toast.error("Please select a dining time slot.");
            return;
        }

        if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
        }

        // Redirect to confirmation page with query params
        navigate(`/booking/${restaurant.slug}?slot=${selectedSlot}&date=${selectedDate}&guests=${selectedGuests}`);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-20">
            <Navbar />
            <AuthModal />

            {/* Hero Image Section */}
            <RestaurantHero restaurant={restaurant} />

            {/* Split Content Section */}
            <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column (Details, Menu, Reviews) */}
                    <div className="lg:col-span-8 space-y-12">
                        <RestaurantInfo restaurant={restaurant} />
                        <RestaurantReviews />
                    </div>

                    {/* Right Column (Sticky Reservation Widget) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-36">
                        <BookingWidget
                            restaurant={restaurant}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedGuests={selectedGuests}
                            setSelectedGuests={setSelectedGuests}
                            selectedSlot={selectedSlot}
                            setSelectedSlot={setSelectedSlot}
                            slotsAvailability={slotsAvailability}
                            loadingSlots={loadingSlots}
                            isAuthenticated={isAuthenticated}
                            handleReserveClick={handleReserveClick}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
