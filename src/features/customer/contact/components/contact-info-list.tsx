"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ContactInfoList() {
  const t = useTranslations("Contact.Info");
  const { data: storeSettings, isLoading } = useStoreSettings();

  const contactItems = [
    {
      icon: <MapPin />,
      label: t("addressLabel") || "Our Home",
      content: storeSettings?.streetAddress ? (
        <>
          {storeSettings.streetAddress},
          <br />
          {storeSettings.city}
        </>
      ) : "",
    },
    {
      icon: <Phone />,
      label: t("phoneLabel"),
      content: storeSettings?.phone ? (
        <a href={`tel:${storeSettings.phone}`} className="hover:text-[#C9A961] transition-colors">
          {storeSettings.phone}
        </a>
      ) : "",
    },
    {
      icon: <Mail />,
      label: t("emailLabel"),
      content: storeSettings?.email ? (
        <a href={`mailto:${storeSettings.email}`} className="hover:text-[#C9A961] transition-colors break-all">
          {storeSettings.email}
        </a>
      ) : "",
    },

    {
      icon: <Clock />,
      label: t("hoursLabel"),
      content: storeSettings?.openingHours || "",
    },
  ];

  if (isLoading) {
    return (
      <div className="contact-info-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="contact-card">
            <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full mb-4 md:mb-6" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full max-w-[200px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="contact-info-grid"
    >
      {contactItems.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="contact-card"
        >
          <div className="contact-card-icon-wrapper">
            {item.icon}
          </div>
          <div className="contact-card-content">
            <h3 className="contact-card-label">{item.label}</h3>
            <div className="contact-card-text">{item.content}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

