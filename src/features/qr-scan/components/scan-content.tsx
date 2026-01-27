"use client";

import Image from "next/image";
import { ScanLine, BookOpen, Utensils } from "lucide-react";

export function ScanContent() {
    return (
        // Tăng padding lên px-12 py-16 để nội dung thoáng hơn
        <div className="relative flex h-full flex-col items-center justify-between px-10 py-12 lg:px-20 lg:py-20">

            {/* 1. Header Text */}
            <div className="flex flex-col items-center text-center">
                {/* Font to hơn (text-[48px]), đậm hơn (font-medium), màu xanh đậm chuẩn */}
                <h1 className="font-display text-[42px] font-medium leading-[1.1] text-[#1A3A52] lg:text-[48px]">
                    Discover Our
                    <br />
                    Selection
                </h1>
                <p className="mt-6 max-w-[320px] font-sans text-[14px] font-light italic leading-[24px] tracking-wide text-[#5B768B]">
                    Scan to explore our full culinary narrative on your device
                </p>
            </div>

            {/* 2. QR Code Box */}
            <div className="my-auto flex flex-col items-center py-8">
                <div className="relative flex h-[240px] w-[240px] items-center justify-center bg-white p-4 shadow-sm">
                    <div className="absolute inset-0 border-[1.5px] border-[#C5A059]" />
                    <div className="absolute inset-3 border border-[#C5A059]/30" />

                    <div className="relative h-[170px] w-[170px]">
                        <Image
                            src="/images/qr-scan/scan-content/siu.jpg"  //todo change image path if needed
                            alt="QR Code"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Steps Footer Icons */}
            <div className="flex w-full max-w-[400px] items-start justify-between border-t border-[#1A3A52]/10 pt-3">

                <StepIcon Icon={ScanLine} label="Scan" />
                <StepIcon Icon={BookOpen} label="Explore" />
                <StepIcon Icon={Utensils} label="Order" />

            </div>
        </div>
    );
}

function StepIcon({ Icon, label }: { Icon: any, label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 group cursor-default">
            <Icon className="h-6 w-6 text-[#C5A059] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[2px] text-[#1A3A52]/60 transition-colors group-hover:text-[#1A3A52]">
                {label}
            </span>
        </div>
    )
}