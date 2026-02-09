'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FlipSheetProps {
    children: ReactNode;      // Nội dung mặt trước (Right Page)
    backContent: ReactNode;   // Nội dung mặt sau (Left Page của trang kế)
    isFlipped: boolean;       // Trạng thái: Đang lật hay chưa
    zIndex: number;           // Để xếp chồng các trang lên nhau
}

export const FlipSheet = ({ children, backContent, isFlipped, zIndex }: FlipSheetProps) => {
    return (
        <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
                zIndex: zIndex,
                transformStyle: "preserve-3d", // Quan trọng: Giữ không gian 3D cho con
                transformOrigin: "left center", // Quan trọng: Xoay quanh gáy sách bên trái
            }}
            animate={{
                rotateY: isFlipped ? -180 : 0, // Xoay -180 độ để lật sang trái
            }}
            transition={{
                duration: 1.2, // Tốc độ lật (chậm rãi sang trọng)
                ease: [0.645, 0.045, 0.355, 1.000], // Bezier curve cho cảm giác vật lý thật
            }}
        >
            {/* --- MẶT TRƯỚC (Front) --- */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    backfaceVisibility: "hidden", // Ẩn khi bị lật ra sau
                    // transformStyle: "preserve-3d" // Có thể cần nếu nội dung con cũng 3D
                }}
            >
                {children}
            </div>

            {/* --- MẶT SAU (Back) --- */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)", // Mặt sau phải xoay sẵn 180 độ
                }}
            >
                {backContent}
            </div>
        </motion.div>
    );
};