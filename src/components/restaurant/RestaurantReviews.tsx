/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star } from "lucide-react";
import { dummyReviews } from "../../assets/assets.ts";

export default function RestaurantReviews() {
    return (
        <div className="bento-tile p-6 space-y-6 text-left">
            <div>
                <h3 className="font-display text-xl font-semibold text-[#1A231E] mb-1">Guest Experiences</h3>
                <div className="divider-gold mt-3" />
            </div>

            <div className="space-y-5">
                {dummyReviews.length === 0 ? (
                    <p className="text-xs text-[#1A231E]/30 italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                    dummyReviews.map((r: any) => (
                        <div key={r._id} className="pb-5 border-b border-[#D5CFC8]/40 last:border-b-0 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className="w-7 h-7 rounded-full bg-[#A3704C]/15 flex items-center justify-center text-[#A3704C] text-[10px] font-semibold uppercase">
                                            {r.userName.charAt(0)}
                                        </div>
                                        <h4 className="text-sm font-semibold text-[#1A231E]">{r.userName}</h4>
                                    </div>
                                    <span className="text-[10px] text-[#1A231E]/35 ml-9">
                                        Visited {new Date(r.visitedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={11}
                                            fill={i < r.rating ? "#C9A96E" : "none"}
                                            className={i < r.rating ? "text-[#C9A96E]" : "text-[#D5CFC8]"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-[#1A231E]/50 leading-relaxed max-w-lg ml-9">
                                {r.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
