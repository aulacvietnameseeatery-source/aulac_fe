"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface FlyingItem {
    id: number;
    img: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
}

export function FlyItems({ items, onComplete }: { items: FlyingItem[], onComplete: (id: number) => void }) {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {items.map((item) => (
                <FlyingDish key={item.id} item={item} onComplete={() => onComplete(item.id)} />
            ))}
        </div>
    );
}

function FlyingDish({ item, onComplete }: { item: FlyingItem; onComplete: () => void }) {
    const [style, setStyle] = useState<React.CSSProperties>({
        top: item.startY,
        left: item.startX,
        opacity: 1,
        transform: "translate(-50%, -50%) scale(1)",
    });

    useEffect(() => {
        // Animation bay
        requestAnimationFrame(() => {
            setStyle({
                top: item.targetY,
                left: item.targetX,
                opacity: 0,
                transform: "translate(-50%, -50%) scale(0.2)",
                transition: "all 0.8s cubic-bezier(0.5, 0.05, 0.1, 0.3)",
            });
        });

        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [item, onComplete]);

    return (
        <div
            className="absolute h-16 w-16 overflow-hidden rounded-full border-2 border-[#D4A574] bg-white shadow-xl"
            style={style}
        >
            <Image src={item.img} alt="" fill className="object-cover" />
        </div>
    );
}