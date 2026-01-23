import Link from "next/link";
import { Facebook, Instagram, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Footer() {
    return (
        <footer className="w-full bg-[#193752] border-t border-white/5 pt-[94px] pb-[48px]">
            <div className="container mx-auto px-4 md:px-0 max-w-[1440px]">

                {/* === MAIN CONTENT*/}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-[96px] md:px-[240px]">

                    {/* CỘT 1: BRAND & GIỚI THIỆU */}
                    <div className="flex flex-col gap-[28px] max-w-[320px]">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-11">
                                <div className="absolute left-[1.5px] top-[5.5px] w-[33px] h-[31.5px] bg-[#C9A961]" />
                            </div>
                            <span className="font-display font-bold text-[24px] leading-8 tracking-[4.8px] text-white uppercase">
                Au Lac
              </span>
                        </div>
                        {/* Description */}
                        <p className="font-display text-[14px] leading-[22.75px] text-white/60">
                            Defined by excellence, driven by heritage.
                            <br />
                            The pinnacle of Vietnamese culinary art in
                            <br />
                            the heart of the city.
                        </p>
                    </div>

                    {/* CỘT 2: RESERVATIONS */}
                    <div className="flex flex-col gap-6 min-w-[200px]">
                        <h4 className="font-display font-bold text-[12px] leading-4 tracking-[1.2px] text-[#C9A961] uppercase">
                            Reservations
                        </h4>
                        <div className="flex flex-col gap-2">
                            <p className="font-display text-[18px] leading-7 text-white/90">
                                +1 (555) 892 0122
                            </p>
                            <p className="font-display text-[18px] leading-7 text-white/90">
                                concierge@aulac.art
                            </p>
                        </div>
                        {/* Social Icons */}
                        <div className="flex gap-4 mt-2">
                            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#C9A961] transition-colors cursor-pointer group">
                                <Facebook size={20} className="text-white/60 group-hover:text-[#C9A961]" />
                            </div>
                            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#C9A961] transition-colors cursor-pointer group">
                                <Instagram size={20} className="text-white/60 group-hover:text-[#C9A961]" />
                            </div>
                        </div>
                    </div>

                    {/* CỘT 3: LOCATION */}
                    <div className="flex flex-col gap-6 min-w-[200px]">
                        <h4 className="font-display font-bold text-[12px] leading-4 tracking-[1.2px] text-[#C9A961] uppercase">
                            Location
                        </h4>
                        <p className="font-display text-[18px] leading-[29.25px] text-white/90">
                            128 Heritage Street,
                            <br />
                            District 1, Ho Chi Minh City
                        </p>
                        <Link
                            href="https://maps.google.com"
                            target="_blank"
                            className="font-display font-bold text-[14px] leading-5 tracking-[1.4px] text-[#C9A961] uppercase border-b border-gray-700 pb-1 hover:text-white transition-colors w-fit"
                        >
                            Open in Maps
                        </Link>
                    </div>

                    {/* CỘT 4: NEWSLETTER */}
                    <div className="flex flex-col gap-6 max-w-[288px]">
                        <div className="flex flex-col gap-8">
                            <h4 className="font-display font-bold text-[12px] leading-4 tracking-[1.2px] text-[#C9A961] uppercase">
                                Newsletter
                            </h4>
                            <p className="font-display text-[14px] leading-5 text-white/60">
                                Join our circle for exclusive events and
                                <br />
                                seasonal masterpiece previews.
                            </p>
                        </div>
                        {/* Input Field */}
                        <div className="flex items-center border-b border-white/20 pb-2">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 text-sm w-full font-display"
                            />
                            <button className="text-[#C9A961] hover:text-white transition-colors">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* === BOTTOM BAR (COPYRIGHT) === */}
                <div className="mt-[80px] border-t border-white/5 pt-[48px] md:px-[240px] flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">

                    <p className="font-display font-bold text-[10px] leading-[15px] tracking-[2px] text-white/30 uppercase">
                        © 2024 Au Lac Vietnamese Eatery. All Rights Reserved.
                    </p>

                    <div className="flex gap-8">
                        <Link href="#" className="font-display font-bold text-[10px] leading-[15px] tracking-[2px] text-white/30 uppercase hover:text-[#C9A961] transition-colors">
                            Privacy
                        </Link>
                        <Link href="#" className="font-display font-bold text-[10px] leading-[15px] tracking-[2px] text-white/30 uppercase hover:text-[#C9A961] transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="font-display font-bold text-[10px] leading-[15px] tracking-[2px] text-white/30 uppercase hover:text-[#C9A961] transition-colors">
                            Sitemap
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}