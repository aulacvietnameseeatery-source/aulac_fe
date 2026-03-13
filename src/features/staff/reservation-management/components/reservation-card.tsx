import React, { useState } from "react";
import { Clock, Armchair, Users, Pencil, Trash2, ChevronDown, FileText, Edit } from "lucide-react";
import { format } from "date-fns";
import { ReservationDto, ReservationStatusDto } from "../types/reservation-types";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownContent, DropdownItem } from "@/components/ui/dropdown";

interface ReservationCardProps {
    reservation: ReservationDto;
    statuses: ReservationStatusDto[];
    onAssignTable?: () => void; // <--- Đổi tên prop ở đây
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onCardClick?: (id: number) => void;
    onStatusUpdate?: (id: number, statusCode: string) => void;
}

export const ReservationCard = ({ reservation, statuses, onAssignTable, onEdit, onDelete, onCardClick, onStatusUpdate }: ReservationCardProps) => {
    const [isNoteVisible, setIsNoteVisible] = useState(false);

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

    return (
        <div onClick={() => onCardClick?.(reservation.reservationId)} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative ${onCardClick ? 'cursor-pointer' : ''}`}>
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-2.5 text-center shrink-0 min-w-[70px]">
                    <p className="text-white font-semibold text-[15px] m-0 leading-tight">
                        {format(new Date(reservation.reservedTime), "MMM dd")}
                        <span className="block text-xs font-normal text-gray-300 mt-1">{format(new Date(reservation.reservedTime), "yyyy")}</span>
                    </p>
                </div>
                <div className="flex-1 pt-0.5">
                    <h6 className="mb-2 font-semibold text-gray-900 text-lg leading-none">{reservation.customerName}</h6>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-[13px] text-gray-600 font-medium">
                        <p className="flex items-center m-0"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />{format(new Date(reservation.reservedTime), "HH:mm")}</p>
                        <div className="w-px h-3.5 bg-gray-300"></div>
                        <p className="flex items-center m-0"><Armchair className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                            {/* Hiển thị chuỗi tên bàn (T01, T02...) */}
                            Bàn: {reservation.tableName || 'Chưa gán'}
                        </p>
                        <div className="w-px h-3.5 bg-gray-300"></div>
                        <p className="flex items-center m-0"><Users className="w-3.5 h-3.5 mr-1.5 text-gray-500" />Khách: {reservation.pax}</p>
                    </div>
                </div>
            </div>

            {/* Divider & Status Dropdown */}
            <div className="mb-4 pb-4 border-b border-dashed border-gray-200">
                <div className="flex items-center justify-between gap-2 mb-3 text-[14px]">
                    <span className="text-gray-500">Created on</span>
                    <span className="text-gray-900 font-medium">{reservation.createdAt ? format(new Date(reservation.createdAt), "dd MMM, HH:mm") : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[14px]">
                    <span className="text-gray-500">Status</span>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown align="end" trigger={
                            <Badge variant={getBadgeVariant(reservation.statusId)} className="rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 flex items-center gap-1.5 shadow-sm border border-transparent hover:border-gray-300">
                                {reservation.statusName} <ChevronDown size={12} className="opacity-70" />
                            </Badge>
                        }>
                            <DropdownContent className="w-40 z-50">
                                {statuses.map(s => (
                                    <DropdownItem key={s.statusId} selected={s.statusId === reservation.statusId} onClick={() => {
                                        // NẾU BẤM CONFIRMED MÀ CHƯA CÓ BÀN -> MỞ MODAL XẾP BÀN
                                        if (s.statusCode === 'CONFIRMED' && !reservation.tableName) {
                                            if (onAssignTable) onAssignTable();
                                        } else {
                                            // CÒN LẠI GỌI API ĐỔI TRẠNG THÁI BÌNH THƯỜNG
                                            onStatusUpdate?.(reservation.reservationId, s.statusCode);
                                        }
                                    }}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-${getBadgeVariant(s.statusId).replace('soft-', '')}-500`} />
                                            {s.statusName}
                                        </div>
                                    </DropdownItem>
                                ))}
                            </DropdownContent>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between relative">
                <button onClick={(e) => { e.stopPropagation(); setIsNoteVisible(!isNoteVisible); }} className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors flex items-center gap-1.5 ${isNoteVisible ? 'bg-gray-100 text-gray-900' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>
                    <FileText size={14} /> Ghi chú
                </button>
                {isNoteVisible && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-full z-10 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-xl">
                        <p className="font-semibold mb-1 text-gray-300">Ghi chú:</p>
                        <p className="whitespace-pre-wrap">{reservation.notes || "Không có ghi chú."}</p>
                        <div className="absolute -bottom-1 left-8 w-3 h-3 bg-gray-800 rotate-45" />
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(reservation.reservationId); }} className="p-2 text-gray-600 bg-white border border-gray-200 rounded-full hover:text-blue-600 hover:bg-blue-50 shadow-sm"><Edit size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(reservation.reservationId); }} className="p-2 text-red-500 bg-white border border-gray-200 rounded-full hover:text-red-700 hover:bg-red-50 shadow-sm"><Trash2 size={18} /></button>
                </div>
            </div>
        </div>
    );
};