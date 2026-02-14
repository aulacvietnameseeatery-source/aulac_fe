"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, X, QrCode, ScanLine } from "lucide-react";

const MOCK_TABLES = [
    { id: "A-01", name: "Table A-01 (Window)" },
    { id: "A-02", name: "Table A-02" },
    { id: "B-01", name: "Table B-01 (Sofa)" },
    { id: "B-02", name: "Table B-02" },
    { id: "VIP-1", name: "VIP Room 1" },
];

export function TableSelectionModal({ isOpen, onConfirm, onClose }: {
    isOpen: boolean,
    onConfirm: (val: string) => void,
    onClose: () => void
}) {
    const [val, setVal] = useState("");

    // State để quản lý việc hiển thị popup QR Code phóng to
    const [showQrPopup, setShowQrPopup] = useState(false);

    // Hàm đóng Modal chính (nếu đang mở popup QR thì đóng QR trước)
    const handleCloseModal = () => {
        if (showQrPopup) {
            setShowQrPopup(false);
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop chính của Modal chọn bàn */}
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
                                    Scan QR code on your table or select manually
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 relative z-10">

                                {/* 1. PHẦN QUÉT MÃ QR (Click để phóng to) */}
                                <div
                                    onClick={() => setShowQrPopup(true)}
                                    className="flex-1 flex flex-col items-center justify-center p-4 bg-[#1A3A52]/50 rounded-2xl border border-[#C5A059]/10 hover:border-[#C5A059] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[#C5A059]/10"
                                >
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-[#C5A059]/20 blur-xl rounded-full group-hover:bg-[#C5A059]/40 transition-all duration-500" />
                                        <div className="relative p-5 bg-[#0F2335] rounded-xl border border-[#C5A059]/30 group-hover:scale-105 transition-transform duration-300">
                                            <QrCode size={56} className="text-[#C5A059]" />
                                            {/* Tia laser giả lập quét */}
                                            <motion.div
                                                animate={{ y: [0, 56, 0] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-5 left-5 right-5 h-[2px] bg-[#C5A059] shadow-[0_0_8px_#C5A059] z-10 opacity-70"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold tracking-wider mb-2 flex items-center gap-2 group-hover:text-[#C5A059] transition-colors">
                                        <ScanLine size={16} /> Tap to enlarge
                                    </h4>
                                    <p className="text-white/50 text-xs text-center leading-relaxed px-2">
                                        Click here to show the big QR Code for easier scanning.
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
                                            className={cn(
                                                "w-full appearance-none bg-[#1A3A52] text-white text-base py-3 px-4 rounded-xl",
                                                "border border-[#C5A059]/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/50",
                                                "outline-none transition-all duration-300 cursor-pointer font-display"
                                            )}
                                        >
                                            <option value="" disabled hidden className="text-white/30">
                                                Select your table...
                                            </option>
                                            {MOCK_TABLES.map((table) => (
                                                <option key={table.id} value={table.id} className="bg-[#204560] text-white">
                                                    {table.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C5A059]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>

                                    <button
                                        disabled={!val}
                                        onClick={() => {
                                            onConfirm(val);
                                            setVal(""); // Reset sau khi confirm
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

                    {/* ======================================================= */}
                    {/* POPUP HIỂN THỊ MÃ QR PHÓNG TO NẰM ĐÈ LÊN TRÊN */}
                    {/* ======================================================= */}
                    <AnimatePresence>
                        {showQrPopup && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowQrPopup(false)} // Nhấn ra ngoài để đóng
                                className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F2335]/95 backdrop-blur-lg p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    onClick={(e) => e.stopPropagation()} // Nhấn vào ảnh QR không bị đóng
                                    className="relative bg-[#204560] p-6 pb-8 rounded-3xl border border-[#C5A059]/50 shadow-[0_0_60px_rgba(197,160,89,0.15)] max-w-[340px] w-full flex flex-col items-center"
                                >
                                    {/* Nút X thoát */}
                                    <button
                                        onClick={() => setShowQrPopup(false)}
                                        className="absolute -top-4 -right-4 w-10 h-10 bg-[#0F2335] border-2 border-[#C5A059] text-[#C5A059] rounded-full flex items-center justify-center hover:bg-[#C5A059] hover:text-[#0F2335] transition-all shadow-lg z-20"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>

                                    <h3 className="font-display text-xl text-white mb-6 uppercase tracking-widest text-center">
                                        Scan to order
                                    </h3>

                                    {/* Khu vực chứa ảnh QR */}
                                    <div className="bg-white p-4 rounded-2xl w-full aspect-square relative flex items-center justify-center">
                                        {/* Thay src bằng link ảnh QR thật của nhà hàng */}
                                        <img
                                            src="/images/sample-qr.png"
                                            onError={(e) => {
                                                // Nếu bạn chưa có ảnh thật, nó sẽ lấy tạm QR mẫu này
                                                e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Welcome+To+An+Lac';
                                            }}
                                            alt="Table QR Code"
                                            className="w-full h-full object-contain rounded-lg"
                                        />

                                        {/* Khung viền nhắm mục tiêu 4 góc */}
                                        <div className="absolute inset-0 border-4 border-[#C5A059] rounded-2xl pointer-events-none opacity-20" />
                                        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#C5A059] rounded-tl-lg pointer-events-none" />
                                        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-[#C5A059] rounded-tr-lg pointer-events-none" />
                                        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-[#C5A059] rounded-bl-lg pointer-events-none" />
                                        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#C5A059] rounded-br-lg pointer-events-none" />
                                    </div>

                                    <p className="text-[#C5A059]/80 text-sm mt-6 text-center font-light px-4">
                                        Point your smartphone camera at this code to browse the menu and order.
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}