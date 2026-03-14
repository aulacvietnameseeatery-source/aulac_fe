import { useTranslations } from "next-intl";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";

export function ContactSocials() {
  const t = useTranslations("Contact.Socials");
  const { data: storeSettings } = useStoreSettings();

  return (
    <div className="contact-socials-container">
      <b className="contact-socials-title">{t("title")}</b>
      <div className="contact-socials-links">
        {storeSettings?.instagramLink && (
          <a href={storeSettings.instagramLink} target="_blank" className="contact-social-link">
            {t("instagram")}
          </a>
        )}
        {storeSettings?.facebookLink && (
          <a href={storeSettings.facebookLink} target="_blank" className="contact-social-link">
            {t("facebook")}
          </a>
        )}
        {storeSettings?.tiktokLink && (
          <a href={storeSettings.tiktokLink} target="_blank" className="contact-social-link">
            TikTok
          </a>
        )}
      </div>
    </div>
  );
}
