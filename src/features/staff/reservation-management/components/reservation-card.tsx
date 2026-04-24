import { useState } from "react";
import { Clock, Armchair, Users, Trash2, ChevronDown, FileText, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReservationDto, ReservationStatusDto } from "../types/reservation-types";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownContent, DropdownItem } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import { localizeStatusLabel } from "../utils/localize-reservation";
import { dateUtils } from "@/lib/date-utils";

interface ReservationCardProps {
    reservation: ReservationDto;
    statuses: ReservationStatusDto[];
    onAssignTable?: () => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onCardClick?: (id: number) => void;
    onStatusUpdate?: (id: number, statusCode: string) => void;
}

export const ReservationCard = ({ reservation, statuses, onAssignTable, onEdit, onDelete, onCardClick, onStatusUpdate }: ReservationCardProps) => {
    const t = useTranslations("reservations.management.card");
    const tStatus = useTranslations("reservations.management.status");
    const [isNoteVisible, setIsNoteVisible] = useState(false);

    const currentStatusCode = statuses.find((s) => s.statusId === reservation.statusId)?.statusCode;

    const TERMINAL_STATUSES = ['CANCELLED', 'NO_SHOW', 'COMPLETED'];
    const isTerminal = TERMINAL_STATUSES.includes(currentStatusCode ?? '');

    const getBadgeClasses = (statusId: number): string => {
        switch (statusId) {
            case 21: return "bg-amber-600 text-white border-amber-600"; // PENDING
            case 22: return "bg-blue-600 text-white border-blue-600";   // CONFIRMED
            case 23: return "bg-emerald-600 text-white border-emerald-600"; // CHECKED IN
            case 24: return "bg-red-600 text-white border-red-600";    // CANCELLED
            case 25: return "bg-red-500 text-white border-red-500";   // NO SHOW
            case 26: return "bg-slate-500 text-white border-slate-500"; // COMPLETED
            default: return "bg-slate-600 text-white border-slate-600";
        }
    };

    const getStatusDotClass = (statusId: number): string => {
        switch (statusId) {
            case 21: return "bg-amber-500";
            case 22: return "bg-blue-500";
            case 23: return "bg-emerald-500";
            case 24: return "bg-red-500";
            case 25: return "bg-red-400";
            case 26: return "bg-slate-400"; // COMPLETED
            default: return "bg-slate-500";
        }
    };

    return (
        <ALCard
            onClick={() => onCardClick?.(reservation.reservationId)}
            variant="default"
            elevation="sm"
            radius="xl"
            padding="md"
            hoverEffect={onCardClick ? "lift" : "none"}
            className={`relative border-[#D5BA98]/60 flex flex-col aspect-square overflow-hidden ${onCardClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between gap-2 mb-3 shrink-0">
                <div className="bg-[#1A3A52] rounded-lg px-2 py-1.5 text-center shrink-0 shadow-sm">
                    <p className="text-white font-bold text-xs m-0 leading-tight flex items-baseline gap-1">
                        {dateUtils.formatLocal(reservation.reservedTime, "MMM dd")}
                        <span className="text-[9px] font-normal text-white/75">{dateUtils.formatLocal(reservation.reservedTime, "yyyy")}</span>
                    </p>
                </div>

                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {isTerminal ? (
                        <Badge className={`rounded-md px-2 py-1 text-[10px] font-bold cursor-default flex items-center gap-1 shadow-sm border ${getBadgeClasses(reservation.statusId)}`}>
                            {localizeStatusLabel(currentStatusCode, reservation.statusName, tStatus)}
                        </Badge>
                    ) : (
                    <Dropdown align="end" trigger={
                        <Badge className={`rounded-md px-2 py-1 text-[10px] font-bold cursor-pointer hover:opacity-90 flex items-center gap-1 shadow-sm border ${getBadgeClasses(reservation.statusId)}`}>
                            {localizeStatusLabel(currentStatusCode, reservation.statusName, tStatus)} <ChevronDown size={10} className="opacity-70" />
                        </Badge>
                    }>
                        <DropdownContent className="w-40 z-50">
                            {statuses.map(s => (
                                <DropdownItem key={s.statusId} selected={s.statusId === reservation.statusId} onClick={() => {
                                    if (s.statusCode === 'CONFIRMED' && !reservation.tableName) {
                                        if (onAssignTable) onAssignTable();
                                    } else {
                                        onStatusUpdate?.(reservation.reservationId, s.statusCode);
                                    }
                                }}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusDotClass(s.statusId)}`} />
                                        {localizeStatusLabel(s.statusCode, s.statusName, tStatus)}
                                    </div>
                                </DropdownItem>
                            ))}
                        </DropdownContent>
                    </Dropdown>
                    )}
                </div>
            </div>

            {/* Thân Card: Tên khách hàng */}
            <div className="flex-1 min-h-0 mb-3 flex flex-col justify-center">
                <h6 className="font-bold text-[#1A3A52] text-lg leading-tight mb-2 line-clamp-2">
                    {reservation.customerName}
                </h6>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">
                        <Armchair className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[80px]">{reservation.tableName || t("na")}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#1A3A52]/75 font-semibold bg-slate-50 border border-slate-100 rounded-md px-2 py-1">
                        <Users className="w-3 h-3 text-[#1A3A52]/50" />
                        <span>{reservation.pax} {t("guests")}</span>
                    </div>
                </div>
            </div>

            {/* Thông tin phụ (Đã được thu gọn padding lại chút xíu cho vừa khung vuông) */}
            <div className="shrink-0 mb-3 p-2 rounded-lg border border-[#D5BA98]/60 bg-[#D5BA98]/10">
                <div className="text-[9px] uppercase tracking-wider font-bold text-[#1A3A52]/50 mb-1">{t("reservationTime")}</div>
                <div className="flex items-center justify-between gap-1">
                    <span className="text-[#1A3A52] font-bold text-[13px]">
                        {dateUtils.formatLocal(reservation.reservedTime, "dd/MM")}
                    </span>
                    <span className="inline-flex items-center text-[#1A3A52] font-bold text-[13px] bg-white/50 px-1.5 py-0.5 rounded-md shadow-sm">
                        <Clock className="w-3 h-3 mr-1 text-[#1A3A52]/60" />
                        {dateUtils.formatLocal(reservation.reservedTime, "HH:mm")}
                    </span>
                </div>
            </div>

            <div className="shrink-0 mb-3 pb-3 border-b border-dashed border-[#D5BA98]/45">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#1A3A52]/50 font-medium">{t("createdOn")}</span>
                    <span className="text-[#1A3A52]/75 font-semibold">
                        {reservation.createdAt ? dateUtils.formatLocal(reservation.createdAt, "dd MMM, HH:mm") : t("na")}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center justify-between relative mt-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setIsNoteVisible(!isNoteVisible); }}
                    className={`h-auto py-1 px-2 text-[11px] font-semibold transition-colors flex items-center gap-1 ${isNoteVisible ? 'bg-[#D5BA98]/20 text-[#1A3A52]' : 'text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-[#D5BA98]/10'}`}
                >
                    <FileText size={12} /> {t("viewNote")}
                </Button>

                {isNoteVisible && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-full z-10 p-3 bg-[#1A3A52] text-white text-xs rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/10 max-h-24 overflow-y-auto custom-scrollbar">
                        <p className="font-semibold text-[10px] uppercase tracking-wider mb-1 text-[#D5BA98]">{t("customerNotes")}</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{reservation.notes || t("noNotes")}</p>
                    </div>
                )}

                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(reservation.reservationId); }}
                        className="h-7 w-7 text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-[#D5BA98]/20 rounded-lg"
                    >
                        <Pencil size={14} />
                    </Button>
                </div>
            </div>
        </ALCard>
    );
};