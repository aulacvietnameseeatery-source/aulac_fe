"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Nền đen tuyền */}
                    <div className="absolute inset-0 bg-[#111] flex items-center justify-center z-0"></div>

                    {/* Nút đóng (X) */}
                    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-start z-30 pt-10 md:pt-12">
                        <button
                            onClick={onClose}
                            className="text-white hover:text-[#C5A059] transition-colors p-2"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* Câu thông báo */}
                    <div className="z-30 absolute top-24 md:top-32 flex flex-col items-center w-full px-4">
                        <p className="text-white text-center text-sm md:text-base font-medium tracking-wide">
                            Put QR in your camera frame to scan and check-in your table
                        </p>
                    </div>

                    {/* Khung Camera Quét Mã */}
                    <div
                        className="relative w-[260px] md:w-[320px] aspect-square rounded-2xl z-20 overflow-hidden mt-8"
                        style={{ boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)" }}
                    >
                        {/* Thanh quét laser */}
                        <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#C5A059]/80 to-transparent z-30"
                        />

                        {/* 4 Góc bo khung quét */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-xl pointer-events-none" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-xl pointer-events-none" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}