"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactMap() {
  const t = useTranslations("Contact.Map");
  const { data: storeSettings, isLoading } = useStoreSettings();

  const address = storeSettings?.streetAddress && storeSettings?.city
    ? `${storeSettings.streetAddress}, ${storeSettings.city}`
    : "";

  const mapUrl = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  if (isLoading) {
    return (
      <div className="contact-map-wrapper">
        <div className="contact-map-header">
          <Skeleton className="h-8 w-48" />
          <div className="contact-map-divider" />
        </div>
        <Skeleton className="w-full h-[300px] md:h-[450px] rounded-2xl md:rounded-3xl shadow-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="contact-map-wrapper"
    >
      <div className="contact-map-header">
        <h2 className="contact-map-title">{t("title")}</h2>
        <div className="contact-map-divider" />
      </div>

      <div className="contact-map-container group shadow-2xl">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-3xl"
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 font-serif text-xl italic">
            {t("no_address") || "Map not available"}
          </div>
        )}

        <div className="contact-map-hint">{t("hint")}</div>
      </div>
    </motion.div>
  );
}