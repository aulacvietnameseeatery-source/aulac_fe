import { useTranslations } from "next-intl";
import "../styles/index.css";

export function ContactSocials() {
  const t = useTranslations("Contact.Socials");

  return (
    <div className="contact-socials-container">
      <b className="contact-socials-title">{t("title")}</b>
      <div className="contact-socials-links">
        <a className="contact-social-link">{t("instagram")}</a>
        <a className="contact-social-link">{t("facebook")}</a>
        <a className="contact-social-link">{t("linkedin")}</a>
      </div>
    </div>
  );
}
