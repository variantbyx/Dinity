/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { CheckCircle2, Utensils, MapPin, Users, XCircle } from "lucide-react";

interface AdminApprovalsProps {
    pendingRestaurants: any[];
    otherRestaurants: any[];
    btnLoading: string | null;
    onApproveStatus: (restaurantId: string, status: "approved" | "rejected") => Promise<void>;
}

export default function AdminApprovals({ pendingRestaurants, otherRestaurants, btnLoading, onApproveStatus }: AdminApprovalsProps) {
    return (
        <div className="space-y-10 text-left">
            {/* Section A: Pending */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl font-semibold text-[#1A231E]">
                        Pending Registrations
                    </h3>
                    {pendingRestaurants.length > 0 && (
                        <span className="text-xs font-bold text-white bg-[#A3704C] px-2.5 py-0.5 rounded-full">
                            {pendingRestaurants.length}
                        </span>
                    )}
                </div>

                {pendingRestaurants.length === 0 ? (
                    <div className="bento-tile p-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#2E7D32]/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={22} className="text-[#2E7D32]" />
                        </div>
                        <p className="text-sm text-[#1A231E]/40 italic">All registration requests have been processed.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRestaurants.map((r) => (
                            <div key={r._id} className="bento-tile p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-display text-base font-semibold text-[#1A231E]">{r.name}</h4>
                                    <p className="text-xs text-[#1A231E]/45 leading-relaxed max-w-md">{r.description}</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#1A231E]/40 pt-1">
                                        <span className="flex items-center gap-1"><Utensils size={11} className="text-[#A3704C]" /> {r.cuisine}</span>
                                        <span className="flex items-center gap-1"><MapPin size={11} className="text-[#A3704C]" /> {r.address}</span>
                                        <span className="flex items-center gap-1"><Users size={11} className="text-[#A3704C]" /> {r.totalSeats} seats</span>
                                    </div>
                                    <p className="text-[10px] text-[#A3704C] font-semibold tracking-wide uppercase">
                                        Owner: {r.owner?.name} ({r.owner?.email})
                                    </p>
                                </div>

                                <div className="flex gap-2.5 shrink-0 w-full md:w-auto justify-end">
                                    <button
                                        disabled={btnLoading === r._id}
                                        onClick={() => onApproveStatus(r._id, "approved")}
                                        className="btn-press flex items-center gap-1.5 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256427] text-white text-xs font-semibold tracking-wider uppercase rounded-xl cursor-pointer disabled:opacity-50 transition-fast"
                                    >
                                        <CheckCircle2 size={13} />
                                        Approve
                                    </button>
                                    <button
                                        disabled={btnLoading === r._id}
                                        onClick={() => onApproveStatus(r._id, "rejected")}
                                        className="btn-press flex items-center gap-1.5 px-5 py-2.5 border border-[#C62828]/40 text-[#C62828] hover:bg-[#C62828]/10 text-xs font-semibold tracking-wider uppercase rounded-xl cursor-pointer disabled:opacity-50 transition-fast"
                                    >
                                        <XCircle size={13} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section B: Registered Partners */}
            <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-[#1A231E]">
                    Registered Establishments ({otherRestaurants.length})
                </h3>

                {otherRestaurants.length === 0 ? (
                    <p className="text-sm text-[#1A231E]/35 italic">No approved or rejected records yet.</p>
                ) : (
                    <div className="bento-tile overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-[#F5F2EF] border-b border-[#D5CFC8]/50">
                                    {["Establishment", "Cuisine & City", "Owner", "Status / Actions"].map((h, i) => (
                                        <th key={h} className={`px-5 py-3 text-[9px] font-semibold tracking-[0.2em] text-[#1A231E]/40 uppercase ${i === 3 ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D5CFC8]/30">
                                {otherRestaurants.map((r) => (
                                    <tr key={r._id} className="hover:bg-[#F5F2EF]/60 transition-fast">
                                        <td className="px-5 py-4 font-semibold text-[#1A231E]">
                                            <Link to={`/restaurant/${r.slug}`} className="hover:text-[#A3704C] transition-fast">
                                                {r.name}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-[#1A231E]/50">{r.cuisine} · {r.location}</td>
                                        <td className="px-5 py-4 text-[#1A231E]/50">{r.owner?.name || "N/A"}</td>
                                        <td className="px-5 py-4 text-right space-x-3">
                                            <span className={`inline-flex text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
                                                r.status === "approved"
                                                    ? "bg-[#2E7D32]/10 text-[#2E7D32]"
                                                    : "bg-[#C62828]/10 text-[#C62828]"
                                            }`}>
                                                {r.status}
                                            </span>
                                            {r.status === "approved" ? (
                                                <button onClick={() => onApproveStatus(r._id, "rejected")} className="text-[#C62828] hover:underline text-[10px] uppercase font-semibold cursor-pointer transition-fast">Suspend</button>
                                            ) : (
                                                <button onClick={() => onApproveStatus(r._id, "approved")} className="text-[#2E7D32] hover:underline text-[10px] uppercase font-semibold cursor-pointer transition-fast">Re-Approve</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
