import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactItem } from "./contact-item";
import { useTranslations } from "next-intl";

export function ContactInfoList() {
  const t = useTranslations("Contact.Info");

  return (
    <div className="flex flex-col gap-10">
      <ContactItem
        icon={<MapPin />}
        label="Our Home"
        content={
          <>
            {t("address").split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </>
        }
      />
      <ContactItem
        icon={<Phone />}
        label={t("phoneLabel")}
        content={t("phone")}
      />
      <ContactItem
        icon={<Mail />}
        label={t("emailLabel")}
        content={t("email")}
      />
      <ContactItem
        icon={<Clock />}
        label={t("hoursLabel")}
        content={t("hours")}
      />
    </div>
  );
}
