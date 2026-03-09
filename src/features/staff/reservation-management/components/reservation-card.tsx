import React from "react";
import { Clock, Armchair, Users, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ReservationDto } from "../types/reservation-types";
import { Badge } from "@/components/ui/badge";

interface ReservationCardProps {
    reservation: ReservationDto;
    onCheckIn?: () => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export const ReservationCard = ({ reservation,onCheckIn ,onEdit, onDelete }: ReservationCardProps) => {

    const getBadgeVariant = (statusId: number): any => {
        switch (statusId) {
            case 21: return "soft-secondary"; // PENDING
            case 22: return "soft-success";   // CONFIRMED / BOOKED
            case 23: return "soft-purple";    // CHECKED IN / PAID
            case 24: return "soft-danger";    // CANCELLED
            case 25: return "soft-warning";   // NO SHOW
            default: return "soft-secondary";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">

            {/* Header: Date & Customer Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-2.5 text-center shrink-0 min-w-[70px]">
                    <p className="text-white font-semibold text-[15px] m-0 leading-tight">
                        {format(new Date(reservation.reservedTime), "MMM dd")}
                        <span className="block text-xs font-normal text-gray-300 mt-1">
                            {format(new Date(reservation.reservedTime), "yyyy")}
                        </span>
                    </p>
                </div>

                <div className="flex-1 pt-0.5">
                    <h6 className="mb-2 font-semibold text-gray-900 text-lg leading-none">
                        {reservation.customerName}
                    </h6>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-[13px] text-gray-600 font-medium">
                        <p className="flex items-center m-0">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                            {format(new Date(reservation.reservedTime), "HH:mm")}
                        </p>
                        <div className="w-px h-3.5 bg-gray-300"></div>
                        <p className="flex items-center m-0">
                            <Armchair className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                            Table : {reservation.tableName || 'N/A'}
                        </p>
                        <div className="w-px h-3.5 bg-gray-300"></div>
                        <p className="flex items-center m-0">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                            Guests : {reservation.pax}
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider & Status */}
            <div className="mb-4 pb-4 border-b border-dashed border-gray-200">
                <div className="flex items-center justify-between gap-2 mb-3 text-[14px]">
                    <span className="text-gray-500">Created on</span>
                    <span className="text-gray-900 font-medium">
                        {reservation.createdAt ? format(new Date(reservation.createdAt), "dd MMM yyyy, h:mma") : "N/A"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[14px]">
                    <span className="text-gray-500">Status</span>
                    {/* Sử dụng Badge component chuẩn của hệ thống */}
                    <Badge
                        variant={getBadgeVariant(reservation.statusId)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium"
                    >
                        {reservation.statusName}
                    </Badge>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
                <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View Note
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit?.(reservation.reservationId)}
                        className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete?.(reservation.reservationId)}
                        className="p-2 text-red-500 bg-white border border-gray-200 rounded-full hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};