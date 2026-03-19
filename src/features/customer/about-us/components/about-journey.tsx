"use client";

import { useTranslations } from "next-intl";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export default function AboutJourney() {
  const t = useTranslations("AboutUs.Journey");
  const { getSetting } = useDynamicSettings();

  const title = getSetting("about.journey.title", t("title"));
  // Assuming paragraph_1 can contain HTML for next-intl compatibility, so we use string replacement logic if needed,
  // but for the dynamic setting, we inject it directly
  const paragraph_1 = getSetting("about.journey.paragraph_1", t.raw("paragraph_1"));
  const paragraph_2 = getSetting("about.journey.paragraph_2", t("paragraph_2"));
  const quote = getSetting("about.journey.quote", t("quote"));
  const paragraph_3 = getSetting("about.journey.paragraph_3", t("paragraph_3"));

  return (
    <section className="relative w-full max-w-[848px] rounded-sm bg-white p-10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:p-20">
      {/* icon placeholder */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-6 py-1.5">
        <div className="h-11 w-9 bg-orange-300/80 rounded-sm" />
      </div>

      <h3 className="text-center text-blue-950 text-3xl font-bold leading-9">
        {title}
      </h3>

      <div className="mt-10 flex flex-col gap-8 text-lg leading-7 text-blue-950/80">
        <p dangerouslySetInnerHTML={{ __html: paragraph_1 }} />

        <p>{paragraph_2}</p>

        <div className="border-l-2 border-orange-300 py-4 pl-8">
          <p className="text-blue-950 text-2xl font-normal leading-8">
            {quote}
          </p>
        </div>

        <p>{paragraph_3}</p>
      </div>
    </section>
  );
}
