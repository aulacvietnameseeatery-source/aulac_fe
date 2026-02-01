import { useTranslations } from "next-intl";

export function ContactHero() {
  const t = useTranslations("Contact.Hero");

  return (
    <div className="w-full max-w-2xl flex flex-col items-center text-center gap-6">
      <h1 className="font-display font-bold text-[48px] md:text-[60px] text-[#1A3951] leading-tight">
        {t("title")}
      </h1>
      <div className="w-12 h-px bg-[#C9A961]" />
      <p className="font-body text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
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
