import {
    IntroHero,
    IntroCollection,
    IntroVirtualTour
} from "@/features/customer/introduction";

export default function IntroductionPage() {
    return (
        <div className="relative w-full flex flex-col overflow-hidden bg-[#EEE8DC]">
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#D7C4A0]/50 blur-3xl" />
                <div className="absolute top-[32%] right-[-120px] h-[360px] w-[360px] rounded-full bg-[#9FB0BE]/30 blur-3xl" />
                <div className="absolute bottom-[-160px] left-[12%] h-[340px] w-[340px] rounded-full bg-[#1E3C52]/20 blur-3xl" />
            </div>

            <div className="relative z-10">
                <IntroHero />

                <div className="mx-auto h-px w-[min(92%,1280px)] bg-gradient-to-r from-transparent via-[#C9A961]/70 to-transparent" />

                <IntroCollection />

                <div className="mx-auto h-px w-[min(92%,1280px)] bg-gradient-to-r from-transparent via-[#C9A961]/70 to-transparent" />

                <IntroVirtualTour />
            </div>
        </div>
    );
}