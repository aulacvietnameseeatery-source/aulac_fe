import React from 'react';
import Image from 'next/image';
import { X, Info, User, Phone, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import "../styles/index.css";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableData: {
    id: string;
    name: string;
    guests: number;
    image: string;
    date: string;
    time: string;
  } | null;
  guestInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function BookingModal({ isOpen, onClose, onConfirm, tableData, guestInfo }: BookingModalProps) {
  const t = useTranslations('reservations.public.bookingModal');

  if (!isOpen || !tableData) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-container fade-in zoom-in animate-in">
        <button
          onClick={onClose}
          className="booking-modal-close-button"
        >
          <X size={24} />
        </button>

        <div className="booking-modal-image-section">
          <Image
            width={1920}
            height={1080}
            src={tableData.image || "/placeholder.svg"}
            alt={tableData.name}
            fill
            className="object-cover"
          />
          <div className="booking-modal-image-overlay">
            <span className="booking-modal-image-label">
              {t("selectedTable")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">{tableData.name}</h2>
          </div>
        </div>

        <div className="booking-modal-right-section">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-stone-400 hover:text-slate-900 transition-colors hidden md:block"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <div>
            <h3 className="booking-modal-title">{t("title")}</h3>
            <p className="text-stone-400 italic text-sm mb-8">
              {t("restaurantName")}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 border-b border-stone-100 pb-6 sm:pb-8">
              <div>
                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  {t("date")}
                </span>
                <p className="text-[#1A3A52] font-bold text-lg">
                  {tableData.date}
                </p>
              </div>
              <div>
                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  {t("time")}
                </span>
                <p className="text-[#1A3A52] font-bold text-lg">
                  {tableData.time}
                </p>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  {t("guests")}
                </span>
                <p className="text-[#1A3A52] font-bold text-lg">
                  {t("guestsCount", { count: tableData.guests })}
                </p>
              </div>
            </div>

            {guestInfo && (
              <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-100 mb-6 sm:mb-8 space-y-3">
                <h4 className="text-xs font-bold text-[#1A3A52] uppercase tracking-widest mb-2">
                  {t("guestInfo")}
                </h4>

                {guestInfo.name && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <User size={16} className="text-amber-600" />
                    <span className="font-bold text-[#1A3A52]">
                      {guestInfo.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <Phone size={16} className="text-amber-600" />
                  <span>{guestInfo.phone}</span>
                </div>
                {guestInfo.email && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Mail size={16} className="text-amber-600" />
                    <span>{guestInfo.email}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 text-stone-500 text-[10px] sm:text-xs mb-6 sm:mb-8 bg-stone-50 p-3 rounded-lg border border-stone-100">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t("policy")}</p>
            </div>
          </div>

          <div className="booking-modal-buttons">
            <button
              onClick={onConfirm}
              className="booking-modal-button-confirm"
            >
              {t("confirm")}
            </button>
            <button
              onClick={onClose}
              className="booking-modal-button-cancel"
            >
              {t("changeSelection")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};