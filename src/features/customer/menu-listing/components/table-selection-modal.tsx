"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, X } from "lucide-react"; // Đã thêm X

export function TableSelectionModal({ isOpen, onConfirm, onClose }: {
    isOpen: boolean,
    onConfirm: (val: string) => void,
    onClose: () => void
}) {
    const [val, setVal] = useState("");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. Backdrop: Gộp style đẹp + Logic click đóng */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose} // Click ra ngoài thì đóng
                        className="fixed inset-0 bg-[#0F2335]/80 backdrop-blur-md z-[100]"
                    />

                    {/* 2. Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] z-[101]"
                    >
                        <div className={cn(
                            "relative overflow-hidden flex flex-col items-center p-6",
                            "bg-[#204560]",
                            "rounded-[24px] border border-[#C5A059]/30",
                            "shadow-[0px_20px_50px_-10px_rgba(0,0,0,0.5)]"
                        )}>
                            {/* Họa tiết trang trí */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#C5A059]/10 to-transparent pointer-events-none" />

                            {/* --- NÚT X ĐÓNG MODAL --- */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-20"
                            >
                                <X size={20} />
                            </button>

                            {/* Icon Header */}
                            <div className="w-12 h-12 rounded-full bg-[#1A3A52] border border-[#C5A059]/30 flex items-center justify-center mb-4 shadow-lg z-10">
                                <UtensilsCrossed size={20} className="text-[#C5A059]" />
                            </div>

                            {/* Title */}
                            <h3 className="font-display text-xl font-bold text-white mb-1 tracking-wide">
                                Check-in Table
                            </h3>
                            <p className="text-[#C5A059]/80 text-xs text-center mb-6 px-2 font-light">
                                Please enter your table number.
                            </p>

                            {/* Input Field */}
                            <div className="relative w-full mb-6 group">
                                <input
                                    autoFocus
                                    type="text"
                                    value={val}
                                    onChange={(e) => setVal(e.target.value.toUpperCase())}
                                    placeholder="A-01"
                                    className={cn(
                                        "w-full text-3xl font-display font-bold text-center py-2",
                                        "bg-transparent text-white placeholder:text-white/10",
                                        "border-b-2 border-[#C5A059]/30 focus:border-[#C5A059]",
                                        "outline-none transition-all duration-300 tracking-widest"
                                    )}
                                />
                            </div>

                            {/* Confirm Button */}
                            <button
                                disabled={!val}
                                onClick={() => onConfirm(val)}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold uppercase tracking-[1.5px] text-xs transition-all duration-300",
                                    "shadow-lg active:scale-95",
                                    val
                                        ? "bg-[#C5A059] text-[#204560] hover:bg-[#D4AF6A] hover:shadow-[#C5A059]/20"
                                        : "bg-[#1A3A52] text-white/30 cursor-not-allowed"
                                )}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}