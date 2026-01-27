"use client";

type DishHeroProps = {
  onOrderNow: () => void;
};

export function DishHero({ onOrderNow }: DishHeroProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-10">
      <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px]">
        <img
          src= "/images/dish-detail/dish-hero/dish-hero.png"
          alt="Dish hero"
          className="absolute left-0 top-[-140px] h-[900px] w-full object-cover md:top-[-460px] md:h-[1045px]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-black/0" />

        {/* Tag */}
        <div className="absolute left-6 top-10 rounded-full bg-blue-800/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px] md:left-16 md:top-[200px]">
          Chef&apos;s Masterpiece
        </div>

        {/* Title */}
        <h1 className="absolute left-6 top-20 max-w-[620px] text-4xl font-medium leading-[44px] text-white md:left-16 md:top-[240px] md:text-7xl md:leading-[76px]">
          <span className="block">Imperial Hue</span>
          <span className="block">Beef Noodle Soup</span>
        </h1>

        {/* Subtitle */}
        <p className="absolute left-6 top-[190px] max-w-[520px] text-base font-light leading-6 text-white/90 md:left-16 md:top-[400px] md:text-xl md:leading-7">
          A culinary voyage to the Imperial City of Hue, balancing
          <br />
          boldness and refinement in a single bowl.
        </p>

        {/* Buttons */}
        <div className="absolute left-6 top-[265px] flex flex-wrap gap-3 md:left-16 md:top-[488px]">
          <button
            type="button"
            className="h-12 w-60 rounded-lg bg-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg"
          >
            <span className="text-base font-bold text-blue-800">
              Reserve Experience
            </span>
          </button>

          <button
            type="button"
            className="h-12 w-32 rounded-lg bg-black/40 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]"
          >
            <span className="text-base font-medium text-white">Share</span>
          </button>
        </div>

        {/* Order Now */}
        <button
          type="button"
          className="absolute bottom-6 right-6 h-11 w-28 rounded-lg bg-amber-400 md:right-[150px] md:top-[492px] md:bottom-auto"
          onClick={onOrderNow}
        >
          <span className="text-sm font-medium text-blue-950">Order Now</span>
        </button>

        {/* Photo / 360 / Video pill (UI only) */}
        <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 p-1.5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:inline-flex">
          <button
            type="button"
            className="rounded-full bg-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
          >
            Photo
          </button>
          <button
            type="button"
            className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
          >
            360° View
          </button>
          <button
            type="button"
            className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
          >
            Video
          </button>
        </div>
      </div>
    </section>
  );
}
