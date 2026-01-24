import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // Import icon mũi tên nếu muốn đẹp hơn

const CHEFS = [
    {
        name: "Executive Chef Minh",
        quote: "\"Cuisine is the bridge between history and the senses. At Au Lac, we don't just cook; we curate memories through traditional spices and modern textures.\"",
    },
    {
        name: "Sous Chef Linh",
        quote: "\"Balance is our north star. The contrast of hot and cold, crisp and soft, sweet and savory defines the Vietnamese identity.\"",
    },
];

export function IntroChef() {
    return (
        <section className="w-full flex flex-col lg:flex-row">

            {/* --- LEFT: IMAGE SECTION (50%) --- */}
            <div className="relative w-full lg:w-1/2 min-h-[500px] lg:min-h-screen">
                <img
                    src="/images/introduction-page/intro-chef/intro-chef.png"
                    alt="Au Lac Craftsmen"
                    className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-[#193752]/20" />
            </div>

            {/* --- RIGHT: CONTENT SECTION (50%) --- */}
            <div className="w-full lg:w-1/2 bg-[#F6F4EF] flex flex-col justify-center px-6 py-16 md:px-16 lg:px-24 xl:px-32">

                {/* Header */}
                <div className="mb-10 space-y-4">
          <span className="font-display text-[#C9A961] text-xs font-bold uppercase tracking-[0.5em] block">
            The Craftsmen
          </span>
                    <h2 className="font-display text-[#193752] text-4xl md:text-5xl lg:text-[60px] font-black leading-tight">
                        Mastering the <br />
                        Soul of Taste
                    </h2>
                </div>

                {/* Chef Quotes List */}
                <div className="flex flex-col gap-12">
                    {CHEFS.map((chef, index) => (
                        <div key={index} className="flex flex-col gap-4 group">
                            {index > 0 && (
                                <div className="w-full h-[1px] bg-[#193752]/10 mb-8" />
                            )}

                            <h3 className="font-display text-[#C9A961] text-sm font-bold uppercase tracking-widest">
                                {chef.name}
                            </h3>
                            <p className="font-display text-[#193752]/80 text-lg font-light leading-relaxed italic">
                                {chef.quote}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="mt-16">
                    <Link href="/about/team" className="inline-flex flex-col items-center group">
            <span className="font-display text-[#193752] text-base font-bold uppercase tracking-[0.1em] pb-2 border-b-2 border-[#C9A961] transition-all group-hover:text-[#C9A961] group-hover:border-[#193752]">
              Read Their Story
            </span>
                    </Link>
                </div>

            </div>

        </section>
    );
}