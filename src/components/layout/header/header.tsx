"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollCondition = window.scrollY > 20;

                    setIsScrolled((prev) => {
                        if (prev !== scrollCondition) {
                            return scrollCondition;
                        }
                        return prev;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { label: "MENU", href: "/menu" },
        { label: "ABOUT US", href: "/about" },
        { label: "CONTACT", href: "/contact" },
        { label: "QR SCAN", href: "/qr" },
    ];


    // Tốc độ chuyển đổi
    const SPEED = "duration-500";

    // Class tối ưu hóa cho GPU và Transition
    const transitionClass = `transition-all ${SPEED} ease-in-out will-change-[transform,opacity,max-height]`;

    // =========================================================================

    // Component Language Switcher
    const LanguageSwitcher = ({ className }: { className?: string }) => (
        <div className={cn("flex items-center gap-2", className)}>
            <Globe size={16} className={cn("text-[#D5A673] transition-colors", transitionClass, isScrolled && "text-white")} />
            <div className="flex items-center gap-2 tracking-[0.65px] text-[13px]">
                <span className="font-bold text-white cursor-pointer hover:text-[#D5A673] transition-colors">EN</span>
                <span className="opacity-40 text-white">|</span>
                <span className="cursor-pointer text-white hover:text-[#D5A673] transition-colors">FR</span>
            </div>
        </div>
    );

    return (
        <header
            className={cn(
                "fixed top-0 left-0 w-full z-50 text-white transform-gpu shadow-md bg-[#1A3A52]",
                transitionClass,
                isScrolled ? "py-2" : "pt-8 pb-6"
            )}
        >
            <div className="mx-auto max-w-[1280px] px-4 md:px-8 2xl:px-0">

                {/* === TẦNG 1: LOGO & NAV === */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex flex-col group relative z-10">
                        {/* LOGO */}
                        <h1 className={cn(
                            "font-display font-medium text-white leading-none group-hover:text-[#D5A673]",
                            transitionClass,
                            "origin-left transform-gpu",
                            isScrolled ? "text-[28px]" : "text-[40px] md:text-[60px]"
                        )}>
                            Bamee Gasstro
                        </h1>

                        {/* SLOGAN (Ẩn khi cuộn) */}
                        <div className={cn(
                            "flex flex-col items-start overflow-hidden transform-gpu",
                            transitionClass,
                            isScrolled
                                ? "max-h-0 opacity-0 -translate-y-2 mt-0"
                                : "max-h-[60px] opacity-100 translate-y-0 mt-1"
                        )}>
                            <span className="font-body font-semibold text-[12px] md:text-[14px] text-[#D5A673] uppercase tracking-[0.2em] md:tracking-[2.8px] whitespace-nowrap">
                                Vietnamese Eatery
                            </span>
                            <span className="mt-2 font-body font-light italic text-[14px] text-white/70 whitespace-nowrap">
                                Saveurs du Vietnam, esprit convivial
                            </span>
                        </div>
                    </Link>

                    {/* MENU & ACTIONS */}
                    <div className="flex items-center gap-6 md:gap-10">
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "font-body font-medium text-[14px] text-white uppercase tracking-[1.4px] hover:text-[#D5A673]",
                                        transitionClass
                                    )}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Language Switcher (Hiện khi cuộn) */}
                        <div className={cn(
                            "hidden md:block overflow-hidden transform-gpu",
                            transitionClass,
                            isScrolled
                                ? "w-auto opacity-100 translate-x-0"
                                : "w-0 opacity-0 translate-x-4"
                        )}>
                            <LanguageSwitcher />
                        </div>

                        {/* Reserve Button */}
                        <div className="hidden md:block">
                            <Link href="/reservation">
                                <button className={cn(
                                    "bg-[#FFAB2D] text-[#1A3A52] px-8 py-3 rounded-[4px] shadow-sm hover:bg-[#FFAB2D]/90 whitespace-nowrap hover:shadow-md active:scale-95",
                                    transitionClass
                                )}>
                                    <span className="font-body font-bold text-[14px] uppercase tracking-[1.4px]">
                                        Reserve
                                    </span>
                                </button>
                            </Link>
                        </div>

                        <button
                            className="md:hidden text-white hover:text-[#D5A673] transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>
                </div>

                {/* === TẦNG 2 (INFO BAR - Ẩn khi cuộn) === */}
                <div className={cn(
                    "overflow-hidden transform-gpu",
                    transitionClass,
                    isScrolled
                        ? "max-h-0 opacity-0 -translate-y-4 mt-0"
                        : "max-h-[100px] opacity-100 translate-y-0 mt-6"
                )}>
                    <div className="hidden md:block w-full h-[1px] bg-white/10 mb-6" />

                    <div className="hidden md:flex justify-between items-center text-white/80 font-body font-light text-[13px]">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 group cursor-default">
                                <MapPin size={16} className="text-[#D5A673]" />
                                <span className="group-hover:text-white transition-colors">123 Elegance Street, City Center</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Phone size={16} className="text-[#D5A673]" />
                                <span className="group-hover:text-white transition-colors">+1 (555) 888-0123</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 group cursor-default">
                                <Clock size={16} className="text-[#D5A673]" />
                                <span className="group-hover:text-white transition-colors">11:00 AM - 11:00 PM (Mon - Sun)</span>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[60px] w-full h-[calc(100vh-60px)] bg-[#1A3A52]/98 backdrop-blur-xl border-t border-white/10 p-6 md:hidden animate-fade-in shadow-xl z-40 overflow-y-auto pb-20">
                    <nav className="flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-300">
                        {navItems.map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className="text-lg font-medium uppercase tracking-widest text-white border-b border-white/5 pb-2 hover:text-[#D5A673] transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="py-2 border-b border-white/5">
                            <LanguageSwitcher className="justify-start" />
                        </div>
                        <Link href="/reservation" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-[#FFAB2D] text-[#1A3A52] font-bold uppercase mt-2 h-12 hover:bg-[#FFAB2D]/90 active:scale-95 transition-all">
                                RESERVE NOW
                            </Button>
                        </Link>
                        <div className="mt-8 space-y-4 text-white/60 text-sm">
                            <p className="flex gap-3 items-center"><MapPin size={18} className="text-[#D5A673]"/> 123 Elegance Str</p>
                            <p className="flex gap-3 items-center"><Phone size={18} className="text-[#D5A673]"/> +1 (555) 888-0123</p>
                            <p className="flex gap-3 items-center"><Clock size={18} className="text-[#D5A673]"/> 11:00 AM - 11:00 PM</p>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}