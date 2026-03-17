import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { TableAvailabilityDto } from "../types/reservation.types";

interface MobileBookingSheetProps {
    selectedTable: TableAvailabilityDto | null;
    onBook: (guestInfo: {
        name: string;
        phone: string;
        email: string;
        partySize: number;
    }) => void;
    isOpen: boolean; // Controls visibility of the sheet entirely
    onClose: () => void; // Called when closing/resetting selection
}

export default function MobileBookingSheet({
    selectedTable,
    onBook,
    isOpen,
    onClose,
}: MobileBookingSheetProps) {
    const t = useTranslations("Reservation.Sidebar");
    const [isExpanded, setIsExpanded] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [partySize, setPartySize] = useState(2);

    useEffect(() => {
        if (selectedTable) {
            setPartySize(selectedTable.capacity);
            // Collapse when table changes initially
            setIsExpanded(false);
        }
    }, [selectedTable]);

    if (!selectedTable || !isOpen) return null;

    const isFormValid = name.trim().length > 0 && phone.trim().length > 0;

    const handleMainAction = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        } else {
            if (isFormValid) {
                onBook({ name, phone, email, partySize });
            }
        }
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
            {/* Backdrop when expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Sheet Content */}
            <div className={`bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-slate-100 transition-all duration-300 ease-out relative ${isExpanded ? 'h-auto max-h-[85vh]' : 'h-auto'}`}>

                {/* Drag/Close Handle Area */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="w-full flex justify-center">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    </div>
                    {isExpanded && (
                        <button onClick={() => setIsExpanded(false)} className="absolute right-4 top-3 text-slate-400 p-1">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Selected Table Summary */}
                <div className="px-5 pb-4">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t("table.label")}</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-[#1A3A52]">{selectedTable.tableCode}</h3>
                                <span className="text-sm text-stone-500 font-medium">({t("table.guests", { count: selectedTable.capacity })})</span>
                            </div>
                        </div>
                        {!isExpanded && (
                            <button
                                onClick={onClose}
                                className="text-stone-400 hover:text-stone-600 p-1"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Expanded Form */}
                    {isExpanded && (
                        <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className="space-y-3">
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder={t("guest.name")}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border border-[#D5BA98]/60 rounded-lg text-sm focus:outline-none focus:border-[#1A3A52] focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="tel"
                                        placeholder={t("guest.phone")}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border border-[#D5BA98]/60 rounded-lg text-sm focus:outline-none focus:border-[#1A3A52] focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="email"
                                        placeholder={t("guest.email")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border border-[#D5BA98]/60 rounded-lg text-sm focus:outline-none focus:border-[#1A3A52] focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border border-[#D5BA98]/60">
                                    <span className="text-sm font-semibold text-stone-500">Party Size</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={partySize}
                                        onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                                        className="w-16 text-center bg-white border border-slate-300 rounded-md py-1 text-sm font-bold text-[#1A3A52]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Action Button */}
                    <button
                        onClick={handleMainAction}
                        disabled={isExpanded && !isFormValid}
                        className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all active:scale-[0.98] ${isExpanded && !isFormValid
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[#1A3A52] text-white shadow-[#1A3A52]/20 hover:shadow-xl hover:shadow-[#1A3A52]/30"
                            }`}
                    >
                        {isExpanded ? t("action.book") : `Book ${selectedTable.tableCode}`}
                    </button>
                    <div className="safe-area-bottom h-4" />
                </div>
            </div>
        </div>
    );
}
