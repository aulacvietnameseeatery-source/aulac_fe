"use client";

import { HeroSection, ScanContent } from "@/features/qr-scan";

export default function QrScanPage() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-[#F9F8F6] px-4 pb-20 pt-[120px] md:px-8">

            {/* Card Container */}
            <div className="flex w-full max-w-[1150px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_40px_100px_-30px_rgba(0,0,0,0.15)] lg:flex-row lg:h-[650px]">

                <div className="w-full lg:w-[48%] bg-black">
                    <HeroSection />
                </div>

                <div className="w-full lg:flex-1 bg-white">
                    <ScanContent />
                </div>

            </div>

        </main>
    );
}