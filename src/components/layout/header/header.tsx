"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { label: "MENU", href: "/menu" },
        { label: "ABOUT US", href: "/about" },
        { label: "CONTACT", href: "/contact" },
        { label: "QR SCAN", href: "/qr" },
    ];

    return (
        <header
            className={cn(
                "w-full transition-all duration-300 z-50 text-white",
                isScrolled
                    ? "fixed top-0 left-0 bg-[#1A3A52]/95 backdrop-blur-md shadow-lg py-2"
                    : "relative bg-[#1A3A52] pt-10 pb-6"
            )}
        >
            <div className="container mx-auto px-4 md:px-8 max-w-[1280px]"> {/* Max width 1280 */}

                {/* === TẦNG 1: LOGO & NAV CHÍNH === */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">

                    {/* LEFT: BRANDING BLOCK */}
                    <Link href="/" className="flex flex-col items-center md:items-start group">
                        {/* 1. Tên thương hiệu (Size 60px - Playfair Display) */}
                        <h1 className="font-display font-medium text-[40px] md:text-[60px] leading-none md:leading-[60px] text-white transition-colors group-hover:text-[#D5A673]">
                            Au Lac
                        </h1>

                        {/* 2. Subtitle (Size 14px - Gold - Tracking 2.8) */}
                        <span className="mt-1 font-body font-semibold text-[12px] md:text-[14px] text-[#D5A673] uppercase tracking-[0.2em] md:tracking-[2.8px]">
              Vietnamese Eatery
            </span>

                        {/* 3. Slogan (Size 14px - Italic - Opacity 70%) */}
                        <span className="mt-3 font-body font-light italic text-[14px] text-white/70">
              Saveurs du Vietnam, esprit convivial
            </span>
                    </Link>

                    {/* RIGHT: NAVIGATION & ACTION */}
                    <div className="flex items-center gap-10">
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    href={item.href}
                                    className="font-body font-medium text-[14px] text-white uppercase tracking-[1.4px] hover:text-[#D5A673]"
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Reserve Button (Màu Cam #FFAB2D - Text Navy #1A3A52) */}
                        <Link href="/reservation" className="hidden md:block">
                            <button className="bg-[#FFAB2D] text-[#1A3A52] px-10 py-3 rounded-[4px] shadow-sm hover:bg-[#FFAB2D]/90 transition-all">
                <span className="font-body font-bold text-[14px] uppercase tracking-[1.4px]">
                  Reserve
                </span>
                            </button>
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>
                </div>

                {/* === DIVIDER (Đường kẻ mờ) === */}
                <div className="hidden md:block w-full h-[1px] bg-white/10 my-6" />

                {/* === TẦNG 2: INFO BAR (Địa chỉ, SĐT, Giờ) === */}
                <div className="hidden md:flex justify-between items-center text-white/80 font-body font-light text-[13px]">

                    {/* LEFT: CONTACT INFO */}
                    <div className="flex items-center gap-8">
                        {/* Address */}
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#D5A673]" />
                            <span>123 Elegance Street, City Center</span>
                        </div>
                        {/* Phone */}
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-[#D5A673]" />
                            <span>+1 (555) 888-0123</span>
                        </div>
                    </div>

                    {/* RIGHT: HOURS & LANGUAGE */}
                    <div className="flex items-center gap-8">
                        {/* Hours */}
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#D5A673]" />
                            <span>11:00 AM - 11:00 PM (Mon - Sun)</span>
                        </div>

                        {/* Language Switcher */}
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-[#D5A673]" />
                            <div className="flex items-center gap-2 tracking-[0.65px]">
                                <span className="font-bold text-white cursor-pointer">EN</span>
                                <span className="opacity-40">|</span>
                                <span className="cursor-pointer hover:text-white transition-colors">FR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MOBILE MENU OVERLAY
             todo chỗ này tự sửa nha Tuấn*/}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-[#1A3A52] border-t border-white/10 p-6 md:hidden animate-fade-in shadow-xl z-50">
                    <nav className="flex flex-col gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-medium uppercase tracking-widest text-white border-b border-white/5 pb-2"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/reservation" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-[#FFAB2D] text-[#1A3A52] font-bold uppercase mt-2">
                                RESERVE NOW
                            </Button>
                        </Link>

                        {/* Info Mobile */}
                        <div className="mt-4 space-y-3 text-white/60 text-sm">
                            <p className="flex gap-2"><MapPin size={16}/> 123 Elegance Str</p>
                            <p className="flex gap-2"><Phone size={16}/> +1 (555) 888-0123</p>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}