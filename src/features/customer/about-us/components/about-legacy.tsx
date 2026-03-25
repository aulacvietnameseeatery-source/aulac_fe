"use client";

import { useTranslations } from "next-intl";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export default function AboutLegacy({ overrides }: { overrides?: Record<string, string> }) {
  const t = useTranslations("AboutUs.Legacy");
  const { getSetting: originalGetSetting, getMediaSetting } = useDynamicSettings();

  const getSetting = (key: string, fallback: string) => {
    if (overrides?.[key]) return overrides[key];
    return originalGetSetting(key, fallback);
  };

  const title = getSetting("about.legacy.title", t("title"));
  const subtitle = getSetting("about.legacy.subtitle", t("subtitle"));
  const paragraph_1 = getSetting("about.legacy.paragraph_1", t("paragraph_1"));
  const paragraph_2 = getSetting("about.legacy.paragraph_2", t("paragraph_2"));
  const paragraph_3 = getSetting("about.legacy.paragraph_3", t("paragraph_3"));
  const paragraph_4 = getSetting("about.legacy.paragraph_4", t("paragraph_4"));

  const image = getMediaSetting("about.legacy.image", "/images/about-us/our-legacy/our-legacy.png");

  return (
    <section className="w-full max-w-[1152px] mx-auto px-6">
      <h3 className="text-blue-950 text-2xl md:text-[32px] font-bold leading-tight">
        {title}
      </h3>
      <p className="mt-2 text-blue-950 text-xl md:text-2xl font-normal leading-8">
        {subtitle}
      </p>

      <div className="mt-12 flex flex-col gap-6 text-blue-950/80 text-lg leading-7">
        <p>{paragraph_1}</p>

        <p>{paragraph_2}</p>

        <p>{paragraph_3}</p>

        <p>{paragraph_4}</p>
      </div>

      <div className="mt-12 overflow-hidden rounded-sm shadow-2xl">
        <div className="relative h-[260px] md:h-[473px]">
          <img
            src={image}
            alt="Au Lac Interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-950/20" />
        </div>
      </div>
    </section>
  );
}
