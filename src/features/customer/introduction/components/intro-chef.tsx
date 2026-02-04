"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function IntroChef() {
    const t = useTranslations("Introduction.Chef");

    const CHEFS = [
        { name: t("chef_1_name"), quote: t("chef_1_quote") },
        { name: t("chef_2_name"), quote: t("chef_2_quote") },
    ];

    return (
        <section className="w-full flex flex-col lg:flex-row">

            {/* --- LEFT: IMAGE SECTION --- */}
            {/* Mobile: Chiều cao 50% màn hình. Desktop: Full chiều cao section */}
            <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto lg:min-h-screen">
                <img
                    src="/images/introduction-page/intro-chef/intro-chef.png"
                    alt="Au Lac Craftsmen"
                    className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-[#193752]/20" />
            </div>

            {/* --- RIGHT: CONTENT SECTION --- */}
            <div className="w-full lg:w-1/2 bg-[#F6F4EF] flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32">

                {/* Header */}
                <div className="mb-8 md:mb-10 space-y-3 md:space-y-4">
                    <span className="font-display text-[#C9A961] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] block">
                        {t("label")}
                    </span>
                    <h2 className="font-display text-[#193752] text-[32px] md:text-5xl lg:text-[60px] font-black leading-tight whitespace-pre-line">
                        {t("title")}
                    </h2>
                </div>

                {/* Chef Quotes List */}
                <div className="flex flex-col gap-8 md:gap-12">
                    {CHEFS.map((chef, index) => (
                        <div key={index} className="flex flex-col gap-3 md:gap-4 group">
                            {index > 0 && (
                                <div className="w-full h-[1px] bg-[#193752]/10 mb-6 md:mb-8" />
                            )}

                            <h3 className="font-display text-[#C9A961] text-xs md:text-sm font-bold uppercase tracking-widest">
                                {chef.name}
                            </h3>
                            <p className="font-display text-[#193752]/80 text-[16px] md:text-lg font-light leading-relaxed italic">
                                {chef.quote}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="mt-12 md:mt-16">
                    <Link href="/about/team" className="inline-flex flex-col items-start group">
                        <span className="font-display text-[#193752] text-sm md:text-base font-bold uppercase tracking-[0.1em] pb-2 border-b-2 border-[#C9A961] transition-all group-hover:text-[#C9A961] group-hover:border-[#193752]">
                            {t("cta")}
                        </span>
                    </Link>
                </div>

            </div>

        </section>
    );
}