// components/BookFrame.tsx
import React from 'react';

export const BookFrame = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative w-full max-w-[1400px] mx-auto z-10 shadow-2xl transition-all duration-500">
            <div className="relative w-full" style={{ aspectRatio: '2646 / 1618' }}>
                {/* Ảnh Layer 2A */}
                <img
                    src="/images/menu-listing/layer2A.png"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    alt="Book Frame"
                />

                {/* Container cho nội dung Layer 3 */}
                {/* Top/Bottom: ~4%, Left/Right: ~2.5% dựa trên ảnh bìa */}
                <div className="absolute inset-0 flex py-[4%] px-[2.5%]">
                    {children}
                </div>
            </div>
        </div>
    );
};