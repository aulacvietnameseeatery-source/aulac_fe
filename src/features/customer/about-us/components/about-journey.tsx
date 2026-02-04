"use client";

import { useTranslations } from "next-intl";

export default function AboutJourney() {
  const t = useTranslations("AboutUs.Journey");

  return (
    <section className="relative w-full max-w-[848px] rounded-sm bg-white p-10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:p-20">
      {/* icon placeholder */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-6 py-1.5">
        <div className="h-11 w-9 bg-orange-300/80 rounded-sm" />
      </div>

      <h3 className="text-center text-blue-950 text-3xl font-bold leading-9">
        {t("title")}
      </h3>

      <div className="mt-10 flex flex-col gap-8 text-lg leading-7 text-blue-950/80">
        <p dangerouslySetInnerHTML={{ __html: t.raw("paragraph_1") }} />

        <p>{t("paragraph_2")}</p>

        <div className="border-l-2 border-orange-300 py-4 pl-8">
          <p className="text-blue-950 text-2xl font-normal leading-8">
            {t("quote")}
          </p>
        </div>

        <p>{t("paragraph_3")}</p>
      </div>
    </section>
  );
}
