"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { UtensilsCrossed, X, Camera, ChevronRight, RefreshCcw } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import {ApiResponse} from "../../../../types/api-response.types";
import {api} from "../../../../lib/http";
import {cn} from "../../../../lib/utils";

interface AvailableTableDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    zone: string;
}

export function TableSelectionModal({ isOpen, onConfirm, onClose }: {
    isOpen: boolean,
    onConfirm: (val: string) => void,
    onClose: () => void
}) {
    const [val, setVal] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    // Loose-typed alias to avoid upstream prop typing mismatch
    const AnyScanner: any = Scanner;

    const [availableTables, setAvailableTables] = useState<AvailableTableDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchAvailableTables = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get<ApiResponse<AvailableTableDto[]>>("/api/manual/table/availability");
                    if (response.data) {
                        setAvailableTables(response.data);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải danh sách bàn trống:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAvailableTables();
        } else {
            // Reset state khi Modal đóng
            setVal("");
            setIsScanning(false);
            setAvailableTables([]);
        }
    }, [isOpen]);

    const handleCloseModal = () => {
        if (isScanning) {
            setIsScanning(false);
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ======================================================= */}
                    {/* 1. MODAL CHÍNH (CHỌN BÀN THỦ CÔNG & NÚT MỞ CAMERA) */}
                    {/* ======================================================= */}
                    {!isScanning && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCloseModal}
                                className="fixed inset-0 bg-[#0F2335]/80 backdrop-blur-md z-[100]"
                            />

                            {/* Modal Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[600px] z-[101]"
                            >
                                <div className={cn(
                                    "relative overflow-hidden flex flex-col p-6 md:p-8",
                                    "bg-[#204560]",
                                    "rounded-[24px] border border-[#C5A059]/30",
                                    "shadow-[0px_20px_50px_-10px_rgba(0,0,0,0.5)]"
                                )}>
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-20"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="flex flex-col items-center mb-6 z-10">
                                        <h3 className="font-display text-2xl font-bold text-white tracking-wide">
                                            Welcome to An Lac
                                        </h3>
                                        <p className="text-[#C5A059] text-sm font-light mt-1 text-center">
                                            How would you like to check in?
                                        </p>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 relative z-10">

                                        {/* 1. NÚT MỞ CAMERA QUÉT MÃ */}
                                        <div
                                            onClick={() => setIsScanning(true)}
                                            className="flex-1 flex flex-col items-center justify-center p-6 bg-[#1A3A52]/50 rounded-2xl border border-[#C5A059]/30 hover:bg-[#C5A059] hover:border-[#C5A059] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[#C5A059]/20"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-[#0F2335] group-hover:bg-[#1A3A52] border-2 border-[#C5A059] flex items-center justify-center mb-4 transition-colors duration-300 relative overflow-hidden">
                                                <Camera size={28} className="text-[#C5A059] group-hover:text-white transition-colors relative z-10" />
                                                <motion.div
                                                    animate={{ y: ["-100%", "100%"] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C5A059]/20 to-transparent z-0"
                                                />
                                            </div>
                                            <h4 className="text-white group-hover:text-[#0F2335] font-bold tracking-wider mb-2 flex items-center gap-2 transition-colors">
                                                Scan Table QR <ChevronRight size={16} />
                                            </h4>
                                            <p className="text-white/50 group-hover:text-[#0F2335]/70 text-xs text-center leading-relaxed transition-colors">
                                                Use your camera to scan the QR code placed on your table.
                                            </p>
                                        </div>

                                        {/* Đường chia cắt */}
                                        <div className="hidden md:flex flex-col items-center justify-center relative">
                                            <div className="h-full w-px bg-gradient-to-b from-transparent via-[#C5A059]/30 to-transparent" />
                                            <div className="absolute top-1/2 -translate-y-1/2 bg-[#204560] py-2 text-[10px] text-[#C5A059]/50 font-bold uppercase tracking-widest">
                                                OR
                                            </div>
                                        </div>
                                        <div className="md:hidden flex items-center justify-center relative py-2">
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C5A059]/30 to-transparent" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bg-[#204560] px-3 text-[10px] text-[#C5A059]/50 font-bold uppercase tracking-widest">
                                                OR
                                            </div>
                                        </div>

                                        {/* 2. PHẦN CHỌN BÀN THỦ CÔNG */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="text-white font-bold tracking-wider mb-4 text-center md:text-left">
                                                Manual Selection
                                            </h4>

                                            <div className="relative w-full mb-6">
                                                <select
                                                    value={val}
                                                    onChange={(e) => setVal(e.target.value)}
                                                    disabled={isLoading}
                                                    className={cn(
                                                        "w-full appearance-none bg-[#1A3A52] text-white text-base py-3 px-4 rounded-xl",
                                                        "border border-[#C5A059]/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/50",
                                                        "outline-none transition-all duration-300 cursor-pointer font-display",
                                                        isLoading && "opacity-70 cursor-wait"
                                                    )}
                                                >
                                                    <option value="" disabled hidden className="text-white/30">
                                                        {isLoading ? "Loading tables..." : "Select your table..."}
                                                    </option>

                                                    {/* 4. Render danh sách bàn thực tế từ API */}
                                                    {!isLoading && availableTables.length > 0 ? (
                                                        availableTables.map((table) => (
                                                            <option key={table.tableId} value={table.tableCode} className="bg-[#204560] text-white">
                                                                Table {table.tableCode} ({table.zone})
                                                            </option>
                                                        ))
                                                    ) : !isLoading && (
                                                        <option value="" disabled className="bg-[#204560] text-white/50">
                                                            No tables available
                                                        </option>
                                                    )}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C5A059]">
                                                    {isLoading ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                            <RefreshCcw size={16} />
                                                        </motion.div>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                disabled={!val}
                                                onClick={() => {
                                                    onConfirm(val);
                                                    setVal("");
                                                }}
                                                className={cn(
                                                    "w-full py-3.5 rounded-xl font-bold uppercase tracking-[1.5px] text-xs transition-all duration-300",
                                                    "shadow-lg active:scale-95 flex items-center justify-center gap-2",
                                                    val
                                                        ? "bg-[#C5A059] text-[#204560] hover:bg-[#D4AF6A] hover:shadow-[#C5A059]/20"
                                                        : "bg-[#1A3A52] text-white/30 cursor-not-allowed"
                                                )}
                                            >
                                                <UtensilsCrossed size={16} /> Enter Menu
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#C5A059]/5 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        </>
                    )}

                    {/* ======================================================= */}
                    {/* 2. GIAO DIỆN CAMERA QUÉT MÃ (KIỂU FULL SCREEN ĐỤC LỖ) */}
                    {/* ======================================================= */}
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center overflow-hidden"
                        >
                            {/* CAMERA FULLSCREEN CHÌM PHÍA SAU */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#111]">
                                <AnyScanner
                                    onResult={(text: string) => {
                                        let tableCode = text;
                                        // Thử kiểm tra xem text có phải là 1 URL chứa param ?table=... hay không
                                        try {
                                            const url = new URL(text);
                                            const tableParam = url.searchParams.get("table");
                                            if (tableParam) {
                                                tableCode = tableParam;
                                            }
                                        } catch (e) {
                                        }

                                        onConfirm(tableCode);

                                        // Reset và đóng camera
                                        setIsScanning(false);
                                        setVal("");
                                    }}
                                    onError={(error: unknown) => {
                                        console.error("Lỗi camera: ", (error as any)?.message ?? error);
                                    }}
                                    components={{
                                        tracker: undefined,
                                    }}
                                    styles={{
                                        container: { width: '100%', height: '100%' },
                                        video: { objectFit: 'cover' }
                                    }}
                                />
                            </div>

                            {/* Nút Đóng (quay lại chọn bàn thủ công) */}
                            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-start z-30 pt-10 md:pt-12">
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="text-white hover:text-[#C5A059] transition-colors p-2 bg-black/30 rounded-full backdrop-blur-sm"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="z-30 absolute top-24 md:top-32 flex flex-col items-center w-full px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <p className="text-white text-center text-sm md:text-base font-medium tracking-wide">
                                    Put QR in your camera frame to scan and check-in your table
                                </p>
                            </div>

                            {/* Khung Cutout Camera (Vùng nhìn xuyên thấu) */}
                            <div
                                className="relative w-[260px] md:w-[320px] aspect-square rounded-2xl z-20 overflow-hidden mt-8"
                                style={{
                                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)" // Làm tối xung quanh
                                }}
                            >
                                {/* Thanh quét laser (Chạy lên xuống) */}
                                <motion.div
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#C5A059]/60 to-transparent z-30"
                                />

                                {/* 4 Góc bo khung quét màu Vàng đồng */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#C5A059] rounded-tl-xl pointer-events-none" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#C5A059] rounded-tr-xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#C5A059] rounded-bl-xl pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#C5A059] rounded-br-xl pointer-events-none" />
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}