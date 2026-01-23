"use client";

import Link from "next/link";
import { Menu as MenuIcon, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";

interface HeaderProps {
    isScrolled: boolean;
}

export function Header({ isScrolled }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { label: "MENU", href: "/menu" },
        { label: "ABOUT US", href: "/about" },
        { label: "CONTACT", href: "/contact" },
        { label: "QR SCAN", href: "/qr" },
    ];

    const LanguageSwitcher = ({ className }: { className?: string }) => (
        <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
            <Globe size={16} className="text-[#D5A673]" />
            <div className="flex items-center gap-2 text-[13px] tracking-wide">
                <span className="font-bold cursor-pointer hover:text-[#D5A673]">EN</span>
                <span className="opacity-40">|</span>
                <span className="cursor-pointer hover:text-[#D5A673]">FR</span>
            </div>
        </div>
    );

    return (
        <header
            className={cn(
                "fixed top-0 left-0 w-full z-50 bg-[#1A3A52] text-white shadow-md",
                "transition-[height] duration-300 ease-in-out overflow-hidden",
                isScrolled ? "h-[80px]" : "h-[270px]"
            )}
        >
            <div className="mx-auto max-w-[1280px] px-4 md:px-8 h-full flex flex-col justify-center">

                {/* ===== TOP BAR (LOGO + NAV) ===== */}
                <div
                    className={cn(
                        "flex items-center justify-between transition-all duration-300 ease-in-out",
                        // Đẩy nhẹ lên khi cuộn để cân đối
                        isScrolled ? "translate-y-0" : "translate-y-[10px]"
                    )}
                >
                    {/* LOGO */}
                    <Link href="/" className="flex flex-col group relative z-10">
                        <h1
                            className={cn(
                                "font-display font-medium leading-none transition-all duration-300 origin-left",
                                isScrolled ? "text-[26px]" : "text-[48px] md:text-[60px]"
                            )}
                        >
                            Bamee Gasstro
                        </h1>

                        {/* SLOGAN (Ẩn khi cuộn) */}
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-300",
                                isScrolled
                                    ? "max-h-0 opacity-0 mt-0"
                                    : "max-h-[60px] opacity-100 mt-1"
                            )}
                        >
                            <span className="block text-[#D5A673] text-[12px] md:text-[14px] tracking-[0.25em] uppercase font-semibold">
                                Vietnamese Eatery
                            </span>
                            <span className="block mt-2 text-[14px] italic text-white/70">
                                Saveurs du Vietnam, esprit convivial
                            </span>
                        </div>
                    </Link>

                    {/* NAV + ACTIONS */}
                    <div className="flex items-center gap-6 md:gap-10">
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    href={item.href}
                                    className="text-[14px] uppercase tracking-[1.4px] hover:text-[#D5A673]"
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* 👇 NÚT NGÔN NGỮ Ở TOP BAR
                            Logic: Khi Header TO (chưa cuộn) -> Ẩn đi (w-0).
                                   Khi Header NHỎ (đã cuộn) -> Hiện ra (w-auto).
                        */}
                        <div className={cn(
                            "hidden md:block overflow-hidden transition-all duration-300 ease-in-out",
                            isScrolled
                                ? "max-w-[100px] opacity-100 ml-4" // Hiện ra, đẩy lùi nút Reserve
                                : "max-w-0 opacity-0 ml-0"         // Thu lại bằng 0
                        )}>
                            <LanguageSwitcher />
                        </div>

                        {/* RESERVE BUTTON */}
                        <div className="hidden md:block">
                            <Link href="/reservation">
                                <button className={cn(
                                    "bg-[#FFAB2D] text-[#1A3A52] rounded shadow-sm hover:bg-[#FFAB2D]/90 transition-all duration-300",
                                    // Co nhỏ nút bấm một chút cho tinh tế khi header nhỏ
                                    isScrolled ? "px-6 py-2" : "px-8 py-3"
                                )}>
                                    <span className="font-bold text-[14px] uppercase tracking-wide">
                                        Reserve
                                    </span>
                                </button>
                            </Link>
                        </div>

                        <button
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>
                </div>

                {/* ===== INFO BAR (ADDRESS + HOURS + LANG) ===== */}
                <div
                    className={cn(
                        "overflow-hidden border-t border-white/10 transition-all duration-300 ease-in-out",
                        // Khi cuộn: Thanh này biến mất -> Nút Lang ở trên hiện ra thay thế
                        isScrolled
                            ? "max-h-0 opacity-0 mt-0 pt-0 border-none"
                            : "max-h-[80px] opacity-100 mt-6 pt-4"
                    )}
                >
                    <div className="hidden md:flex justify-between items-center text-[13px] text-white/80">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-[#D5A673]" />
                                <span>123 Elegance Street, City Center</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-[#D5A673]" />
                                <span>+1 (555) 888-0123</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-[#D5A673]" />
                                <span>11:00 AM – 11:00 PM</span>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE MENU ===== */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[80px] bg-[#1A3A52]/95 backdrop-blur-xl p-6 md:hidden z-40">
                    <nav className="flex flex-col gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg uppercase tracking-widest border-b border-white/10 pb-2"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}