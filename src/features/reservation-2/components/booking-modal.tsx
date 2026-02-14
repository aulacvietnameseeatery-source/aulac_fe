import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, User, Phone, Mail, Users, Calendar, Clock, Download, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import domtoimage from 'dom-to-image-more';
import "../styles/index.css";
import { TableAvailabilityDto } from '../types/reservation.types';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; phone: string; email: string; partySize: number }) => Promise<boolean>;
    tables: TableAvailabilityDto[]; // Changed from single tableData
    date?: string;
    time?: string;
}

export default function BookingModal({ isOpen, onClose, onConfirm, tables, date, time }: BookingModalProps) {
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

    // Calculate total capacity
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const tableCodes = tables.map(t => t.tableCode).join(", ");
    const mainTable = tables[0]; // For image/zone

    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current && tables.length > 0) {
            setPartySize(totalCapacity);
            setName("");
            setPhone("");
            setEmail("");
            setView('form');
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, tables, totalCapacity]);

    if (!isOpen || tables.length === 0) return null;

    // Calculate end time (+2 hours)
    const getEndTime = (startTime: string | undefined): string => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = (hours + 2) % 24;
        return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const endTime = getEndTime(time);

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
            alert(t('alerts.ticketNotFound'));
            return;
        }

        try {
            const scale = 3;
            const dataUrl = await domtoimage.toPng(ticketRef.current, {
                quality: 1.0,
                bgcolor: '#FAF9F6', // Off-white background
                width: ticketRef.current.offsetWidth * scale,
                height: ticketRef.current.offsetHeight * scale,
                style: {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${ticketRef.current.offsetWidth}px`,
                    height: `${ticketRef.current.offsetHeight}px`
                },
            });

            const link = document.createElement('a');
            link.download = `AuLac-Reservation-${tableCodes || Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err: any) {
            console.error("Download error:", err);
            alert(t('alerts.downloadError'));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`
                    bg-white w-full overflow-hidden shadow-2xl flex flex-col relative
                    transition-all duration-300 ease-out
                    ${view === 'success'
                        ? 'max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh]'
                        : 'max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh]'
                    }
                `}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-30 bg-black/20 hover:bg-black/40 p-2 rounded-full text-white transition-all duration-200"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                {view === 'form' ? (
                    <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
                        {/* Header with Table Image */}
                        <div className="relative h-44 sm:h-52 shrink-0 overflow-hidden bg-gradient-to-br from-[#1A3A52] to-[#2d5a7b]">
                            <Image
                                width={1920}
                                height={1080}
                                src={mainTable?.imageUrl || "/images/table-selection/ground-floor/t-01.png"}
                                alt={tableCodes}
                                // fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                                {/* Zone Badge */}
                                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide w-fit mb-2">
                                    {mainTable?.zone}
                                </span>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                            {tableCodes}
                                        </h2>
                                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                                            <Users size={14} />
                                            <span>{totalCapacity} khách</span>
                                        </div>
                                    </div>

                                    {/* Time Range */}
                                    {date && time && (
                                        <div className="text-right">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-1 text-white/70 text-[10px] uppercase tracking-wide mb-0.5">
                                                    <Clock size={10} />
                                                    <span>Thời gian</span>
                                                </div>
                                                <div className="text-white font-bold text-sm">
                                                    {time} - {endTime}
                                                </div>
                                                <div className="text-white/70 text-xs">
                                                    {date}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Section - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
                            <h3 className="text-lg sm:text-xl font-bold text-[#1A3A52] mb-1">
                                {t("title")}
                            </h3>
                            <p className="text-stone-500 text-xs sm:text-sm mb-4 sm:mb-6">
                                {t("restaurantName")}
                            </p>

                            {/* Form Fields */}
                            <div className="space-y-3 sm:space-y-4">
                                {/* Name */}
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder={t("fullName")}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="tel"
                                        placeholder={t("phoneNumber")}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>

                                {/* Email & Party Size - 2 columns on larger screens */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input
                                            type="email"
                                            placeholder={`${t("emailAddress")}`}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
                                            placeholder={t("partySize")}
                                            value={partySize}
                                            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                                            className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-[#1A3A52] placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Bottom Actions */}
                        <div className="shrink-0 p-4 sm:p-6 bg-white border-t border-stone-100 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 px-4 border-2 border-stone-200 rounded-xl text-stone-600 font-semibold hover:bg-stone-50 transition-all text-sm sm:text-base"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!isFormValid || isSubmitting}
                                className={`flex-[1.5] py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${isFormValid
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
                                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {/*<Sparkles size={18} />*/}
                                        <span>{t("confirmBooking")}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Success View */
                    <div className="flex flex-col items-center p-5 sm:p-8 bg-gradient-to-b from-emerald-50 to-white max-h-[90vh] overflow-y-auto">
                        {/* Ticket */}
                        <div
                            ref={ticketRef}
                            className="bg-white rounded-2xl shadow-lg border border-stone-100 w-full max-w-xs mx-auto mb-6 overflow-hidden"
                        >
                            {/* Ticket Header */}
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-center relative">
                                <div className="bg-white/20 p-3 rounded-full w-fit mx-auto mb-3">
                                    <CheckCircle size={36} className="text-white" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-0.5">
                                    {t("confirmed")}
                                </h3>
                                <p className="text-emerald-100 text-xs">{t("tableReserved")}</p>
                            </div>

                            {/* Ticket Body */}
                            <div className="p-5">
                                <div className="text-center mb-4 pb-4 border-b border-dashed border-stone-200">
                                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">{t("restaurant")}</p>
                                    <p className="text-[#1A3A52] font-bold text-sm">{t("restaurantName")}</p>
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t("guestName")}</span>
                                        <span className="text-[#1A3A52] font-semibold">{name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t("date")}</span>
                                        <span className="text-[#1A3A52] font-semibold">{date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t("time")}</span>
                                        <span className="text-[#1A3A52] font-semibold">{time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Table</span>
                                        <span className="text-[#1A3A52] font-bold">{tableCodes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t("guests")}</span>
                                        <span className="text-[#1A3A52] font-semibold">{partySize}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold">
                                        {t("seeYouSoon")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col w-full max-w-xs gap-2.5">
                            <button
                                onClick={handleDownloadTicket}
                                className="w-full py-3.5 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                            >
                                <Download size={18} />
                                <span>{t("downloadTicket")}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 px-4 border-2 border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-all"
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
