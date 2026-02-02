"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Logic kiểm tra scroll
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                // Vị trí cố định góc phải dưới, chỉ hiện trên mobile (md:hidden)
                "fixed z-40 md:hidden bg-[#C9A961] text-[#1A3A52] p-3 rounded-full shadow-lg transition-all duration-300 transform",
                // Né thanh Safe Area Bottom + cách lề phải
                "right-4 bottom-[calc(20px+var(--safe-bottom))]",
                // Hiệu ứng hiện/ẩn
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
            )}
            aria-label="Back to top"
        >
            <ArrowUp size={20} strokeWidth={2.5} />
        </button>
    );
}