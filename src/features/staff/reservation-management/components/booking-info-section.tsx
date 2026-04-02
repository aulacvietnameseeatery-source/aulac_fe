import React from "react";
import { Calendar, Clock, Tag, Package } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ReservationDetailDto } from "../types/reservation-types";
import { Badge } from "@/components/ui/badge";
import { localizeSourceLabel, localizeStatusLabel } from "../utils/localize-reservation";

interface BookingInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const BookingInfoSection = ({ reservation }: BookingInfoSectionProps) => {
    const t = useTranslations("reservations.management.detail.booking");
    const tStatus = useTranslations("reservations.management.status");
    const tSource = useTranslations("reservations.management.source");
    const tCustomer = useTranslations("reservations.management.detail.customer");

    const getBadgeVariant = (statusId: number): any => {
        switch (statusId) {
            case 21: return "soft-secondary"; // PENDING
            case 22: return "soft-success";   // CONFIRMED
            case 23: return "soft-purple";    // CHECKED IN
            case 24: return "soft-danger";    // CANCELLED
            case 25: return "soft-warning";   // NO SHOW
            default: return "soft-secondary";
        }
    };

    const getSourceBadgeVariant = (sourceCode: string): any => {
        switch (sourceCode.toUpperCase()) {
            case "ONLINE": return "soft-info";
            case "PHONE": return "soft-success";
            case "WALK_IN": return "soft-warning";
            default: return "soft-secondary";
        }
    };

    return (
        <div className="border-b border-slate-100 pb-6 sm:pb-8 last:border-0 relative">
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <Calendar size={24} className="text-blue-600" />
                    <h2>{t("title")}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("reservedDate")}
                    </label>
                    <div className="text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Calendar size={18} className="text-slate-400" />
                        {format(new Date(reservation.reservedTime), "dd/MM/yyyy")}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("reservedTime")}
                    </label>
                    <div className="text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Clock size={18} className="text-slate-400" />
                        {format(new Date(reservation.reservedTime), "HH:mm")}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {tCustomer("partySize")}
                    </label>
                    <div className="text-slate-900 font-semibold text-base py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Package size={18} className="text-slate-400" />
                        {reservation.partySize} {reservation.partySize > 1 ? tCustomer("guests") : tCustomer("guest")}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("status")}
                    </label>
                    <div className="py-1 flex items-center h-[54px]">
                        <Badge
                            variant={getBadgeVariant(reservation.statusId)}
                            className="rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-tight"
                        >
                            {localizeStatusLabel(reservation.statusCode, reservation.statusName, tStatus)}
                        </Badge>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t("bookingSource")}
                    </label>
                     <div className="py-1 flex items-center h-[54px]">
                        <Badge
                            variant={getSourceBadgeVariant(reservation.sourceCode)}
                            className="rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-tight"
                        >
                            {localizeSourceLabel(reservation.sourceCode, reservation.sourceName, tSource)}
                        </Badge>
                    </div>
                </div>

                 {reservation.createdAt && (
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {t("createdOn")}
                        </label>
                        <div className="text-slate-500 font-medium text-sm py-3 px-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                            <Tag size={14} className="text-slate-400" />
                            {format(new Date(reservation.createdAt), "dd/MM/yyyy HH:mm")}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
