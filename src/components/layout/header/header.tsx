"use client";

import Link from "next/link";
import {
    Menu as MenuIcon, X, MapPin, Phone, Clock, Globe,
    QrCode, Home
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/layout/header/nav-link"; // Đảm bảo đường dẫn import đúng

interface HeaderProps {
    isScrolled: boolean;
    locale: string;
}

export function Header({ isScrolled, locale }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Header');
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        startTransition(() => {
            router.replace(newPath);
            router.refresh();
        });
    };

    const getLink = (path: string) => `/${locale}${path}`;

    const navItems = [
        { label: t('home') || "Home", href: "/", icon: <Home size={16} className="-mt-0.5"/> },
        { label: t('menu'), href: "/menu-listing" },
        { label: t('about'), href: "/about-us" },
        { label: t('contact'), href: "/contact" },
        { label: "", href: "/qr-scan", icon: <QrCode size={24} />, isIconOnly: true },
    ];

    const LanguageSwitcher = ({ className }: { className?: string }) => (
        <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
            <Globe size={16} className="text-[#D5A673]" />
            <div className="flex items-center gap-2 text-[13px] tracking-wide font-bold">
                <button
                    onClick={() => switchLocale('en')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer hover:text-[#D5A673] transition-colors",
                        locale === 'en' ? "text-[#D5A673]" : "text-white/70",
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    EN
                </button>
                <span className="opacity-40 text-white">|</span>
                <button
                    onClick={() => switchLocale('fr')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer hover:text-[#D5A673] transition-colors",
                        locale === 'fr' ? "text-[#D5A673]" : "text-white/70",
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    FR
                </button>
            </div>
        </div>
    );

    return (
        <header className={cn("header-container", isScrolled ? "h-[80px]" : "h-[270px]")}>
            <div className="header-inner">

                {/* ===== TOP BAR ===== */}
                <div className={cn("top-bar", isScrolled ? "translate-y-0" : "translate-y-[10px]")}>

                    {/* LOGO: Đã đổi tên An Lac */}
                    {/* 👇 ĐÃ SỬA: Thêm class "group" vào đây */}
                    <Link href={getLink("/")} className="logo-wrapper group">
                        <h1 className={cn("logo-title", isScrolled ? "text-[28px]" : "text-[56px] md:text-[64px]")}>
                            An Lac
                        </h1>
                        <div className={cn("logo-slogan-wrapper",
                            isScrolled ? "max-h-0 opacity-0 mt-0" : "max-h-[60px] opacity-100 mt-2"
                        )}>
                            <span className="slogan-main">{t('slogan_1')}</span>
                            <span className="slogan-sub">{t('slogan_2')}</span>
                        </div>
                    </Link>

                    {/* NAV & ACTIONS */}
                    <div className="flex items-center gap-6 md:gap-10">
                        {/* Desktop Nav sử dụng NavLink Component */}
                        <nav className="nav-desktop">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    href={getLink(item.href)}
                                    title={item.isIconOnly ? t('qr_scan') : item.label}
                                    className={cn("flex items-center gap-2 uppercase tracking-[1.4px]", item.isIconOnly && "text-[#D5A673]")}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    {!item.isIconOnly && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Lang Switcher */}
                        <div className={cn("lang-switcher-wrapper",
                            isScrolled ? "max-w-[100px] opacity-100 ml-4" : "max-w-0 opacity-0 ml-0"
                        )}>
                            <LanguageSwitcher />
                        </div>

                        {/* Reserve Button */}
                        <div className="hidden md:block">
                            <Link href={getLink("/reservation")}>
                                <button className={cn("reserve-btn", isScrolled ? "px-6 py-2 text-[13px]" : "px-8 py-3 text-[14px]")}>
                                    {t('reserve')}
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button className="mobile-toggle-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>
                </div>

                {/* ===== INFO BAR ===== */}
                <div className={cn("info-bar",
                    isScrolled ? "max-h-0 opacity-0 mt-0 pt-0 border-none" : "max-h-[80px] opacity-100 mt-8 pt-4"
                )}>
                    <div className="info-content">
                        <div className="flex items-center gap-8">
                            <div className="info-item">
                                <MapPin size={16} className="info-icon" />
                                <span>123 Elegance Street, City Center</span>
                            </div>
                            <div className="info-item">
                                <Phone size={16} className="info-icon" />
                                <span>+1 (555) 888-0123</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="info-item">
                                <Clock size={16} className="info-icon" />
                                <span>11:00 AM – 11:00 PM</span>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay">
                    <nav className="flex flex-col gap-4 mt-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={getLink(item.href)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mobile-nav-link"
                            >
                                {item.icon && <span className="text-[#D5A673]">{item.icon}</span>}
                                <span>{item.isIconOnly ? t('qr_scan') : item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}