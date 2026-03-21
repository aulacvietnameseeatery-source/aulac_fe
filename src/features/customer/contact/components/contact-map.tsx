import { useTranslations } from "next-intl";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";

export function ContactMap() {
  const t = useTranslations("Contact.Map");
  const { data: storeSettings } = useStoreSettings();

  const address = storeSettings?.streetAddress && storeSettings?.city
    ? `${storeSettings.streetAddress}, ${storeSettings.city}`
    : "";

  const mapUrl = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  return (
    <div className="contact-map-wrapper">
      <div className="contact-map-header">
        <b className="contact-map-title">{t("title")}</b>
        <div className="contact-map-divider" />
      </div>

      <div className="contact-map-container group">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
             {t("no_address") || "Map not available"}
          </div>
        )}

        <div className="contact-map-hint">{t("hint")}</div>
      </div>
    </div>
  );
}