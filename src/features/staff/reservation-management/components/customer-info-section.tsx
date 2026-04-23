import React from "react";
import { User, Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPhoneToDomesticDisplay } from "@/lib/phone-format";
import { ReservationDetailDto } from "../types/reservation-types";

interface CustomerInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const CustomerInfoSection = ({ reservation }: CustomerInfoSectionProps) => {
    const t = useTranslations("reservations.management.detail.customer");
    const displayPhone = formatPhoneToDomesticDisplay(reservation.phone);

    return (
        <div className="border-b border-slate-100 pb-6 sm:pb-8 last:border-0 relative">
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <User size={24} className="text-blue-600" />
                    <h2>{t("title")}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("phoneNumber")}
                    </label>
                    <div className="text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Phone size={18} className="text-slate-400" />
                        {displayPhone}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("fullName")}
                    </label>
                    <div className="text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <User size={18} className="text-slate-400" />
                        {reservation.customerName}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("emailAddress")}
                    </label>
                    <div className={`text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 ${!reservation.email && 'italic text-slate-400'}`}>
                        <Mail size={18} className="text-slate-400" />
                        {reservation.email || t("noEmail")}
                    </div>
                </div>
            </div>
        </div>
    );
};
