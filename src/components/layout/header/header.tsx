"use client";

import Link from "next/link";
import { Menu as MenuIcon, X, MapPin, Phone, Clock, Globe } from "lucide-react";
import { useState, useTransition } from "react"; // Thêm useTransition để mượt mà hơn
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface HeaderProps {
    isScrolled: boolean;
    locale: string;
}

export function Header({ isScrolled, locale }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPending, startTransition] = useTransition(); // Dùng để quản lý trạng thái pending khi đổi ngôn ngữ
    const t = useTranslations('Header');
    const router = useRouter();
    const pathname = usePathname();

    // Logic đổi ngôn ngữ
    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return; // Nếu chọn trùng ngôn ngữ hiện tại thì không làm gì

        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);

        startTransition(() => {
            // 1. Điều hướng sang URL mới
            router.replace(newPath);
            // 2. QUAN TRỌNG: Buộc Next.js tải lại dữ liệu từ server (giống F5) để cập nhật bản dịch
            router.refresh();
        });
    };

    // Hàm tạo link giữ nguyên ngôn ngữ hiện tại
    const getLink = (path: string) => `/${locale}${path}`;

    const navItems = [
        { label: t('menu'), href: "/menu-listing" },
        { label: t('about'), href: "/about-us" },
        { label: t('contact'), href: "/contact" },
        { label: t('qr_scan'), href: "/qr-scan" },
    ];

    const LanguageSwitcher = ({ className }: { className?: string }) => (
        <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
            <Globe size={16} className="text-[#D5A673]" />
            <div className="flex items-center gap-2 text-[13px] tracking-wide font-bold">
                <button
                    onClick={() => switchLocale('en')}
                    disabled={isPending} // Disable khi đang load
                    className={cn(
                        "cursor-pointer hover:text-[#D5A673] transition-colors",
                        locale === 'en' ? "text-[#D5A673]" : "text-white/70",
                        isPending && "opacity-50 cursor-wait" // Hiệu ứng mờ khi đang chuyển
                    )}
                >
                    EN
                </button>
                <span className="opacity-40 text-white">|</span>
                <button
                    onClick={() => switchLocale('fr')}
                    disabled={isPending} // Disable khi đang load
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
                        isScrolled ? "translate-y-0" : "translate-y-[10px]"
                    )}
                >
                    {/* LOGO */}
                    <Link href={getLink("/")} className="flex flex-col group relative z-10">
                        <h1
                            className={cn(
                                "font-display font-medium leading-none transition-all duration-300 origin-left",
                                isScrolled ? "text-[26px]" : "text-[48px] md:text-[60px]"
                            )}
                        >
                            Bamee Gasstro
                        </h1>

                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-300",
                                isScrolled
                                    ? "max-h-0 opacity-0 mt-0"
                                    : "max-h-[60px] opacity-100 mt-1"
                            )}
                        >
                            {/* Chỗ này dùng t.rich nếu trong json có <br> </br> */}
                            <span className="block text-[#D5A673] text-[12px] md:text-[14px] tracking-[0.25em] uppercase font-semibold">
                                {t('slogan_1')}
                            </span>
                            <span className="block mt-2 text-[14px] italic text-white/70">
                                {t('slogan_2')}
                            </span>
                        </div>
                    </Link>

                    {/* NAV + ACTIONS */}
                    <div className="flex items-center gap-6 md:gap-10">
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={getLink(item.href)}
                                    className="text-[14px] uppercase tracking-[1.4px] hover:text-[#D5A673] transition-colors font-medium"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className={cn(
                            "hidden md:block overflow-hidden transition-all duration-300 ease-in-out",
                            isScrolled
                                ? "max-w-[100px] opacity-100 ml-4"
                                : "max-w-0 opacity-0 ml-0"
                        )}>
                            <LanguageSwitcher />
                        </div>

                        {/* RESERVE BUTTON */}
                        <div className="hidden md:block">
                            <Link href={getLink("/reservation")}>
                                <button className={cn(
                                    "bg-[#FFAB2D] text-[#1A3A52] rounded shadow-sm hover:bg-[#FFAB2D]/90 transition-all duration-300",
                                    isScrolled ? "px-6 py-2" : "px-8 py-3"
                                )}>
                                    <span className="font-bold text-[14px] uppercase tracking-wide">
                                        {t('reserve')}
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

                {/* ===== INFO BAR ===== */}
                <div
                    className={cn(
                        "overflow-hidden border-t border-white/10 transition-all duration-300 ease-in-out",
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
                                href={getLink(item.href)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg uppercase tracking-widest border-b border-white/10 pb-2 text-white"
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