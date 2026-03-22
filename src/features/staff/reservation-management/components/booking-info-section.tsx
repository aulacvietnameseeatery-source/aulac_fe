import React from "react";
import { Calendar, Clock, Tag, Package } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ReservationDetailDto } from "../types/reservation-types";
import { Badge } from "@/components/ui/badge";

interface BookingInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const BookingInfoSection = ({ reservation }: BookingInfoSectionProps) => {
    const t = useTranslations("reservations.management.Detail.Booking");

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mb-5 border-b border-gray-100 pb-4">
                <Calendar size={24} className="text-blue-600" />
                <h2>{t("title")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("reservedDate")}
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                        <Calendar size={18} className="text-gray-400" />
                        {format(new Date(reservation.reservedTime), "EEEE, MMMM dd, yyyy")}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("reservedTime")}
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                        <Clock size={18} className="text-gray-400" />
                        {format(new Date(reservation.reservedTime), "HH:mm")}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("status")}
                    </label>
                    <div className="flex items-center">
                        <Badge
                            variant={getBadgeVariant(reservation.statusId)}
                            className="rounded-md px-3 py-1.5 text-sm font-medium"
                        >
                            {reservation.statusName}
                        </Badge>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t("bookingSource")}
                    </label>
                    <div className="flex items-center">
                        <Badge
                            variant={getSourceBadgeVariant(reservation.sourceCode)}
                            className="rounded-md px-3 py-1.5 text-sm font-medium"
                        >
                            {reservation.sourceName}
                        </Badge>
                    </div>
                </div>

                {reservation.createdAt && (
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            {t("createdOn")}
                        </label>
                        <div className="flex items-center gap-2 text-gray-900 font-medium text-base">
                            <Package size={18} className="text-gray-400" />
                            {format(new Date(reservation.createdAt), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
