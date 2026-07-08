import toast from "react-hot-toast";

export default function NewsletterCTA() {
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Welcome to the Culinary Inner Circle!", {
            style: {
                background: "#1A231E",
                color: "#fff",
                border: "1px solid rgba(163,112,76,0.3)",
            },
        });
    };

    return (
        <section className="relative py-28 bg-[#1A231E] overflow-hidden text-center">
            {/* Gold texture lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "repeating-linear-gradient(45deg, #A3704C 0px, #A3704C 1px, transparent 1px, transparent 40px)",
            }} />

            <div className="relative z-10 max-w-2xl mx-auto px-6">
                <div className="flex items-center justify-center gap-3 mb-5">
                    <div className="h-px w-8 bg-[#A3704C]/50" />
                    <span className="text-[10px] text-[#A3704C] tracking-[0.3em] uppercase font-medium">Culinary Inner Circle</span>
                    <div className="h-px w-8 bg-[#A3704C]/50" />
                </div>

                <h2 className="font-display text-3xl md:text-4xl text-white mb-4 leading-snug">
                    Join the <span className="italic text-[#C9A96E]">Inner Circle</span>
                </h2>
                <p className="text-sm text-[#e8e0d5]/40 mb-10 leading-relaxed">
                    Be the first to receive exclusive invitations to new openings, seasonal tasting menus, and chef-curated experiences.
                </p>

                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        className="flex-1 bg-white/5 border border-[#A3704C]/25 focus:border-[#A3704C] text-white text-sm py-3.5 px-5 outline-none rounded-xl placeholder:text-white/25 transition-fast"
                        placeholder="your@email.com"
                        type="email"
                        required
                    />
                    <button
                        type="submit"
                        className="btn-press bg-[#A3704C] hover:bg-[#8a5c3a] text-white transition-fast text-xs font-semibold tracking-widest uppercase py-3.5 px-7 rounded-xl cursor-pointer shadow-gold"
                    >
                        Subscribe
                    </button>
                </form>

                <p className="text-xs text-[#e8e0d5]/20 mt-5">
                    No spam. Unsubscribe at any time. Membership is complimentary.
                </p>
            </div>
        </section>
    );
}
