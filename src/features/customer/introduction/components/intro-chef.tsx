"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";
import { BASE_URL } from "@/lib/http";

export function IntroChef() {
    const t = useTranslations("Introduction.Chef");
    const { getSetting } = useDynamicSettings();

    const CHEFS = [
        { name: getSetting("intro.chef.1.name", t("chef_1_name")), quote: getSetting("intro.chef.1.quote", t("chef_1_quote")) },
        { name: getSetting("intro.chef.2.name", t("chef_2_name")), quote: getSetting("intro.chef.2.quote", t("chef_2_quote")) },
    ];

    const label = getSetting("intro.chef.label", t("label"));
    const title = getSetting("intro.chef.title", t("title"));
    const cta = getSetting("intro.chef.cta", t("cta"));
    const chefVideo = getSetting("intro.chef.videoUrl", "");
    const fullVideoUrl = chefVideo
        ? (chefVideo.startsWith('http') ? chefVideo : `${BASE_URL}${chefVideo}`)
        : "/video/nha-bep.mp4";

    return (
        <section className="w-full py-20 md:py-28 px-6 md:px-8 lg:px-20">
            <div className="mx-auto grid w-full max-w-[1440px] overflow-hidden rounded-3xl border border-[#C9A961]/25 bg-[#F7F2E8]/70 backdrop-blur-sm lg:grid-cols-[0.92fr_1.08fr]">

                {/* --- LEFT: IMAGE SECTION --- */}
                {/* Mobile: Chiều cao 50% màn hình. Desktop: Full chiều cao section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full border-b border-[#C9A961]/20 bg-[#12283A] px-6 py-8 md:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14"
                >
                    <div className="relative mx-auto w-full max-w-[420px] aspect-[9/16] overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
                        <video
                            src={fullVideoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-[#193752]/10 pointer-events-none" />
                    </div>
                </motion.div>

                {/* --- RIGHT: CONTENT SECTION --- */}
                <div className="w-full bg-transparent px-6 py-10 md:px-12 md:py-14 lg:px-20 lg:py-16 xl:px-24">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="mb-8 md:mb-10 space-y-3 md:space-y-4"
                    >
                        <span className="font-display text-[#8D6A2A] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] block">
                            {label}
                        </span>
                        <h2 className="font-display text-[#12283A] text-[32px] md:text-5xl lg:text-[58px] font-black leading-tight whitespace-pre-line">
                            {title}
                        </h2>
                    </motion.div>

                    {/* Chef Quotes List */}
                    <div className="flex flex-col gap-8 md:gap-12">
                        {CHEFS.map((chef, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 + (index * 0.2) }}
                                className="flex flex-col gap-3 md:gap-4"
                            >
                                {index > 0 && (
                                    <div className="w-full h-[1px] bg-[#12283A]/12 mb-6 md:mb-8" />
                                )}

                                <h3 className="font-display text-[#8D6A2A] text-xs md:text-sm font-bold uppercase tracking-widest">
                                    {chef.name}
                                </h3>
                                <p className="font-display text-[#12283A]/80 text-[16px] md:text-lg font-light leading-relaxed italic">
                                    {chef.quote}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-12 md:mt-16"
                    >
                        <Link href="/about/team" className="inline-flex flex-col items-start group">
                            <span className="font-display text-[#12283A] text-sm md:text-base font-bold uppercase tracking-[0.1em] pb-2 border-b-2 border-[#C9A961] transition-all group-hover:text-[#8D6A2A] group-hover:border-[#12283A]">
                                {cta}
                            </span>
                        </Link>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}