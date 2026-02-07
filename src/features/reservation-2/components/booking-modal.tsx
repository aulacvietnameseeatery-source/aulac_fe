import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, User, Phone, Mail, Users, Calendar, Clock, Download, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import domtoimage from 'dom-to-image-more';
import "../styles/index.css";
import { TableAvailabilityDto } from '../types/reservation.types';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; phone: string; email: string; partySize: number }) => Promise<boolean>;
    tableData: TableAvailabilityDto | null;
    date?: string;
    time?: string;
}

export default function BookingModal({ isOpen, onClose, onConfirm, tableData, date, time }: BookingModalProps) {
    const t = useTranslations('Reservation.BookingModal');

    // View State: 'form' | 'success'
    const [view, setView] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Input State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [partySize, setPartySize] = useState(2);

    const ticketRef = useRef<HTMLDivElement>(null);
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
        // Only reset when modal transitions from closed to open
        if (isOpen && !prevIsOpenRef.current && tableData) {
            setPartySize(tableData.capacity);
            setName("");
            setPhone("");
            setEmail("");
            setView('form');
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, tableData]);

    if (!isOpen || !tableData) return null;

    const isFormValid = name.trim().length > 0 && phone.trim().length > 0 && partySize > 0;

    const handleConfirm = async () => {
        if (isFormValid) {
            setIsSubmitting(true);
            try {
                const success = await onConfirm({ name, phone, email, partySize });
                if (success) {
                    setView('success');
                }
            } catch (error) {
                console.error("Booking failed", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDownloadTicket = async () => {
        if (!ticketRef.current) {
            alert("Không tìm thấy vé. Vui lòng thử lại.");
            return;
        }

        try {
            console.log("Đang tải vé...");

            // High quality settings for crisp image
            const scale = 3;
            const dataUrl = await domtoimage.toPng(ticketRef.current, {
                quality: 1.0,
                width: ticketRef.current.offsetWidth * scale,
                height: ticketRef.current.offsetHeight * scale,
                style: {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${ticketRef.current.offsetWidth}px`,
                    height: `${ticketRef.current.offsetHeight}px`
                },
                pixelRatio: scale
            });

            // Download
            const link = document.createElement('a');
            link.download = `AuLac-Reservation-${tableData?.tableCode || Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            console.log("✅ Tải xuống thành công!");
        } catch (err: any) {
            console.error("❌ Lỗi:", err);
            alert("Không thể tải xuống. Vui lòng chụp màn hình (Win + Shift + S)");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
            <div className={`bg-white w-full overflow-hidden rounded-2xl shadow-2xl flex flex-col relative duration-500 ease-out animate-in zoom-in-95 ${view === 'success' ? 'max-w-md max-h-[90vh]' : 'max-w-2xl max-h-[95vh]'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-2 rounded-full text-stone-600 hover:text-stone-900 transition-all shadow-lg hover:shadow-xl hover:scale-110 duration-200"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {view === 'form' ? (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Image Header Section */}
                        <div className="w-full relative h-56 shrink-0 overflow-hidden">
                            <Image
                                src={tableData.imageUrl || "/images/placeholder-table.jpg"}
                                alt={tableData.tableCode}
                                fill
                                className="object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                {/* Zone Badge */}
                                <div className="inline-flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                    <Sparkles size={14} className="text-amber-300" />
                                    <span className="text-white/95 text-xs md:text-sm font-semibold uppercase tracking-wide">
                                        {tableData.zone}
                                    </span>
                                </div>

                                {/* Table Info */}
                                <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                    {tableData.tableCode}
                                </h2>

                                {/* Info Tags */}
                                <div className="flex flex-wrap gap-2 text-white/95">
                                    <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                        <Users size={16} />
                                        <span className="text-sm font-medium">{tableData.capacity} Guests</span>
                                    </div>
                                    {(date && time) && (
                                        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                            <Calendar size={16} />
                                            <span className="text-sm font-medium">{date}</span>
                                            <span className="mx-0.5">•</span>
                                            <Clock size={16} />
                                            <span className="text-sm font-medium">{time}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="flex-1 p-8 flex flex-col overflow-y-auto bg-gradient-to-br from-white to-stone-50/30">
                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-[#1A3A52] mb-1 tracking-tight">
                                    {t("title")}
                                </h3>
                                <p className="text-stone-500 text-sm md:text-base flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {t("restaurantName")}
                                </p>
                            </div>

                            {/* Guest Form */}
                            <div className="space-y-4 mb-6 flex-1">
                                <label className="block text-[10px] font-extrabold text-stone-500 uppercase tracking-[0.15em] mb-3">
                                    {t("guestInfo")}
                                </label>

                                {/* Name Input */}
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-all duration-300">
                                        <User size={19} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t("fullName")}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-stone-200/80 rounded-xl text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300 hover:border-stone-300"
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-all duration-300">
                                        <Phone size={19} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder={t("phoneNumber")}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-stone-200/80 rounded-xl text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300 hover:border-stone-300"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-all duration-300">
                                        <Mail size={19} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder={t("emailAddress")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-stone-200/80 rounded-xl text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300 hover:border-stone-300"
                                    />
                                </div>

                                {/* Party Size Input */}
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-all duration-300">
                                        <Users size={19} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        placeholder={t("partySize")}
                                        value={partySize}
                                        onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-stone-200/80 rounded-xl text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300 hover:border-stone-300"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-stone-100">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 border-2 border-stone-200 rounded-xl text-stone-700 font-semibold hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 text-base hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!isFormValid || isSubmitting}
                                    className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2.5 text-base shadow-lg relative overflow-hidden group ${isFormValid
                                        ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isFormValid && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    )}
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={20} className="animate-pulse" />
                                            <span className="relative z-10">{t("confirmBooking")}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Success View - Premium Ticket Design */
                    <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-emerald-50 via-white to-blue-50 h-full overflow-y-auto">
                        {/* Ticket */}
                        <div
                            ref={ticketRef}
                            data-html2canvas-ignore="false"
                            className="bg-white rounded-2xl shadow-xl border-2 border-stone-100 w-full max-w-sm mx-auto mb-8 overflow-hidden"
                        >
                            {/* Ticket Header */}
                            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                                <div className="relative">
                                    <div className="flex justify-center mb-3">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full ring-4 ring-white/30">
                                            <CheckCircle size={52} className="text-white drop-shadow-2xl" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                                        {t("confirmed")}
                                    </h3>
                                    <p className="text-emerald-50 text-sm font-medium">{t("tableReserved")}</p>
                                </div>
                            </div>

                            {/* Ticket Body */}
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <p className="text-stone-500 text-xs uppercase tracking-wider mb-1 font-bold">{t("restaurant")}</p>
                                    <p className="text-[#1A3A52] font-bold text-lg">{t("restaurantName")}</p>
                                </div>

                                <div className="space-y-4 py-6 border-y-2 border-dashed border-stone-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">{t("guestName")}</span>
                                        <span className="text-[#1A3A52] font-bold">{name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">{t("date")}</span>
                                        <span className="text-[#1A3A52] font-bold">{date}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">{t("time")}</span>
                                        <span className="text-[#1A3A52] font-bold">{time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">Table</span>
                                        <span className="text-[#1A3A52] font-bold">{tableData.tableCode}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">{t("zone")}</span>
                                        <span className="text-[#1A3A52] font-bold">{tableData.zone}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-500 text-sm font-medium">{t("guests")}</span>
                                        <span className="text-[#1A3A52] font-bold">{partySize} {t("guests")}</span>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <p className="text-[10px] md:text-xs text-stone-400 uppercase tracking-widest font-semibold">
                                        {t("seeYouSoon")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col w-full max-w-sm gap-3">
                            <button
                                onClick={handleDownloadTicket}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                <Download size={22} className="relative z-10" />
                                <span className="relative z-10">{t("downloadTicket")}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 px-6 border-2 border-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
