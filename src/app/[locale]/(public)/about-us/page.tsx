"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, easeOut } from "framer-motion";
import { getPublicGroupSettings } from "@/features/staff/system-settings/services/system-setting.service";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Premium Animation Variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: easeOut },
  },
};

export default function AboutUsUI() {
  const t = useTranslations("settings.AboutUs.public");
  const locale = useLocale();

  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: () => getPublicGroupSettings('store')
  });

  // Get dynamic content with fallback to the local JSON
  const getVal = (key: string) => {
    const backendKey = `store.about_${key}_${locale}`;
    if (storeSettings) {
      const found = storeSettings.find(s => s.settingKey === backendKey);
      if (found && found.value) return found.value.toString();
    }
    // Safe fallback
    try {
      return t(key);
    } catch {
      return "";
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D5BA98]" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-[#1A1A1A]">
      <main className="w-full pb-32">
        {/* === HERO SECTION === */}
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1A1A1A]">
          {/* Background Gradient/Pattern */}
          <div className="absolute inset-0 bg-linear-to-br from-[#1A3A51]/50 to-black/90 z-10" />
          <div className="absolute inset-0 opacity-20 bg-[url('/pattern/noise.png')]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="relative z-20 text-center px-6 max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-medium tracking-tight text-[#FDFBF7] mix-blend-overlay opacity-90 mb-8">
              An Lạc
            </h1>
            <div className="w-12 h-px bg-[#FFAB2D]/50 mx-auto mb-8" />
            <p className="text-xl md:text-3xl text-[#FFAB2D]/90 font-display italic font-light tracking-wide leading-relaxed">
              {getVal('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* === MAIN CONTENT PARAGRAPHS === */}
        <motion.div
          className="max-w-3xl mx-auto px-6 py-24 md:py-32"
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex flex-col gap-12 md:gap-16 text-center md:text-left items-center md:items-start">

            <motion.p variants={itemVariant} className="text-xl md:text-2xl font-display text-[#1A1A1A]/90 leading-loose mx-auto md:mx-0 text-center">
              {getVal('paragraph_1')}
            </motion.p>

            <div className="w-8 h-px bg-[#1A1A1A]/20 self-center" />

            <motion.p variants={itemVariant} className="text-lg md:text-xl font-sans text-[#444] leading-relaxed font-light text-center">
              {getVal('paragraph_2')}
            </motion.p>

            <motion.p variants={itemVariant} className="text-lg md:text-xl font-sans text-[#444] leading-relaxed font-light text-center">
              {getVal('paragraph_3')}
            </motion.p>

          </div>
        </motion.div>

        {/* === CLOSING STATEMENT === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="py-16 text-center px-6"
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="w-16 h-px bg-[#D5BA98]/50 mx-auto" />
            <p className="text-2xl md:text-4xl font-display text-[#1A3A52] font-medium leading-tight italic">
              &quot;{getVal('closing_quote')}&quot;
            </p>
            <div className="w-16 h-px bg-[#D5BA98]/50 mx-auto" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
