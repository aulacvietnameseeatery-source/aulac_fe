"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Wind, Waves, Leaf, Sun } from "lucide-react";

// Premium Animation Variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function AboutUsUI() {
  const t = useTranslations("AboutUs");

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-[#1A1A1A]">
      <main className="w-full">
        {/* === HERO SECTION === */}
        <div className="relative w-full h-[60vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
          {/* Background Gradient/Pattern */}
          <div className="absolute inset-0 bg-linear-to-br from-[#1A3A51]/40 to-black/80 z-10" />
          <div className="absolute inset-0 opacity-20 bg-[url('/pattern/noise.png')]" /> {/* Noise texture fallback */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-20 text-center px-4"
          >
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-medium tracking-tight text-[#FDFBF7] mix-blend-overlay opacity-90">
              An Lạc
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-[#FFAB2D]/90 font-display italic font-light tracking-widest uppercase">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>

        {/* === INTRODUCTION SECTION === */}
        <motion.div
          className="max-w-250 mx-auto px-6 py-24 md:py-32"
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariant} className="flex flex-col gap-12 text-center items-center">
            {/* Decorative Icon */}
            <div className="w-px h-20 bg-[#1A1A1A]/20" />
            <Leaf className="w-6 h-6 text-[#1A1A1A]/40" />

            <p className="text-2xl md:text-4xl font-display font-light leading-snug text-[#1A1A1A] max-w-3xl">
              {t.rich("description_1", {
                br: () => <br />
              })}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mt-16 text-left">
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFAB2D]">Philosophy</h3>
                <p className="text-lg text-[#444] leading-relaxed font-sans">
                  {t("description_2")}
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFAB2D]">Craft</h3>
                <p className="text-lg text-[#444] leading-relaxed font-sans">
                  {t("description_3")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* === FEATURED CARDS (Balance, Memory, Serenity) === */}
        <div className="w-full bg-[#EBE9E4] py-24 md:py-32">
          <div className="max-w-300 mx-auto px-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariant}
            >
              {[
                { icon: Wind, label: "Balance", desc: t("description_4").split('.')[0] + "." },
                { icon: Waves, label: "Serenity", desc: t("description_1").split('\n')[1] },
                { icon: Sun, label: "Memory", desc: t("description_3").split(':')[0] + "." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariant}
                  className="bg-[#FDFBF7] p-8 md:p-12 rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-[#FFAB2D]/30 group"
                >
                  <item.icon className="w-10 h-10 text-[#1A1A1A]/60 group-hover:text-[#FFAB2D] transition-colors duration-500 mb-6" strokeWidth={1} />
                  <h4 className="text-2xl font-display mb-4 text-[#1A1A1A]">{item.label}</h4>
                  <p className="text-[#666] leading-relaxed font-sans text-sm md:text-base">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* === CLOSING STATEMENT === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="py-32 md:py-48 text-center px-6 bg-[#1A1A1A] text-[#FDFBF7]"
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="w-16 h-px bg-[#FFAB2D]/50 mx-auto" />
            <p className="text-3xl md:text-5xl font-display font-light italic leading-tight">
              "{t("description_5")}"
            </p>
            <div className="w-16 h-px bg-[#FFAB2D]/50 mx-auto" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
