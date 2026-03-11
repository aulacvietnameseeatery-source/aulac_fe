"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useReservationDetail } from "@/features/staff/reservation-management/hooks/use-reservation-detail";
import { CustomerInfoSection } from "@/features/staff/reservation-management/components/customer-info-section";
import { BookingInfoSection } from "@/features/staff/reservation-management/components/booking-info-section";
import { TableInfoSection } from "@/features/staff/reservation-management/components/table-info-section";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

const ReservationDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const reservationId = Number(params.id);
    const t = useTranslations("ReservationManagement.Detail");
    
    const { reservation, isLoading, error } = useReservationDetail(reservationId);

    const handleBack = () => {
        router.push("/dashboard/reservations");
    };

    const handleEdit = () => {
        // TODO: Navigate to edit page or open edit modal
        router.push(`/dashboard/reservations/${reservationId}/edit`);
    };

    const handleDelete = () => {
        // TODO: Implement delete functionality
        console.log("Delete reservation", reservationId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-500 font-medium">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] p-6">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">{t("backToList")}</span>
                    </button>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-10 text-center">
                        <p className="text-red-600 text-lg font-semibold">
                            {error || t("notFound")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute permission={Permissions.ViewReservation}>
            <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">{t("back")}</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {t("title")}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Pencil size={16} />
                            {t("edit")}
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <Trash2 size={16} />
                            {t("delete")}
                        </Button>
                    </div>
                </div>

                {/* Reservation ID Badge */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <Tag size={16} className="text-blue-600" />
                        <span className="text-sm text-gray-600">{t("reservationId")}:</span>
                        <span className="font-mono font-bold text-blue-900">#{reservation.reservationId}</span>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    <CustomerInfoSection reservation={reservation} />
                    <BookingInfoSection reservation={reservation} />
                    <TableInfoSection reservation={reservation} />
                </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ReservationDetailPage;
