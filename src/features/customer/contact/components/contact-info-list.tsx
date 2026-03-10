"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactItem } from "./contact-item";
import { useTranslations } from "next-intl";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";

export function ContactInfoList() {
  const t = useTranslations("Contact.Info");
  const { data: storeSettings } = useStoreSettings();

  return (
    <div className="contact-info-list-wrapper">
      <ContactItem
        icon={<MapPin />}
        label="Our Home"
        content={
          storeSettings?.streetAddress ? (
            <>
              {storeSettings.streetAddress},
              <br />
              {storeSettings.city}
            </>
          ) : ""
        }
      />
      <ContactItem
        icon={<Phone />}
        label={t("phoneLabel")}
        content={storeSettings?.phone || ""}
      />
      <ContactItem
        icon={<Mail />}
        label={t("emailLabel")}
        content={storeSettings?.email || ""}
      />
      <ContactItem
        icon={<Clock />}
        label={t("hoursLabel")}
        content={storeSettings?.openingHours || ""}
      />
    </div>
  );
}
