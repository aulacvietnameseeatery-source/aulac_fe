import { useTranslations } from "next-intl";
import "../styles/index.css";

export function ContactMap() {
  const t = useTranslations("Contact.Map");

  return (
    <div className="contact-map-wrapper">
      <div className="contact-map-header">
        <b className="contact-map-title">{t("title")}</b>
        <div className="contact-map-divider" />
      </div>

        <div className="contact-map-container group">
            <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2745.767919575806!2d6.6076634768636335!3d46.51270416287284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c302e98355e7f%3A0x6bfac1478ade9d!2sAv.%20Emile-Henri-Jaques-Dalcroze%2C%201007%20Lausanne%2C%20Switzerland!5e0!3m2!1sen!2s!4v1769503094124!5m2!1sen!2s"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            <div className="contact-map-hint">{t("hint")}</div>
        </div>
    </div>
  );
}