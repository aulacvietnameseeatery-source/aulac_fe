import React from "react";
import { User, Phone, Mail, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReservationDetailDto } from "../types/reservation-types";

interface CustomerInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const CustomerInfoSection = ({ reservation }: CustomerInfoSectionProps) => {
    const t = useTranslations("ReservationManagement.Detail.Customer");
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mb-5 border-b border-gray-100 pb-4">
                <User size={24} className="text-blue-600" />
                <h2>{t("title")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("fullName")}
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                        <User size={18} className="text-gray-400" />
                        {reservation.customerName}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("phoneNumber")}
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                        <Phone size={18} className="text-gray-400" />
                        {reservation.phone}
                    </div>
                </div>

                {reservation.email && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            {t("emailAddress")}
                        </label>
                        <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                            <Mail size={18} className="text-gray-400" />
                            {reservation.email}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("partySize")}
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                        <Users size={18} className="text-gray-400" />
                        {reservation.partySize} {reservation.partySize > 1 ? t("guests") : t("guest")}
                    </div>
                </div>
            </div>
        </div>
    );
};
