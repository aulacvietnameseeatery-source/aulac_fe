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
    onAssignTable?: () => void; // <--- Đổi tên prop ở đây
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

    const getBadgeClasses = (statusId: number): string => {
        switch (statusId) {
            case 21: return "bg-amber-600 text-white border-amber-600"; // PENDING
            case 22: return "bg-blue-600 text-white border-blue-600";   // CONFIRMED
            case 23: return "bg-emerald-600 text-white border-emerald-600"; // CHECKED IN
            case 24: return "bg-red-600 text-white border-red-600";    // CANCELLED
            case 25: return "bg-red-500 text-white border-red-500";   // NO SHOW
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
            className={`relative border-[#D5BA98]/60 ${onCardClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="bg-[#1A3A52] rounded-lg p-2.5 text-center shrink-0 min-w-17.5">
                        <p className="text-white font-semibold text-[15px] m-0 leading-tight">
                            {dateUtils.formatLocal(reservation.reservedTime, "MMM dd")}
                            <span className="block text-xs font-normal text-white/75 mt-1">{dateUtils.formatLocal(reservation.reservedTime, "yyyy")}</span>
                        </p>
                    </div>
                    <div className="flex-1 min-w-0">
                    <h6 className="mb-2 font-semibold text-[#1A3A52] text-lg leading-none truncate">{reservation.customerName}</h6>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-[#1A3A52] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                        <Armchair className="w-3.5 h-3.5 text-white/85" />
                        <span>{t("table")}: {reservation.tableName || t("na")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#1A3A52]/65 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#1A3A52]/50" />
                        <span>{t("guests")}: {reservation.pax}</span>
                    </div>
                </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown align="end" trigger={
                        <Badge className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer hover:opacity-90 flex items-center gap-1.5 shadow-sm border ${getBadgeClasses(reservation.statusId)}`}>
                            {localizeStatusLabel(currentStatusCode, reservation.statusName, tStatus)} <ChevronDown size={12} className="opacity-70" />
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
                </div>
            </div>

            <div className="mb-4 p-3 rounded-lg border border-[#D5BA98]/60 bg-[#D5BA98]/10">
                <div className="text-[11px] uppercase tracking-wide text-[#1A3A52]/60 mb-1">{t("reservationTime")}</div>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[#1A3A52] font-semibold text-base">
                        {dateUtils.formatLocal(reservation.reservedTime, "dd/MM/yyyy")}
                    </span>
                    <span className="inline-flex items-center text-[#1A3A52] font-semibold text-sm">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-[#1A3A52]/60" />
                        {dateUtils.formatLocal(reservation.reservedTime, "HH:mm")}
                    </span>
                </div>
            </div>

            <div className="mb-4 pb-4 border-b border-dashed border-[#D5BA98]/45">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="text-[#1A3A52]/50">{t("createdOn")}</span>
                    <span className="text-[#1A3A52]/75 font-medium">
                        {reservation.createdAt ? dateUtils.formatLocal(reservation.createdAt, "dd MMM, HH:mm") : t("na")}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setIsNoteVisible(!isNoteVisible); }}
                    className={`h-auto py-1.5 px-3 text-[13px] font-medium transition-colors flex items-center gap-1.5 ${isNoteVisible ? 'bg-[#D5BA98]/18 text-[#1A3A52] hover:bg-[#D5BA98]/25' : 'text-[#1A3A52]/75 hover:bg-[#D5BA98]/10'}`}
                >
                    <FileText size={14} /> {t("viewNote")}
                </Button>
                {isNoteVisible && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-full z-10 p-3 bg-[#1A3A52] text-white text-sm rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <p className="font-semibold mb-1 text-white/75">{t("customerNotes")}</p>
                        <p className="whitespace-pre-wrap">{reservation.notes || t("noNotes")}</p>
                        <div className="absolute -bottom-1 left-8 w-3 h-3 bg-[#1A3A52] rotate-45" />
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(reservation.reservationId); }}
                        className="h-8 w-8 text-[#1A3A52]/70 hover:text-[#1A3A52] hover:bg-[#D5BA98]/15 rounded-full"
                    >
                        <Pencil size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(reservation.reservationId); }}
                        className="h-8 w-8 text-[#8C3A3A] hover:text-red-700 hover:bg-red-50 rounded-full"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

        </ALCard>
    );
};