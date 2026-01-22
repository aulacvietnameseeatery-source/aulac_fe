import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Send, Twitter } from "lucide-react";

const socialMediaIcons = [
    { icon: Facebook, label: "Facebook" },
    { icon: Instagram, label: "Instagram" },
    { icon: Twitter, label: "Twitter" },
];

const legalLinks = [
    { text: "PRIVACY" },
    { text: "TERMS" },
    { text: "SITEMAP" },
];

export default function SiteFooterSection() {
    return (
        <footer className="flex flex-col items-start gap-20 pt-[94px] pb-12 px-60 w-full bg-[#193752] border-t border-[#ffffff0d]">
            <div className="flex max-w-[1440px] items-end justify-center gap-24 w-full">
                <div className="flex flex-col items-start gap-[28.75px] flex-1">
                    <div className="flex items-center gap-3 w-full">
                        <div className="inline-flex flex-col items-start">
                            <div className="relative w-9 h-11">
                                <img
                                    className="absolute w-[91.67%] h-[71.59%] top-[12.50%] left-[4.17%]"
                                    alt="AU LAC Logo"
                                    src=""
                                />
                            </div>
                        </div>

                        <div className="inline-flex flex-col items-start">
                            <h2 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-white text-2xl tracking-[4.80px] leading-8 whitespace-nowrap">
                                AU LAC
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col max-w-xs items-start w-full">
                        <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffff99] text-sm leading-[22.8px]">
                            Defined by excellence, driven by heritage.
                            <br />
                            The pinnacle of Vietnamese culinary art in
                            <br />
                            the heart of the city.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col flex-1 gap-12">
                    <div className="flex flex-col gap-3">
                        <h3 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs tracking-[1.20px] leading-4 whitespace-nowrap">
                            RESERVATIONS
                        </h3>
                    </div>

                    <div className="flex flex-col gap-5">
                        <a
                            href="tel:+15558920122"
                            className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffffe6] text-lg leading-7 whitespace-nowrap"
                        >
                            +1 (555) 892 0122
                        </a>

                        <a
                            href="mailto:concierge@aulac.art"
                            className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffffe6] text-lg leading-7 whitespace-nowrap"
                        >
                            concierge@aulac.art
                        </a>
                    </div>

                    <div className="flex gap-4">
                        {socialMediaIcons.map((social, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#ffffffe6] hover:text-[#c9a961] hover:bg-transparent"
                                aria-label={social.label}
                            >
                                <social.icon className="h-5 w-5" />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col flex-1 gap-[47px]">
                    <div className="flex flex-col gap-3">
                        <h3 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs tracking-[1.20px] leading-4 whitespace-nowrap">
                            LOCATION
                        </h3>
                    </div>

                    <address className="flex flex-col gap-[38px] not-italic">
                        <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffffe6] text-lg leading-[29.2px]">
                            128 Heritage Street,
                            <br />
                            District 1, Ho Chi Minh City
                        </p>

                        <Button
                            variant="link"
                            className="h-auto p-0 border-b border-[#c9a961] rounded-none w-fit [font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-sm tracking-[1.40px] leading-5 hover:no-underline"
                        >
                            OPEN IN MAPS
                        </Button>
                    </address>
                </div>

                <div className="flex flex-col items-start flex-1 gap-8">
                    <div className="flex flex-col w-full">
                        <h3 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs tracking-[1.20px] leading-4">
                            NEWSLETTER
                        </h3>
                    </div>

                    <div className="flex flex-col w-full">
                        <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffff99] text-sm leading-5">
                            Join our circle for exclusive events and
                            <br />
                            seasonal masterpiece previews.
                        </p>
                    </div>

                    <div className="flex items-center w-full border-b border-[#ffffff33] pb-2">
                        <Input
                            type="email"
                            placeholder=""
                            className="flex-1 h-9 bg-transparent border-0 text-[#ffffffe6] placeholder:text-[#ffffff66] focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-6 text-[#ffffffe6] hover:text-[#c9a961] hover:bg-transparent p-0"
                            aria-label="Subscribe to newsletter"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex max-w-[1440px] items-center justify-between pt-12 w-full border-t border-[#ffffff0d]">
                <div className="inline-flex flex-col items-start">
                    <p className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#ffffff4c] text-[10px] tracking-[2.00px] leading-[15px] whitespace-nowrap">
                        © 2024 AU LAC VIETNAMESE EATERY. ALL RIGHTS RESERVED.
                    </p>
                </div>

                <nav className="inline-flex items-start gap-8">
                    {legalLinks.map((link, index) => (
                        <Button
                            key={index}
                            variant="link"
                            className="h-auto p-0 [font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#ffffff4c] text-[10px] tracking-[2.00px] leading-[15px] hover:text-[#c9a961] hover:no-underline"
                        >
                            {link.text}
                        </Button>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
