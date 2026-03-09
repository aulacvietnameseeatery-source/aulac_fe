"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Menu as MenuIcon, X, MapPin, Phone, Clock,
    QrCode, Home, User, ChevronDown
} from "lucide-react";
import {useState, useTransition, useEffect, useRef} from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/layout/header/nav-link";
import { FR, GB, VN } from 'country-flag-icons/react/3x2';
import { useStoreSettings } from "@/hooks/use-store-settings";
// Import Dropdown Components
import { Dropdown, DropdownContent, DropdownItem } from "@/components/ui/dropdown";
// Import Modal quét QR/Chọn bàn
import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";

interface HeaderProps {
    isScrolled: boolean;
    locale: string;
}

const FLAG_MAP: Record<string, React.ElementType> = {
    fr: FR,
    en: GB,
    vi: VN,
};

export function Header({ isScrolled, locale }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false); // State mở Modal QR

    const { data: storeSettings } = useStoreSettings();

    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Header');
    const router = useRouter();
    const pathname = usePathname();

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

    const navItems = [
        { label: t('home') || "HOME", href: "/", icon: <Home size={18} className="-mt-0.5" /> },
        { label: t('menu') || "MENU", href: "/menu-listing" },
        { label: t('about') || "ABOUT US", href: "/about-us" },
        { label: t('contact') || "CONTACT", href: "/contact" },
    ];

    // Xử lý sau khi chọn bàn xong từ Modal
    const handleTableConfirm = (val: string) => {
        setIsQrModalOpen(false);
        // Lưu vào sessionStorage để đồng bộ với chức năng giỏ hàng
        sessionStorage.setItem("aulac_table_number", val);
        router.push(getLink(`/menu-listing?table=${encodeURIComponent(val)}`));
    };

    const LanguageSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const CurrentFlag = FLAG_MAP[locale];

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelect = (l: string) => {
            setIsOpen(false);
            switchLocale(l);
        };

        return (
            <div className="relative inline-block text-left z-[110]" ref={dropdownRef}>
                {/* Nút bấm (Trigger) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 border border-[#C5A059]/30 rounded-sm hover:bg-[#C5A059]/20 transition-colors",
                        isMobile ? "bg-[#C5A059]/10 px-2 py-1.5" : "px-3 py-1.5 bg-[#152e42]/80 backdrop-blur-sm"
                    )}
                >
                    <CurrentFlag className={cn("rounded-[1px] shadow-sm", isMobile ? "w-5 h-3.5" : "w-6 h-4")} />
                    {!isMobile && (
                        <span className="text-[#C5A059] text-xs font-bold uppercase tracking-wider">
                            {locale}
                        </span>
                    )}
                    <ChevronDown size={14} className={cn("text-[#C5A059] transition-transform duration-200", isOpen && "rotate-180")} />
                </button>

                {/* Hộp Dropdown (Content) */}
                {isOpen && (
                    <div className={cn(
                        "absolute top-full mt-2 bg-[#0A111A] border border-[#C5A059]/40 shadow-xl rounded overflow-hidden flex flex-col min-w-[120px] origin-top-right animate-in fade-in zoom-in-95",
                        isMobile ? "right-0" : "right-0" // Luôn neo về góc phải
                    )}>
                        {['fr', 'en', 'vi'].map(l => {
                            const DropdownFlag = FLAG_MAP[l];
                            return (
                                <button
                                    key={l}
                                    disabled={isPending}
                                    onClick={() => handleSelect(l)}
                                    className={cn(
                                        "px-4 py-3 transition-colors hover:bg-white/10 flex items-center gap-3 w-full text-left",
                                        locale === l && "bg-white/5",
                                        isPending && "opacity-50 cursor-wait"
                                    )}
                                >
                                    <DropdownFlag className="w-6 h-4 rounded-[2px] shadow-sm shrink-0" />
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider",
                                        locale === l ? "text-[#C5A059]" : "text-white/70"
                                    )}>
                                        {l === 'vi' ? 'Tiếng Việt' : l === 'en' ? 'English' : 'Français'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Modal Quét QR / Chọn bàn */}
            <TableSelectionModal
                isOpen={isQrModalOpen}
                onConfirm={handleTableConfirm}
                onClose={() => setIsQrModalOpen(false)}
            />

            <header className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 w-full",
                "max-lg:bg-[#152e42] max-lg:py-3 max-lg:border-b max-lg:border-[#C5A059]/20",
                isScrolled
                    ? "lg:bg-[#152e42]/95 lg:backdrop-blur-md lg:shadow-lg lg:py-2 lg:border-b lg:border-[#C5A059]/20"
                    : "lg:bg-[#152e42] lg:py-4"
            )}>
                <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col transition-all duration-500">

                    <div className="flex items-center justify-between">

                        {/* 1. LOGO */}
                        <Link href={getLink("/")} className="flex items-center gap-4 z-50" onClick={() => setIsMobileMenuOpen(false)}>
                            <Image
                                src="/images/logo.png"
                                alt="An Lac Logo"
                                width={1080}
                                height={1080}
                                className={cn(
                                    "object-contain transition-all duration-500 drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]",
                                    isScrolled ? "w-10 md:w-12 lg:w-14" : "w-12 md:w-14 lg:w-[64px]"
                                )}
                            />
                            <div className="flex flex-col justify-center">
                                <h1 className={cn(
                                    "font-serif text-[#C5A059] font-bold tracking-[0.1em] uppercase transition-all duration-500 leading-none mb-1",
                                    isScrolled ? "text-xl md:text-2xl lg:text-[28px]" : "text-2xl md:text-3xl lg:text-[34px]"
                                )}>
                                    An Lac
                                </h1>
                                <div className="hidden lg:flex items-center gap-2 text-[8px] xl:text-[9px] font-bold tracking-[0.15em] uppercase text-white/70">
                                    <span>VIETNAMESE EATERY</span>
                                </div>
                                <div className="hidden lg:flex items-center gap-2 text-[8px] xl:text-[9px] font-bold tracking-[0.15em] uppercase text-white/70">
                                    <span>SAVEURS DU VIETNAM, ESPRIT CONVIVIAL</span>
                                </div>
                            </div>
                        </Link>

                        {/* 2. MENU GIỮA */}
                        <nav className="hidden lg:flex items-center gap-10 xl:gap-14 absolute left-1/2 -translate-x-1/2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    href={getLink(item.href)}
                                    title={item.label}
                                    className="text-white hover:text-[#C5A059] text-[13px] font-bold tracking-[0.1em] uppercase transition-colors"
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* 3. ACTIONS PHẢI */}
                        <div className="flex items-center gap-4 lg:gap-6 z-50">

                            {/* Dropdown Ngôn ngữ (Mobile ẩn Desktop, Desktop ẩn Mobile) */}
                            <div className="lg:hidden"><LanguageSelector isMobile={true} /></div>
                            <div className="hidden lg:block"><LanguageSelector isMobile={false} /></div>

                            {/* Nút bật Camera QR */}
                            <button
                                onClick={() => setIsQrModalOpen(true)}
                                className="text-[#C5A059] hover:text-[#FDE08B] transition-colors p-1.5 lg:p-2 border border-[#C5A059]/40 rounded hover:bg-[#C5A059]/10"
                                title={t('qr_scan')}
                            >
                                <QrCode size={20} className="lg:w-[22px] lg:h-[22px]" />
                            </button>

                            {/* Nút Desktop */}
                            <div className="hidden lg:flex items-center gap-6 pl-2">
                                <Link href={getLink("/reservation")}>
                                    <button className="bg-[#C5A059] text-[#0f172a] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF6A] transition-colors rounded-sm shadow-md">
                                        RESERVE
                                    </button>
                                </Link>

                                <Link href={getLink("/login")} className="text-white hover:text-[#C5A059] transition-colors" title="Login as Staff">
                                    <User size={20} />
                                </Link>
                            </div>

                            {/* Hamburger Mobile */}
                            <button
                                className="lg:hidden text-white hover:text-[#C5A059] transition-colors ml-1"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                            </button>
                        </div>
                    </div>

                    {/* DÒNG 2: THANH THÔNG TIN DESKTOP */}
                    <div className={cn(
                        "hidden lg:flex items-center justify-between w-full transition-all duration-500 ease-in-out origin-top",
                        isScrolled ? "h-0 opacity-0 overflow-hidden mt-0 pt-0" : "h-[42px] opacity-100 mt-4 pt-4 border-t border-white/10"
                    )}>
                        <div className="flex items-center gap-10 text-white/70">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-[#C5A059]" />
                                <span className="text-[10px] xl:text-[11px] font-medium tracking-[0.15em] uppercase">
                                    {storeSettings?.streetAddress && storeSettings?.city
                                        ? `${storeSettings.streetAddress}, ${storeSettings.city}`.trim()
                                        : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-[#C5A059]" />
                                <span className="text-[10px] xl:text-[11px] font-medium tracking-[0.15em] uppercase">
                                    {storeSettings?.phone || ""}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                            <Clock size={14} className="text-[#C5A059]" />
                            <span className="text-[10px] xl:text-[11px] font-medium tracking-[0.15em] uppercase">
                                {storeSettings?.openingHours || ""}
                            </span>
                        </div>
                    </div>

                </div>

                {/* MOBILE MENU */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 top-[76px] bg-[#152e42] z-[90] flex flex-col px-6 py-8 overflow-y-auto">
                        <nav className="flex flex-col mt-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={getLink(item.href)}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between py-6 border-b border-[#C5A059]/20 group"
                                >
                                    <span className="text-white group-hover:text-[#C5A059] text-xl font-serif uppercase tracking-[0.2em] transition-colors">
                                        {item.label}
                                    </span>
                                    {item.icon ? (
                                        <span className="text-[#C5A059]">{item.icon}</span>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]/40 group-hover:bg-[#C5A059] transition-colors" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-12 flex flex-col gap-4">
                            <Link href={getLink("/reservation")} onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="w-full bg-[#C5A059] text-[#0f172a] py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#D4AF6A] transition-colors rounded-sm shadow-lg">
                                    RESERVE
                                </button>
                            </Link>
                            <Link
                                href={getLink("/login")}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-3 text-white/70 hover:text-[#C5A059] transition-colors py-4 text-xs uppercase tracking-[0.15em] font-medium border border-[#C5A059]/30 rounded-sm bg-[#C5A059]/5"
                            >
                                <User size={18} />
                                <span>LOGIN AS STAFF</span>
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}