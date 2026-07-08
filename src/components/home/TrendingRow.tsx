/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RestaurantCard from "../RestaurantCard.tsx";

interface TrendingRowProps {
    trending: any[];
    loading: boolean;
}

export default function TrendingRow({ trending, loading }: TrendingRowProps) {
    return (
        <section className="py-28 bg-[#F5F2EF]">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-px bg-[#A3704C]" />
                            <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">
                                Tonight's Finest
                            </span>
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1A231E] leading-tight">
                            Trending Fine Dining
                        </h2>
                    </div>
                    <Link
                        to="/search"
                        className="mt-4 md:mt-0 flex items-center gap-2 text-xs text-[#A3704C] hover:text-[#8a5c3a] tracking-wider uppercase font-medium group transition-fast"
                    >
                        View All
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-2 border-[#A3704C]/15" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#A3704C] animate-spin" />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {trending.slice(0, 3).map((r) => (
                            <RestaurantCard key={r._id} restaurant={r} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
