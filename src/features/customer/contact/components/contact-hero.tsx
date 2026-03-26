"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import "../styles/index.css";

export function ContactHero() {
  const t = useTranslations("Contact.Hero");

  return (
    <div className="contact-hero-section">
      <div className="contact-hero-bg-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="contact-hero-content-glass"
      >
        <h1 className="contact-hero-title">
          {t("title")}
        </h1>
        <div className="contact-hero-divider" />
        <p className="contact-hero-description">
          {t("description")
            .split("\n")
            .map((line, i) => (
              <span key={i}>
                {line}
                <br className="hidden md:block" />
              </span>
            ))}
        </p>
      </motion.div>
    </div>
  );
}

