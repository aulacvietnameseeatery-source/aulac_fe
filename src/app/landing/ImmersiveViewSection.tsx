import { Card, CardContent } from "@/components/ui/card";
import container from "./container.svg";

export default function ImmersiveViewSection() {
    return (
        <section className="flex flex-col items-start px-4 md:px-16 lg:px-60 py-12 md:py-24 w-full bg-[#f6f4ef]">
            <div className="flex flex-col max-w-[1440px] items-start gap-12 w-full mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
                    <div className="inline-flex flex-col items-start gap-4">
                        <div className="flex flex-col items-start w-full">
                            <p className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs tracking-[6.00px] leading-4 uppercase">
                                EXPERIENCE
                            </p>
                        </div>

                        <div className="flex flex-col items-start w-full">
                            <h2 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-neutral-950 text-3xl md:text-4xl tracking-[0] leading-10">
                                The Immersive View
                            </h2>
                        </div>
                    </div>

                    <div className="inline-flex flex-col max-w-sm items-start">
                        <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-neutral-950 text-[13.6px] tracking-[0] leading-5">
                            Explore our space from every angle before you arrive.
                        </p>
                    </div>
                </div>

                <Card className="w-full rounded-sm border border-solid border-[#c9a961] overflow-hidden bg-transparent shadow-none">
                    <CardContent className="p-1 relative">
                        <img
                            className="w-full h-auto aspect-[1.78] object-cover"
                            alt="Container"
                            src={container}
                        />

                        <div className="inline-flex flex-col items-start gap-2 absolute left-6 md:left-[41px] bottom-6 md:bottom-[41px]">
                            <div className="flex flex-col items-start w-full">
                                <p className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-white text-xs tracking-[1.20px] leading-4 uppercase">
                                    VIRTUAL TOUR
                                </p>
                            </div>

                            <div className="flex flex-col items-start w-full">
                                <h3 className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-white text-xl md:text-2xl tracking-[0] leading-8">
                                    A 360° Walkthrough
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}