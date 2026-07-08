export default function Loader({ text }: { text: string }) {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center gap-5">
            {/* Animated walnut ring */}
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-[#A3704C]/15" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#A3704C] animate-spin" />
                <div className="absolute inset-2 rounded-full border border-[#A3704C]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[#A3704C] text-xs font-medium">D</span>
                </div>
            </div>
            <p className="font-display text-xs tracking-[0.25em] text-[#1A231E]/40 uppercase italic">
                {text}
            </p>
        </div>
    );
}
