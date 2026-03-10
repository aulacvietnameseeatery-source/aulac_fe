"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

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
                    className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#111]">
                        <Scanner
                            onScan={(result) => {
                                if (result?.[0]?.rawValue) {
                                    console.log("QR Result:", result[0].rawValue);

                                    // xử lý url / table code ở đây
                                    // ví dụ redirect
                                    window.location.href = result[0].rawValue;
                                }
                            }}
                            onError={(error: unknown) => {
                                console.error("Lỗi camera:", error);
                            }}
                            components={{
                                audio: false,
                                tracker: undefined,
                            }}
                            styles={{
                                container: { width: "100%", height: "100%" },
                                video: { objectFit: "cover" },
                            }}
                        />
                    </div>

                    <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>

                    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-start z-30 pt-10 md:pt-12">
                        <button
                            onClick={onClose}
                            className="text-white hover:text-[#C5A059] transition-colors p-2 bg-black/30 rounded-full backdrop-blur-sm"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <div className="z-30 absolute top-24 md:top-32 flex flex-col items-center w-full px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <p className="text-white text-center text-sm md:text-base font-medium tracking-wide">
                            Sử dụng Camera để quét mã QR trên bàn của bạn
                        </p>
                    </div>

                    <div
                        className="relative w-[260px] md:w-[320px] aspect-square rounded-2xl z-20 overflow-hidden mt-8"
                        style={{ boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)" }}
                    >
                        <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#C5A059]/60 to-transparent z-30"
                        />

                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#C5A059] rounded-tl-xl pointer-events-none" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#C5A059] rounded-tr-xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#C5A059] rounded-bl-xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#C5A059] rounded-br-xl pointer-events-none" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}