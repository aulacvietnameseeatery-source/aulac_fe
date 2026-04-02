import React from "react";
import { Armchair, MapPin, Users as UsersIcon, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReservationDetailDto } from "../types/reservation-types";

interface TableInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const TableInfoSection = ({ reservation }: TableInfoSectionProps) => {
    const t = useTranslations("reservations.management.detail.table");
    const tStaffTable = useTranslations("reservations.staff.table");

    return (
        <div className="pb-6 sm:pb-8 last:border-0 relative">
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <MapPin size={24} className="text-blue-600" />
                    <h2>{tStaffTable("availability")}</h2>
                </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-dashed border-slate-200 min-h-[160px] flex flex-col shadow-inner">
                {reservation.tables.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-8">
                        <Armchair size={48} className="mb-3 opacity-20" />
                        <p className="font-medium">{t("noTables")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {reservation.tables.map((table) => (
                            <div
                                key={table.tableId}
                                className="relative rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all border-2 bg-blue-600 border-blue-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="font-bold text-lg text-center">{table.tableCode}</span>
                                <div className="text-xs flex gap-2 text-blue-100">
                                    <span className="flex items-center gap-1"><UsersIcon size={12} /> {table.capacity}</span>
                                    <span>•</span>
                                    <span>{table.zone}</span>
                                </div>
                                <div className="text-[11px] mt-1 text-blue-100 font-medium">
                                    {table.tableType}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reservation.tables.length > 0 && (
                <div className="mt-4 flex justify-end">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
                        <Tag size={12} />
                        {t("totalTables")}: {reservation.tables.length}
                    </div>
                </div>
            )}
        </div>
    );
};
