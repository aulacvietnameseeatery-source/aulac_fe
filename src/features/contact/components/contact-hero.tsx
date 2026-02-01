import { useTranslations } from "next-intl";
import "../styles/index.css";

export function ContactHero() {
  const t = useTranslations("Contact.Hero");

  return (
    <div className="contact-hero-wrapper">
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
    </div>
  );
}
