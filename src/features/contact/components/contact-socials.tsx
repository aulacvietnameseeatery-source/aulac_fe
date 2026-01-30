import { useTranslations } from "next-intl";

export function ContactSocials() {
  const t = useTranslations("Contact.Socials");

  return (
    <div className="flex flex-col gap-4">
      <b className="tracking-[1px] uppercase text-xs text-[#C9A961]">
        {t("title")}
      </b>
      <div className="flex gap-8 text-[#1A3951] font-display text-lg">
        <a className="hover:text-[#C9A961] transition">{t("instagram")}</a>
        <a className="hover:text-[#C9A961] transition">{t("facebook")}</a>
        <a className="hover:text-[#C9A961] transition">{t("linkedin")}</a>
      </div>
    </div>
  );
}
