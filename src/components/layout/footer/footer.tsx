"use client";

import { Link } from "@/routing"
import { Facebook, Instagram, Music2 as Tiktok, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { BackToTop } from "@/components/ui/back-to-top";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface FooterProps {
    locale?: string;
}

export function Footer({ locale = "en" }: FooterProps) {
    const t = useTranslations('Footer');
    const { data: storeSettings } = useStoreSettings();

    return (
        <footer className="footer-wrapper relative">
            <div className="footer-inner">

                {/* === MAIN CONTENT (GRID LAYOUT) === */}
                <div className="footer-main-grid">

                    {/* CỘT 1: BRAND (Full width mobile) */}
                    <div className="footer-brand-col flex flex-col gap-[20px] md:gap-[28px]">
                        <div className="flex items-center gap-3">
                            <Image
                                src={storeSettings?.logoUrl || "/images/logo.png"}
                                alt="An Lac Logo"
                                width={80}
                                height={80}
                                className={cn(
                                    "object-contain transition-all duration-500 drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]"
                                )}
                            />
                            <span className="footer-brand-title">
                                {storeSettings?.name || ""}
                            </span>
                        </div>
                        <p className="footer-text max-w-[300px]">
                            {t.rich('description', { br: () => <br /> })}
                        </p>
                    </div>

                    {/* CỘT 2: RESERVATIONS (Cột trái trên mobile) */}
                    <div className="footer-res-col flex flex-col gap-4">
                        <h4 className="footer-heading">{t('reservations')}</h4>
                        <div className="flex flex-col gap-0.5">
                            <p className="footer-link">{storeSettings?.phone || ""}</p>
                            <p className="footer-link break-words">{storeSettings?.email || ""}</p>
                        </div>
                        <div className="flex gap-3 mt-1">
                            {storeSettings?.facebookLink && (
                                <Link href={storeSettings.facebookLink} target="_blank" className="social-btn group">
                                    <Facebook size={18} className="social-icon" />
                                </Link>
                            )}
                            {storeSettings?.instagramLink && (
                                <Link href={storeSettings.instagramLink} target="_blank" className="social-btn group">
                                    <Instagram size={18} className="social-icon" />
                                </Link>
                            )}
                            {storeSettings?.tiktokLink && (
                                <Link href={storeSettings.tiktokLink} target="_blank" className="social-btn group">
                                    <Tiktok size={18} className="social-icon" />
                                </Link>
                            )}
                            {storeSettings?.promoVideoUrl && (
                                <Link
                                    href={storeSettings.promoVideoUrl}
                                    target="_blank"
                                    className="px-4 py-1.5 rounded-full border border-primary/30 text-[10px] uppercase font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2 h-[34px]"
                                >
                                    <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white animate-pulse" />
                                    Watch Video
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* CỘT 3: LOCATION (Cột phải trên mobile) */}
                    <div className="footer-loc-col flex flex-col gap-4">
                        <h4 className="footer-heading">{t('location')}</h4>
                        <p className="footer-link">
                            {storeSettings?.streetAddress ? (
                                <>
                                    {storeSettings.streetAddress},
                                    <br />
                                    {storeSettings.city}
                                </>
                            ) : null}
                        </p>
                        <Link
                            href={
                                storeSettings?.streetAddress 
                                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeSettings.streetAddress}, ${storeSettings.city}`)}`
                                    : "https://www.google.com/maps"
                            }
                            target="_blank"
                            className="footer-heading border-b border-gray-700 pb-1 hover:text-white transition-colors w-fit mt-1 text-[10px] md:text-[12px]"
                        >
                            {t('open_maps')}
                        </Link>
                    </div>

                    {/* CỘT 4: NEWSLETTER (Full width mobile) */}
                    <div className="footer-newsletter-col flex flex-col gap-4 md:gap-6">
                        <div className="flex flex-col gap-2 md:gap-4">
                            <h4 className="footer-heading">{t('newsletter')}</h4>
                            <p className="text-[13px] leading-5 text-white/50">
                                {t.rich('newsletter_desc', { br: () => <br /> })}
                            </p>
                        </div>
                        <div className="newsletter-input-wrapper">
                            <input
                                type="email"
                                placeholder={t('email_placeholder')}
                                className="newsletter-input"
                            />
                            <button className="text-[#C9A961] hover:text-white transition-colors p-1">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* === BOTTOM BAR === */}
                <div className="footer-bottom">
                    <p className="font-display font-bold text-[10px] tracking-[2px] text-white/30 uppercase">
                        {t('copyright', { year: new Date().getFullYear() })}
                    </p>

                    <div className="flex gap-4 md:gap-8">
                        <Link href="#" className="footer-legal-link">{t('privacy')}</Link>
                        <Link href="#" className="footer-legal-link">{t('terms')}</Link>
                        <Link href="#" className="footer-legal-link">{t('sitemap')}</Link>
                    </div>
                </div>
            </div>

            {/* Nút Back To Top (Chỉ hiện trên Mobile) */}
            <BackToTop />
        </footer>
    );
}