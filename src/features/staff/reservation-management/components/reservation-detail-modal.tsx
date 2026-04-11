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
import { NotesInfoSection } from "./notes-info-section";

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
            width="min(960px, 96vw)"
            bodyOverflowY="hidden"
        >
            <div className="flex h-[min(82dvh,760px)] flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-gray-200 bg-slate-50/30">
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
                        <div className="space-y-4 sm:space-y-5">
                            {/* Reservation ID Badge */}
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
                                <Tag size={16} className="text-blue-600" />
                                <span className="text-sm text-gray-600 font-medium">{t("reservationId")}:</span>
                                <span className="font-mono font-bold text-blue-900 ml-1">#{reservation.reservationId}</span>
                            </div>

                            {/* Content Sections - Single Column to match Edit Modal */}
                            <CustomerInfoSection reservation={reservation} />
                            <BookingInfoSection reservation={reservation} />
                            <NotesInfoSection notes={reservation.notes} />
                            <TableInfoSection reservation={reservation} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 rounded-b-xl">
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
