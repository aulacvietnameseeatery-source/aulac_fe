import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const chefTestimonials = [
    {
        name: "EXECUTIVE CHEF MINH",
        quote:
            '"Cuisine is the bridge between history and the senses. At Au Lac, we don\'t just cook; we curate memories through traditional spices and modern textures."',
    },
    {
        name: "SOUS CHEF LINH",
        quote:
            '"Balance is our north star. The contrast of hot and cold, crisp and soft, sweet and savory defines the Vietnamese identity."',
    },
];

export default function NavigationSection() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[800px] w-full">
            <div className="relative min-h-[500px] lg:min-h-[800px]">
                <div className="absolute inset-0 bg-[url(/ab6axubnkcydecggkklvb8de2vvh9ito2pgx3trdnrswmw4jyon3ohyjzxi3dhmdw-ihbps0x31lighovbfudrpkw-zz-o6pw6ph4lonf-s2-bsl6mkf4vfcutr-rjka5fbysp9df8klwisyys96hn-ilguxxeps3xx8p7b3uyq3k2zbzsow62i6c3pduswqph51byakw-6cc6drr-gpmljz6bgvaabi5dsvw-acncelpnflcguqor4k94mvftkcm8ouxukgidxjyg2kgii.png)] bg-cover bg-center" />
                <div className="absolute inset-0 bg-[#19375233]" />
            </div>

            <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 bg-[#f6f4ef]">
                <div className="space-y-6">
                    <div className="pb-6">
                        <p className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs tracking-[6.00px] leading-4 uppercase">
                            THE CRAFTSMEN
                        </p>
                    </div>

                    <div className="pb-10">
                        <h2 className="[font-family:'Noto_Serif-Black',Helvetica] font-black text-[#193752] text-4xl md:text-5xl lg:text-6xl tracking-[0] leading-tight lg:leading-[60px]">
                            Mastering the
                            <br />
                            Soul of Taste
                        </h2>
                    </div>

                    <div className="space-y-12">
                        {chefTestimonials.map((chef, index) => (
                            <div key={index}>
                                <div className="space-y-[7.12px]">
                                    <h3 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-sm tracking-[1.40px] leading-5 uppercase">
                                        {chef.name}
                                    </h3>
                                    <p className="[font-family:'Noto_Serif-DisplayLight',Helvetica] font-light text-[#193752cc] text-[17.4px] tracking-[0] leading-[29.2px]">
                                        {chef.quote}
                                    </p>
                                </div>
                                {index < chefTestimonials.length - 1 && (
                                    <Separator className="mt-12 bg-[#1937521a]" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-16">
                        <Button
                            variant="link"
                            className="h-auto p-0 border-b-2 border-[#c9a961] rounded-none hover:no-underline pb-2"
                        >
                            <span className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#193752] text-base tracking-[1.60px] leading-6">
                                READ THEIR STORY
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
