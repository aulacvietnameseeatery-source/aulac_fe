import { InputGroup } from "./input-group";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export function ContactForm() {
  const t = useTranslations("Contact.Form");

  return (
    <div className="contact-wrapper">
      <div className="contact-form-wrapper">
        <div className="contact-form-header">
          <h3 className="contact-form-title">{t("title")}</h3>
        </div>

        <form className="contact-form">
          <div className="contact-form-grid">
            <InputGroup
              label={t("fullName")}
              placeholder={t("fullNamePlaceholder")}
            />
            <InputGroup label={t("email")} type="email" />
          </div>

          <div className="form-select-wrapper">
            <label className="form-label">{t("subject")}</label>
            <select className="form-select">
              <option>{t("subjects.general")}</option>
              <option>{t("subjects.events")}</option>
              <option>{t("subjects.reservation")}</option>
            </select>
          </div>

          <div className="form-textarea-wrapper">
            <label className="form-label">{t("message")}</label>
            <textarea
              className="form-textarea"
              placeholder="How can we help you?"
            />
          </div>

          <button className="submit-button group">
            <span className="submit-button-text">{t("submit")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}