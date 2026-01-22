import { Button } from "@/components/ui/button";
import { Clock, Globe, MapPin, Phone } from "lucide-react";

const navigationItems = [
    { label: "MENU" },
    { label: "ABOUT US" },
    { label: "CONTACT" },
    { label: "QR SCAN" },
];

const contactInfo = [
    {
        icon: MapPin,
        text: "123 Elegance Street, City Center",
        iconClass: "w-[12px] h-[15px]",
    },
    {
        icon: Phone,
        text: "+1 (555) 888-0123",
        iconClass: "w-[13.5px] h-[13.5px]",
    },
];

const rightInfo = [
    {
        icon: Clock,
        text: "11:00 AM - 11:00 PM (Mon - Sun)",
        iconClass: "w-[15px] h-[15px]",
    },
];

export const MainHeaderSection = () => {
    return (
        <header className="flex flex-col w-full items-start pt-10 pb-6 px-80 bg-[#1a3a52]">
            <div className="relative max-w-screen-xl w-full h-[200.5px]">
                <div className="flex w-full items-center justify-between">
                    <div className="inline-flex flex-col min-w-[235.49px] items-start">
                        <div className="flex flex-col items-start pt-0 pb-1 px-0 self-stretch w-full">
                            <div className="flex flex-col items-start self-stretch w-full">
                                <h1 className="flex items-center justify-center w-[414px] mt-[-1.00px] mr-[-178.51px] [font-family:'Playfair_Display-Medium',Helvetica] font-medium text-white text-6xl tracking-[-1.50px] leading-[60px]">
                                    Bamee Gasstro
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col items-start self-stretch w-full">
                            <div className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#d5a673] text-sm tracking-[2.80px] leading-5 whitespace-nowrap">
                                VIETNAMESE EATERY
                            </div>
                        </div>

                        <div className="flex flex-col items-start pt-3 pb-0 px-0 self-stretch w-full">
                            <div className="flex flex-col items-start self-stretch w-full">
                                <p className="flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'Inter-LightItalic',Helvetica] font-light italic text-[#ffffffb2] text-sm tracking-[0] leading-5">
                                    Saveurs du Vietnam, esprit convivial
                                </p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex w-[565px] items-center gap-10">
                        <div className="inline-flex items-start gap-8">
                            {navigationItems.map((item, index) => (
                                <div key={index} className="inline-flex flex-col items-start">
                                    <div className="inline-flex items-start">
                                        <button className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm tracking-[1.40px] leading-5 whitespace-nowrap hover:text-[#d5a673] transition-colors">
                                            {item.label}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button className="h-auto inline-flex flex-col items-start px-10 py-3 mr-[-1.00px] bg-[#ffab2d] rounded overflow-hidden shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] hover:bg-[#ff9a1a]">
                            <span className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#1a3a52] flex items-center justify-center w-fit mt-[-1.00px] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
                                RESERVE
                            </span>
                        </Button>
                    </nav>
                </div>

                <div className="absolute w-full top-[156px] left-0 h-px bg-[#ffffff1a]" />

                <div className="flex w-full items-center justify-between absolute top-[180px] left-0">
                    <div className="inline-flex items-start gap-8">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-2 pt-0 pb-px px-0"
                            >
                                <div className="inline-flex flex-col items-start">
                                    <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                                        <info.icon
                                            className={`${info.iconClass} text-[#ffffffcc]`}
                                        />
                                    </div>
                                </div>

                                <div className="inline-flex flex-col items-start">
                                    <span className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-light text-[#ffffffcc] text-[13px] tracking-[0] leading-[19.5px] whitespace-nowrap">
                                        {info.text}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-8">
                        {rightInfo.map((info, index) => (
                            <div key={index} className="inline-flex items-center gap-2">
                                <div className="inline-flex flex-col items-start">
                                    <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                                        <info.icon
                                            className={`${info.iconClass} text-[#ffffffcc]`}
                                        />
                                    </div>
                                </div>

                                <div className="inline-flex flex-col items-start">
                                    <span className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-light text-[#ffffffcc] text-[13px] tracking-[0] leading-[19.5px] whitespace-nowrap">
                                        {info.text}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="inline-flex items-center gap-2">
                            <div className="inline-flex flex-col items-start">
                                <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                                    <Globe className="w-[15px] h-[15px] text-[#ffffffcc]" />
                                </div>
                            </div>

                            <div className="inline-flex items-center">
                                <div className="inline-flex flex-col items-start">
                                    <button className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13px] tracking-[0.65px] leading-[19.5px] whitespace-nowrap hover:text-[#d5a673] transition-colors">
                                        EN
                                    </button>
                                </div>

                                <div className="inline-flex flex-col items-start px-1.5 py-0">
                                    <span className="w-fit mt-[-1.00px] opacity-40 [font-family:'Inter-Light',Helvetica] font-light text-[#ffffffcc] text-[13px] tracking-[0.65px] leading-[19.5px] flex items-center justify-center whitespace-nowrap">
                                        |
                                    </span>
                                </div>

                                <div className="inline-flex flex-col items-start opacity-60">
                                    <button className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-light text-[#ffffffcc] text-[13px] tracking-[0.65px] leading-[19.5px] whitespace-nowrap hover:opacity-100 transition-opacity">
                                        FR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MainHeaderSection;
