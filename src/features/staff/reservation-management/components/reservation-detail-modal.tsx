"use client";

import React from "react";
import { Loader2, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useReservationDetail } from "../hooks/use-reservation-detail";
import { CustomerInfoSection } from "./customer-info-section";
import { BookingInfoSection } from "./booking-info-section";
import { TableInfoSection } from "./table-info-section";

interface ReservationDetailModalProps {
    reservationId: number | null;
    open: boolean;
    onClose: () => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export const ReservationDetailModal = ({
    reservationId,
    open,
    onClose,
    onEdit,
    onDelete,
}: ReservationDetailModalProps) => {
    const t = useTranslations("reservations.management.detail");
    const { reservation, isLoading, error } = useReservationDetail(reservationId ?? 0);

    if (!reservationId) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t("title")}
            width="min(960px, 95vw)"
            bodyOverflowY="hidden"
        >
            <div className="flex h-[min(85dvh,800px)] flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-200 bg-slate-50/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                            <p className="text-gray-500 font-medium">{t("loading")}</p>
                        </div>
                    ) : error || !reservation ? (
                        <div className="bg-white rounded-xl border border-red-200 p-12 text-center shadow-sm">
                            <p className="text-red-600 text-lg font-semibold">
                                {error || t("notFound")}
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Reservation ID Badge */}
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
                                <Tag size={16} className="text-blue-600" />
                                <span className="text-sm text-gray-600 font-medium">{t("reservationId")}:</span>
                                <span className="font-mono font-bold text-blue-900 ml-1">#{reservation.reservationId}</span>
                            </div>

                            {/* Content Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <CustomerInfoSection reservation={reservation} />
                                    <BookingInfoSection reservation={reservation} />
                                </div>
                                <div>
                                    <TableInfoSection reservation={reservation} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <Button
                            onClick={() => reservation && onEdit?.(reservation.reservationId)}
                            variant="outline"
                            className="flex-1 sm:flex-initial flex items-center gap-2 font-semibold"
                            disabled={isLoading || !!error}
                        >
                            <Pencil size={16} />
                            {t("edit")}
                        </Button>
                        <Button
                            onClick={() => reservation && onDelete?.(reservation.reservationId)}
                            variant="outline"
                            className="flex-1 sm:flex-initial flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold"
                            disabled={isLoading || !!error}
                        >
                            <Trash2 size={16} />
                            {t("delete")}
                        </Button>
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

                    <Button onClick={onClose} variant="ghost" className="font-semibold text-slate-600">
                        {t("back")}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
