"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Menu as MenuIcon, X, MapPin, Phone, Clock, Globe,
    QrCode, Home, User
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/layout/header/nav-link";
import { useIsMobile } from "@/hooks/header/useIsMobile";

// Lưu ý: Đảm bảo file header.css đã được import (thông qua globals.css hoặc import trực tiếp tại đây nếu cấu hình cho phép)

interface HeaderProps {
    isScrolled: boolean;
    locale: string;
}

export function Header({ isScrolled, locale }: HeaderProps) {
    const isMobile = useIsMobile();

    const effectiveScrolled = isMobile ? true : isScrolled;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Header');
    const router = useRouter();
    const pathname = usePathname();

    // Khóa cuộn trang khi mở menu mobile
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        startTransition(() => {
            router.replace(newPath);
            router.refresh();
        });
    };

    const getLink = (path: string) => `/${locale}${path}`;

    // Nav Items: Có Home và QR Icon
    const navItems = [
        { label: t('home') || "Home", href: "/", icon: <Home size={18} className="-mt-0.5" /> },
        { label: t('menu'), href: "/menu-listing" },
        { label: t('about'), href: "/about-us" },
        { label: t('contact'), href: "/contact" },
        { label: "", href: "/qr-scan", icon: <QrCode size={24} />, isIconOnly: true },
    ];

    const LanguageSwitcher = ({ className, isMobile = false }: { className?: string, isMobile?: boolean }) => (
        <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
            {!isMobile && <Globe size={16} className="text-[#D5A673]" />}
            <div className={cn("flex items-center gap-2 tracking-wide font-bold", isMobile ? "text-[16px]" : "text-[13px]")}>
                <button
                    onClick={() => switchLocale('en')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer hover:text-[#D5A673] transition-colors p-2",
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
                        "cursor-pointer hover:text-[#D5A673] transition-colors p-2",
                        locale === 'fr' ? "text-[#D5A673]" : "text-white/70",
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    FR
                </button>
                <span className="opacity-40 text-white">|</span>
                <button
                    onClick={() => switchLocale('vi')}
                    disabled={isPending}
                    className={cn(
                        "cursor-pointer hover:text-[#D5A673] transition-colors p-2",
                        locale === 'vi' ? "text-[#D5A673]" : "text-white/70",
                        isPending && "opacity-50 cursor-wait"
                    )}
                >
                    VI
                </button>
            </div>
        </div>
    );

    return (
        <header className={cn("header-container",
            isMobileMenuOpen ? "is-mobile-open" : (effectiveScrolled ? "is-scrolled" : "is-default")
        )}>
            <div className="header-inner">

                {/* ===== TOP BAR ===== */}
                <div className={cn("top-bar", effectiveScrolled ? "is-scrolled" : "is-default")}>

                    {/* LOGO */}
                    {/* 👇 ĐÃ SỬA: Xóa class 'group' ở đây */}
                    <Link href={getLink("/")} className={cn("logo-wrapper", effectiveScrolled ? "is-scrolled" : "is-default")} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center">
                            <Image
                                src="/images/logo.png"
                                alt="An Lac Logo"
                                width={1080}
                                height={1080}
                                className={cn(
                                    "object-contain transition-all duration-300",
                                    effectiveScrolled ? "w-12 md:w-12 lg:w-14 xl:w-15" : "w-15 md:w-16 lg:w-18 xl:w-21"
                                )}
                            />
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <h1 className={cn("logo-title", effectiveScrolled ? "is-scrolled" : "is-default")}>
                                        An Lac
                                    </h1>

                                </div>
                                <div className={cn("logo-slogan-wrapper", effectiveScrolled ? "is-scrolled" : "is-default")}>
                                    <span className="slogan-main">{t('slogan_1')}</span>
                                    <span className="slogan-sub">{t('slogan_2')}</span>
                                </div>
                            </div>

                        </div>
                    </Link>
                    {/* Desktop Nav */}

                    <nav className="nav-desktop">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                href={getLink(item.href)}
                                title={item.isIconOnly ? t('qr_scan') : item.label}
                                className={cn("nav-link-desktop", item.isIconOnly && "text-[#D5A673]")}
                            >
                                {item.icon && <span>{item.icon}</span>}
                                {!item.isIconOnly && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>
                    {/* ACTIONS */}
                    <div className="flex items-center gap-1 md:gap-2 lg:gap-4 xl:gap-6">


                        {/* Lang Switcher */}
                        <div className={cn("lang-switcher-wrapper", effectiveScrolled ? "is-scrolled" : "is-default")}>
                            <LanguageSwitcher />
                        </div>
                        {/* Reserve Button */}
                        <div className="hidden md:block">
                            <Link href={getLink("/reservation")}>
                                <button className={cn("reserve-btn", effectiveScrolled ? "is-scrolled" : "is-default")}>
                                    {t('reserve')}
                                </button>
                            </Link>
                        </div>

                        {/* Staff Login (Desktop) */}
                        <div className="hidden lg:block">
                            <Link href={getLink("/login")} className="text-white/80 hover:text-[#D5A673] transition-colors" title="Login as Staff">
                                <User className="w-5 h-5 xl:w-6 xl:h-6" />
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="mobile-toggle-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={32} /> : <MenuIcon size={32} />}
                        </button>
                    </div>
                </div>

                {/* ===== INFO BAR ===== */}
                <div className={cn("info-bar", effectiveScrolled ? "is-scrolled" : "is-default")}>
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

            {/* ===== MOBILE MENU OVERLAY ===== */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay">
                    <div className="mobile-menu-inner">
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <span className="text-[20px] font-display font-medium text-white">An Lac</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-white/80 hover:text-[#D5A673] transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex flex-col gap-2 mt-8">
                            {navItems.map((item, index) => (
                                <Link
                                    key={item.href}
                                    href={getLink(item.href)}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mobile-nav-link animate-in slide-in-from-bottom-2 fade-in duration-500"
                                    style={{ animationDelay: `${100 + index * 50}ms`, animationFillMode: 'both' }}
                                >
                                    <span>{item.isIconOnly ? t('qr_scan') : item.label}</span>
                                    {item.icon ? (
                                        <span className="text-[#D5A673]">{item.icon}</span>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Reserve */}
                        <div className="mt-8 px-2">
                            <Link href={getLink("/reservation")} onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="mobile-reserve-btn">
                                    {t('reserve')}
                                </button>
                            </Link>
                        </div>

                        {/* Staff Login */}
                        <div className="mt-4 px-2">
                            <Link
                                href={getLink("/login")}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 text-white/60 hover:text-[#D5A673] transition-colors py-3 text-sm uppercase tracking-widest font-medium"
                            >
                                <User size={18} />
                                <span>Login as Staff</span>
                            </Link>
                        </div>

                        {/* Contact Info */}
                        <div className="mobile-info-section">
                            <div className="flex items-center gap-4 text-white/80">
                                <MapPin size={20} className="text-[#D5A673]" />
                                <span className="text-sm">123 Elegance Street, City Center</span>
                            </div>
                            <div className="flex items-center gap-4 text-white/80">
                                <Phone size={20} className="text-[#D5A673]" />
                                <span className="text-sm">+1 (555) 888-0123</span>
                            </div>
                            <div className="flex items-center gap-4 text-white/80">
                                <Clock size={20} className="text-[#D5A673]" />
                                <span className="text-sm">11:00 AM – 11:00 PM</span>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="mobile-lang-section">
                            <LanguageSwitcher isMobile={true} />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}