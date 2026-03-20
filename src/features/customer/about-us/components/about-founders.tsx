"use client";

import { useTranslations } from "next-intl";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export default function AboutFounders({ overrides }: { overrides?: Record<string, string> }) {
  const t = useTranslations("AboutUs.Founders");
  const { getSetting: originalGetSetting, getMediaSetting } = useDynamicSettings();

  const getSetting = (key: string, fallback: string) => {
    if (overrides?.[key]) return overrides[key];
    return originalGetSetting(key, fallback);
  };

  const label = getSetting("about.founders.label", t("label"));
  const title = getSetting("about.founders.title", t("title"));
  const paragraph_1 = getSetting("about.founders.paragraph_1", t("paragraph_1"));
  const paragraph_2 = getSetting("about.founders.paragraph_2", t("paragraph_2"));
  const quote = getSetting("about.founders.quote", t("quote"));
  const quote_author = getSetting("about.founders.quote_author", t("quote_author"));
  
  const image = getMediaSetting("about.founders.image", "/images/about-us/meet-founder/meet-founder.png");

  return (
    <section className="w-full max-w-[976px] mx-auto overflow-hidden rounded-sm bg-white pt-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:grid md:grid-cols-2">
      <div className="relative h-[300px] bg-blue-950/10 md:h-[500px]">
        <img
          src={image}
          alt="Meet the Founders"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/30 mix-blend-saturation" />
      </div>

      <div className="p-8 md:p-16">
        <div className="text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
          {label}
        </div>

        <div className="mt-3 text-blue-950 text-2xl md:text-3xl font-bold leading-9">
          {title}
        </div>

        <div className="mt-6 flex flex-col gap-6 text-blue-950/70 text-base leading-6">
          <p>
            {paragraph_1}
          </p>

          <p>
            {paragraph_2}
          </p>
        </div>

        <div className="mt-10 border-t border-blue-950/10 pt-10">
          <p className="text-blue-950 text-lg leading-7">
            {quote}
          </p>
          <p className="mt-4 text-orange-300 text-[10px] font-bold uppercase tracking-widest">
            {quote_author}
          </p>
        </div>
      </div>
    </section>
  );
}
