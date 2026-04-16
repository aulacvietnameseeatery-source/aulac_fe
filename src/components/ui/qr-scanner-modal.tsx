"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
    const [hasError, setHasError] = useState(false);
    const t = useTranslations("QrScannerModal");
    // 1. Thêm State quản lý việc render riêng cái Camera
    const [isMountingCamera, setIsMountingCamera] = useState(false);

    // 2. Xử lý logic trễ (delay) cho Camera
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            // Chỉ bật camera sau khi modal đã animate ra xong (khoảng 300ms)
            timer = setTimeout(() => {
                setIsMountingCamera(true);
            }, 300);
        } else {
            // Khi Modal đóng, ngắt camera ngay lập tức (không đợi animation)
            setIsMountingCamera(false);
            setHasError(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleClose = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* KHU VỰC RENDER CAMERA - Chèn điều kiện isMountingCamera vào đây */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#111]">
                        {isMountingCamera && (
                            <Scanner
                                onScan={(result) => {
                                    if (result?.[0]?.rawValue) {
                                        console.log("QR Result:", result[0].rawValue);
                                        window.location.href = result[0].rawValue;
                                    }
                                }}
                                onError={(error: unknown) => {
                                    console.error("Lỗi camera:", error);
                                    setHasError(true);
                                }}
                                components={{
                                    tracker: () => null,
                                }}
                                styles={{
                                    container: { width: "100%", height: "100%" },
                                    video: { objectFit: "cover" },
                                }}
                            />
                        )}
                    </div>

                    <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>

                    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-start z-30 pt-10 md:pt-12">
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-[#C5A059] transition-colors p-2 bg-black/30 rounded-full backdrop-blur-sm pointer-events-auto"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* HIỂN THỊ LỖI */}
                    {hasError ? (
                        <div className="z-30 bg-white rounded-xl p-6 flex flex-col items-center w-[85%] md:max-w-sm text-center shadow-2xl">
                            <AlertTriangle className="text-red-500 w-12 h-12 mb-3" />
                            <h3 className="text-gray-900 font-bold text-lg mb-2">{t("error_title")}</h3>
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                {t("error_description")}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setHasError(false);
                                        // Thử load lại component bằng cách chớp tắt state
                                        setIsMountingCamera(false);
                                        setTimeout(() => setIsMountingCamera(true), 200);
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                >
                                    {t("retry")}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition"
                                >
                                    {t("close")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // GIAO DIỆN KHUNG QUÉT
                        <>
                            <div className="z-30 absolute top-24 md:top-32 flex flex-col items-center w-full px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <p className="text-white text-center text-sm md:text-base font-medium tracking-wide">
                                    {t("scan_instruction")}
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
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}