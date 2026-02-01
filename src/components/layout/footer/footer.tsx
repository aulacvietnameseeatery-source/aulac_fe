"use client";

import Link from "next/link";
import { Facebook, Instagram, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface FooterProps {
    locale?: string;
}

export function Footer({ locale = "en" }: FooterProps) {
    const t = useTranslations('Footer');

    return (
        <footer className="footer-wrapper">
            <div className="footer-inner">

                {/* === MAIN CONTENT === */}
                <div className="footer-main-grid">

                    {/* CỘT 1: BRAND */}
                    <div className="flex flex-col gap-[28px] flex-1 max-w-[320px]">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-11">
                                <div className="absolute left-[1.5px] top-[5.5px] w-[33px] h-[31.5px] bg-[#C9A961]" />
                            </div>
                            <span className="footer-brand-title">
                                An Lac
                            </span>
                        </div>
                        <p className="footer-text">
                            {t.rich('description', { br: () => <br /> })}
                        </p>
                    </div>

                    {/* CỘT 2: RESERVATIONS */}
                    <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
                        <h4 className="footer-heading">{t('reservations')}</h4>
                        <div className="flex flex-col gap-1">
                            <p className="footer-link">+1 (555) 892 0122</p>
                            <p className="footer-link">concierge@anlac.art</p>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <div className="social-btn group">
                                <Facebook size={20} className="social-icon" />
                            </div>
                            <div className="social-btn group">
                                <Instagram size={20} className="social-icon" />
                            </div>
                        </div>
                    </div>

                    {/* CỘT 3: LOCATION */}
                    <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
                        <h4 className="footer-heading">{t('location')}</h4>
                        <p className="footer-link">
                            128 Heritage Street,
                            <br />
                            District 1, Ho Chi Minh City
                        </p>
                        <Link
                            href="https://maps.google.com"
                            target="_blank"
                            className="footer-heading border-b border-gray-700 pb-1 hover:text-white transition-colors w-fit mt-2"
                        >
                            {t('open_maps')}
                        </Link>
                    </div>

                    {/* CỘT 4: NEWSLETTER */}
                    <div className="flex flex-col gap-6 flex-1 max-w-[288px]">
                        <div className="flex flex-col gap-4">
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
                            <button className="text-[#C9A961] hover:text-white transition-colors">
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

                    <div className="flex gap-6 md:gap-8">
                        <Link href="#" className="footer-legal-link">{t('privacy')}</Link>
                        <Link href="#" className="footer-legal-link">{t('terms')}</Link>
                        <Link href="#" className="footer-legal-link">{t('sitemap')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}