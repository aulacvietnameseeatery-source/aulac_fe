"use client";

export default function AboutPhilosophy() {
  return (
    <section className="w-full max-w-[1152px] px-6 pt-8">
      <div className="flex flex-col items-center">
        <div className="text-center text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
          Our Core Values
        </div>
        <div className="mt-3 text-center text-blue-950 text-4xl font-bold leading-10">
          Culinary Philosophy
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="h-10 w-10 rounded bg-blue-950/80" />
          </div>
          <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
            Traditional Craft
          </div>
          <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
            Honoring the slow techniques of our ancestors. From 24-hour bone
            broths to hand-ground spices using the mortar and pestle.
          </p>
        </div>

        <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="h-10 w-10 rounded bg-blue-950/80" />
          </div>
          <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
            Modern Spirit
          </div>
          <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
            Elevating heritage flavors through precision, artistic plating, and a
            sophisticated global perspective on fine dining.
          </p>
        </div>
      </div>
    </section>
  );
}
