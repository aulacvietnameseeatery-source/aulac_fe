"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactSocials() {
  const t = useTranslations("Contact.Socials");
  const { data: storeSettings, isLoading } = useStoreSettings();

  const socials = [
    { link: storeSettings?.instagramLink, label: t("instagram") },
    { link: storeSettings?.facebookLink, label: t("facebook") },
    { link: storeSettings?.tiktokLink, label: "TikTok" },
  ].filter(s => s.link);

  if (isLoading) {
    return (
      <div className="contact-socials-container">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="contact-socials-links">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (socials.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="contact-socials-container"
    >
      <h3 className="contact-socials-title">{t("title")}</h3>
      <div className="contact-socials-links">
        {socials.map((social, index) => (
          <motion.a
            key={index}
            href={social.link}
            target="_blank"
            className="contact-social-link"
            whileHover={{ scale: 1.05, color: "#C9A961" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {social.label}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

