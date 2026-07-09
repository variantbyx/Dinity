import { useAppContext } from "../context/AppContext.tsx";
import { ShieldAlert, ShieldX } from "lucide-react";
import AuthModal from "./AuthModal.tsx";
import Loader from "./Loader.tsx";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ("user" | "admin" | "owner")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading, setAuthModalOpen } = useAppContext();

    if (loading) {
        return <Loader text="Loading Panel Access..." />;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md bg-white border border-[#D5CFC8]/50 shadow-gourmet-md rounded-2xl p-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#A3704C]/10 flex items-center justify-center mb-6">
                        <ShieldAlert size={28} className="text-[#A3704C]" />
                    </div>
                    <h2 className="font-display text-2xl text-[#1A231E] mb-3">Members Only</h2>
                    <p className="text-sm text-[#1A231E]/45 mb-8 leading-relaxed">
                        Reservation booking and dashboard management are reserved exclusively for registered Dinity members.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => setAuthModalOpen(true)}
                            className="btn-press w-full bg-[#A3704C] hover:bg-[#8a5c3a] text-white py-3.5 px-4 text-xs font-semibold tracking-widest uppercase rounded-xl transition-fast cursor-pointer shadow-gold"
                        >
                            Sign In to Continue
                        </button>
                        <AuthModal />
                    </div>
                </div>
            </div>
        );
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md bg-white border border-[#D5CFC8]/50 shadow-gourmet-md rounded-2xl p-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#C62828]/10 flex items-center justify-center mb-6">
                        <ShieldX size={28} className="text-[#C62828]" />
                    </div>
                    <h2 className="font-display text-2xl text-[#1A231E] mb-3">Access Denied</h2>
                    <p className="text-sm text-[#1A231E]/45 mb-8 leading-relaxed">
                        You do not have the required permissions to access this dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
