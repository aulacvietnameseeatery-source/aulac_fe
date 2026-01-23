import { cn } from "@/lib/utils";

export function IntroHero() {
    return (
        <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">

            {/* 1. BACKGROUND IMAGE */}
            <div className="absolute inset-0 w-full h-full">

                <img
                    src="public/images/intro-hero.png"
                    alt="Au Lac Introduction"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 2. CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-[896px] text-center space-y-6">

                {/* Est. 1994 */}
                <div className="animate-fade-in-up delay-100">
          <span className="font-display text-[#C9A961] text-sm md:text-[14px] font-normal uppercase tracking-[0.4em] md:tracking-[5.6px] leading-5">
            Est. 1994
          </span>
                </div>

                {/* Main Title */}
                <div className="animate-fade-in-up delay-200">
                    <h1 className="font-display text-white text-[50px] md:text-[96px] font-black leading-[1.1] md:leading-[96px]">
                        A Symphony of <br />
                        Vietnamese <br />
                        Artistry
                    </h1>
                </div>

                {/* Quote / Description */}
                <div className="pt-2 animate-fade-in-up delay-300 max-w-[672px]">
                    <p className="font-display text-white/90 text-[16px] md:text-[19px] font-light leading-7 md:leading-7 italic">
                        &quot;Where the heritage of the Red River meets the sophistication of modern fine dining.&quot;
                    </p>
                </div>
            </div>

            {/* 3. SCROLL INDICATOR (Cái gạch dọc ở dưới) */}
            <div className="absolute bottom-0 flex flex-col items-center animate-fade-in delay-500">
                <div className="w-[1px] h-[96px] bg-gradient-to-b from-white/0 via-white/50 to-white" />
            </div>

        </section>
    );
}