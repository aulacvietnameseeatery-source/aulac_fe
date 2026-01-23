import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function IntroVirtualTour() {
    return (
        <section className="w-full bg-[#F6F4EF] py-24 px-4 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] flex flex-col gap-12">

                {/* --- 1. HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

                    {/* Title Group */}
                    <div className="flex flex-col gap-4">
            <span className="font-display text-[#C9A961] text-xs font-bold uppercase tracking-[0.5em]">
              Experience
            </span>
                        <h2 className="font-display text-[#0A0A0A] text-4xl md:text-[36px] font-bold leading-tight">
                            The Immersive View
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="max-w-md">
                        {/* Đã sửa màu text từ trắng -> đen mờ để đọc được trên nền kem */}
                        <p className="font-display text-[#0A0A0A]/60 text-sm md:text-[13.6px] leading-relaxed">
                            Explore our space from every angle before you arrive.
                        </p>
                    </div>
                </div>

                {/* --- 2. VIDEO / IMAGE CONTAINER --- */}
                <div className="relative w-full p-1 border border-[#C9A961] rounded-[2px]">
                    <div className="relative w-full aspect-video md:aspect-[16/9] lg:h-[804px] overflow-hidden bg-black group cursor-pointer">

                        {/* Background Image */}
                        <img
                            src="/images/introduction-page/intro-virtual-tour/intro-virtual-tour.png"
                            alt="Au Lac Virtual Tour"
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* --- CENTER PLAY BUTTON --- */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-[#193752]/40 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C9A961]/80">
                                <Play className="text-white fill-current w-8 h-8 ml-1" />
                            </div>
                        </div>

                        {/* --- BOTTOM LEFT INFO --- */}
                        <div className="absolute bottom-10 left-10 flex flex-col gap-2">
              <span className="font-display text-white text-xs font-bold uppercase tracking-[0.1em]">
                Virtual Tour
              </span>
                            <h3 className="font-display text-white text-2xl font-normal">
                                A 360° Walkthrough
                            </h3>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}