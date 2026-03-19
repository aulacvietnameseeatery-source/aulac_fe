"use client";

import { useTranslations } from "next-intl";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export default function AboutPhilosophy() {
  const t = useTranslations("AboutUs.Philosophy");
  const { getSetting } = useDynamicSettings();

  const label = getSetting("about.philosophy.label", t("label"));
  const title = getSetting("about.philosophy.title", t("title"));
  const value_1_title = getSetting("about.philosophy.value_1_title", t("value_1_title"));
  const value_1_desc = getSetting("about.philosophy.value_1_desc", t("value_1_desc"));
  const value_2_title = getSetting("about.philosophy.value_2_title", t("value_2_title"));
  const value_2_desc = getSetting("about.philosophy.value_2_desc", t("value_2_desc"));

  return (
    <section className="w-full max-w-[1152px] px-6 pt-8">
      <div className="flex flex-col items-center">
        <div className="text-center text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
          {label}
        </div>
        <div className="mt-3 text-center text-blue-950 text-4xl font-bold leading-10">
          {title}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="h-10 w-10 rounded bg-blue-950/80" />
          </div>
          <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
            {value_1_title}
          </div>
          <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
            {value_1_desc}
          </p>
        </div>

        <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="h-10 w-10 rounded bg-blue-950/80" />
          </div>
          <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
            {value_2_title}
          </div>
          <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
            {value_2_desc}
          </p>
        </div>
      </div>
    </section>
  );
}
