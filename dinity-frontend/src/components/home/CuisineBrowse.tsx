import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cuisines } from "../../assets/assets";

export default function CuisineBrowse() {
    const navigate = useNavigate();

    return (
        <section className="py-28 bg-[#FAFAFA]">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-px bg-[#A3704C]" />
                            <span className="text-[10px] text-[#A3704C] tracking-[0.25em] uppercase font-medium">
                                Curated Selection
                            </span>
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1A231E] leading-tight">
                            Browse by Cuisine
                        </h2>
                    </div>
                    <Link
                        to="/search"
                        className="mt-4 md:mt-0 flex items-center gap-2 text-xs text-[#A3704C] hover:text-[#8a5c3a] tracking-wider uppercase font-medium group transition-fast"
                    >
                        Explore All
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {cuisines.map((c) => {
                        const Icon = c.icon;
                        return (
                            <button
                                key={c.name}
                                onClick={() => navigate(`/search?cuisine=${c.name}`)}
                                className="group cursor-pointer text-center py-9 bg-white border border-[#D5CFC8]/50 hover:border-[#A3704C]/60 rounded-2xl flex flex-col items-center justify-center gap-4 transition-smooth shadow-gourmet hover:shadow-gourmet-md"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#A3704C]/8 group-hover:bg-[#A3704C]/15 flex items-center justify-center transition-fast">
                                    <Icon
                                        size={22}
                                        strokeWidth={1.2}
                                        className="text-[#A3704C]/60 group-hover:text-[#A3704C] transition-fast"
                                    />
                                </div>
                                <span className="text-[10px] tracking-wider text-[#1A231E]/60 group-hover:text-[#1A231E] uppercase font-medium transition-fast">
                                    {c.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
