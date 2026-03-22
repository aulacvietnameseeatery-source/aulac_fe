import React from "react";
import { Armchair, MapPin, Users as UsersIcon, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReservationDetailDto } from "../types/reservation-types";

interface TableInfoSectionProps {
    reservation: ReservationDetailDto;
}

export const TableInfoSection = ({ reservation }: TableInfoSectionProps) => {
    const t = useTranslations("reservations.management.Detail.Table");

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mb-5 border-b border-gray-100 pb-4">
                <Armchair size={24} className="text-blue-600" />
                <h2>{t("title")}</h2>
            </div>

            {reservation.tables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Armchair className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t("noTables")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservation.tables.map((table) => (
                        <div
                            key={table.tableId}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Armchair size={20} className="text-blue-600" />
                                    <span className="font-bold text-gray-900 text-lg">
                                        {table.tableCode}
                                    </span>
                                </div>
                                <div className="px-2 py-1 bg-white/80 rounded-md border border-blue-200">
                                    <span className="text-xs font-semibold text-blue-700">
                                        {table.tableType}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span className="font-medium">{table.zone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <UsersIcon size={16} className="text-gray-500" />
                                    <span>{t("capacity")}: <span className="font-semibold">{table.capacity}</span></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {reservation.tables.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        {t("totalTables")}: <span className="font-semibold text-gray-900">{reservation.tables.length}</span>
                    </p>
                </div>
            )}
        </div>
    );
};
