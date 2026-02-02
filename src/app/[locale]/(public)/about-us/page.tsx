"use client";

import {
  AboutBreadcrumb,
  AboutLegacy,
  AboutJourney,
  AboutPhilosophy,
  AboutFounders,
} from "@/features/about-us";

export default function AboutUsUI() {
  return (
    <div className="w-full bg-stone-100">

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-16 md:pt-32">
        <div className="flex flex-col items-center gap-24">
          <AboutLegacy />
          <AboutJourney />
          <AboutPhilosophy />
          <AboutFounders />
        </div>
      </main>
    </div>
  );
}
