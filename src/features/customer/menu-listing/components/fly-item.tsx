"use client";

import { motion, AnimatePresence } from "framer-motion";

// Bảng màu cho các nguyên tố
const ELEMENT_COLORS: Record<string, string> = {
    Fire: "#EF4444",   // Đỏ
    Water: "#3B82F6",  // Xanh dương
    Wood: "#22C55E",   // Xanh lá
    Metal: "#94A3B8",  // Bạc/Xám
    Earth: "#D97706",  // Vàng cam
    Default: "#D4A574" // Vàng Gold
};

export interface FlyingItem {
    id: number;
    element?: string; // Nhận nguyên tố để đổi màu
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
}

export function FlyItems({ items, onComplete }: { items: FlyingItem[], onComplete: (id: number) => void }) {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {items.map((item) => (
                    <EssenceTrail
                        key={item.id}
                        item={item}
                        onComplete={() => onComplete(item.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Component con vẽ vệt sáng
function EssenceTrail({ item, onComplete }: { item: FlyingItem; onComplete: () => void }) {
    const color = ELEMENT_COLORS[item.element || "Default"] || ELEMENT_COLORS["Default"];

    return (
        <motion.div
            // Vị trí xuất phát
            initial={{
                x: item.startX,
                y: item.startY,
                scale: 0.2,
                opacity: 0
            }}
            // Vị trí đích (Giỏ hàng)
            animate={{
                x: item.targetX,
                y: item.targetY,
                scale: [1, 1.4, 0.1], // Phóng to rồi thu nhỏ lại khi chui vào giỏ
                opacity: [0, 1, 0],   // Hiện dần rồi tan biến
            }}
            // Cấu hình bay
            transition={{
                duration: 0.8,        // Thời gian bay chậm hơn (0.8s) để nhìn rõ
                ease: [0.4, 0.0, 0.2, 1], // Bezier curve cho cảm giác bay lướt nhanh rồi chậm dần
            }}
            onAnimationComplete={onComplete}
            className="absolute flex items-center justify-center"
            style={{ transform: "translate(-50%, -50%)", zIndex: 9999 }}
        >
            {/* 1. Lõi sáng (Hạt nhân) */}
            <div
                className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] relative z-10"
            />

            {/* 2. Vầng hào quang (Glow màu) */}
            <div
                className="absolute h-10 w-10 rounded-full opacity-50 blur-md"
                style={{ backgroundColor: color }}
            />

            {/* 3. Đuôi sao chổi (Trail) */}
            <motion.div
                className="absolute h-24 w-6 rounded-full opacity-30 blur-xl"
                style={{
                    backgroundColor: color,
                    top: "50%",
                    left: "50%",
                    // Xoay nhẹ để tạo cảm giác đuôi kéo theo
                    transform: "translate(-80%, -50%) rotate(15deg)",
                    transformOrigin: "center left"
                }}
            />
        </motion.div>
    );
}