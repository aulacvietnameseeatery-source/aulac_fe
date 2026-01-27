"use client";

export default function AboutFounders() {
  return (
    <section className="w-full max-w-[976px] overflow-hidden rounded-sm bg-white pt-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:grid md:grid-cols-2">
      <div className="relative h-[300px] bg-blue-950/10 md:h-[500px]">
        <img
          src="/images/about-us/meet-founder/meet-founder.png"
          alt="Meet the Founders"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/30 mix-blend-saturation" />
      </div>

      <div className="p-8 md:p-16">
        <div className="text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
          The Visionaries
        </div>

        <div className="mt-3 text-blue-950 text-3xl font-bold leading-9">
          Meet the Founders
        </div>

        <div className="mt-6 flex flex-col gap-6 text-blue-950/70 text-base leading-6">
          <p>
            Chef Nguyen and Master Sommelier Linh founded Au Lac with a shared
            dream: to redefine how the world perceives Vietnamese hospitality.
          </p>

          <p>
            With backgrounds spanning from the street stalls of Saigon to
            Michelin-starred kitchens in Paris, they bring a balanced harmony of
            warmth and professional excellence to every guest&apos;s table.
          </p>
        </div>

        <div className="mt-10 border-t border-blue-950/10 pt-10">
          <p className="text-blue-950 text-lg leading-7">
            "The table is where culture lives. We invite you to sit with us."
          </p>
          <p className="mt-4 text-orange-300 text-[10px] font-bold uppercase tracking-widest">
            — Nguyen &amp; Linh
          </p>
        </div>
      </div>
    </section>
  );
}
