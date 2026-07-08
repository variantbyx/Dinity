import { Link } from "react-router-dom";
import { bottomLinks, footerSections, socialLinks } from "../assets/assets";

export default function Footer() {
    return (
        <footer className="w-full bg-[#11161B] text-[#e8e0d5] pt-20 pb-10">
            {/* Top Divider */}
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="divider-gold mb-16" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="block mb-4">
                            <span className="font-display text-2xl text-white font-medium">Dinity</span>
                            <span className="text-[#A3704C] text-xs font-light italic font-display block">
                                Reserve · Experience · Remember
                            </span>
                        </Link>
                        <p className="text-sm text-[#e8e0d5]/50 leading-relaxed pr-4">
                            Connecting discerning palates with the world's most exceptional culinary experiences.
                        </p>
                    </div>

                    {/* Dynamic Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-4">
                            <h4 className="text-[10px] font-semibold tracking-[0.2em] text-[#A3704C] uppercase">
                                {section.title}
                            </h4>
                            {section.links.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    className="text-sm text-[#e8e0d5]/50 hover:text-[#A3704C] transition-fast"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}

                    {/* Contact */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-semibold tracking-[0.2em] text-[#A3704C] uppercase">Contact</h4>
                        <p className="text-sm text-[#e8e0d5]/50">support@dinity.com</p>
                        <div className="flex gap-3 mt-1">
                            {socialLinks.map(({ icon: Icon, href }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    className="w-9 h-9 rounded-full border border-[#A3704C]/25 flex items-center justify-center text-[#e8e0d5]/40 hover:text-[#A3704C] hover:border-[#A3704C]/60 transition-fast"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-6 border-t border-[#A3704C]/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#e8e0d5]/30">
                        © 2026 Dinity. Curated dining, elevated.
                    </p>
                    <div className="flex gap-6">
                        {bottomLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.path}
                                className="text-xs text-[#e8e0d5]/30 hover:text-[#A3704C] transition-fast"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
