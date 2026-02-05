"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Cloudinary360Props {
    productTag: string;
    cloudName?: string;
}

declare global {
    interface Window {
        cloudinary: any;
    }
}

export function Cloudinary360Viewer({
                                        productTag,
                                        cloudName = "demo"
                                    }: Cloudinary360Props) {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const viewerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const initWidget = () => {
        if (!window.cloudinary || !containerRef.current) return;

        if (viewerRef.current) {
            viewerRef.current.destroy();
            viewerRef.current = null;
        }

        viewerRef.current = window.cloudinary.galleryWidget({
            container: containerRef.current,
            cloudName: cloudName,
            mediaAssets: [{ tag: productTag, mediaType: "spin" }],

            // 👇 1. SỬA LỖI CRASH (Bắt buộc phải là top/bottom/left/right)
            carouselLocation: "bottom",

            zoom: false,
            navigation: "always",

            // 👇 2. CẤU HÌNH ĐỂ KHÔNG BỊ ZOOM CẮT ẢNH
            // Bỏ aspectRatio cố định để nó tự tính theo khung cha
            style: {
                background: "transparent",
                border: "none"
            }
        });

        viewerRef.current.render();
    };

    useEffect(() => {
        if (isScriptLoaded) initWidget();
        return () => {
            if (viewerRef.current) viewerRef.current.destroy();
        };
    }, [isScriptLoaded, productTag]);

    return (
        <div className="relative w-full h-full">
            <Script
                src="https://product-gallery.cloudinary.com/all.js"
                strategy="lazyOnload"
                onLoad={() => setIsScriptLoaded(true)}
                onReady={() => { if (window.cloudinary) setIsScriptLoaded(true); }}
            />

            {/* Container */}
            <div ref={containerRef} className="w-full h-full" />

            {!isScriptLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Loading 360...
                </div>
            )}
        </div>
    );
}