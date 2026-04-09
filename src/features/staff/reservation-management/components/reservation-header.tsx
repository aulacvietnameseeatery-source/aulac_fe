import React, { useState } from "react";
import { Search, Calendar as CalendarIcon, ArrowUpDown, Filter, User, Armchair, X } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { ReservationStatusDto } from "../types/reservation-types";
import { localizeStatusLabel } from "../utils/localize-reservation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ReservationHeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    currentStatusId: number | null;
    onStatusChange: (id: number | null) => void;
    statuses: ReservationStatusDto[];

    sortBy?: string; // 'createdAt' | 'reservedDate'
    onSortChange?: (val: string) => void;
    creatorFilter?: string | null;
    onCreatorFilterChange?: (val: string | null) => void;
    tableFilter?: string | null;
    onTableFilterChange?: (val: string | null) => void;
}

export const ReservationHeader = ({
                                      searchTerm,
                                      onSearchChange,
                                      currentDate,
                                      onDateChange,
                                      currentStatusId,
                                      onStatusChange,
                                      statuses,
                                      sortBy = 'createdAt',
                                      onSortChange,
                                      creatorFilter = null,
                                      onCreatorFilterChange,
                                      tableFilter = null,
                                      onTableFilterChange
                                  }: ReservationHeaderProps) => {
    const t = useTranslations("reservations.management.list");
    const tStatus = useTranslations("reservations.management.status");

    const [mockUsers] = useState([{ id: '1', name: 'Admin' }, { id: '2', name: 'Staff Hưng' }]);
    const [mockTables] = useState([{ id: 'T01', name: 'Table T01' }, { id: 'VIP1', name: 'VIP-01' }]);

    const getStatusTabClasses = (statusId: number | null): string => {
        if (statusId === null) return "bg-slate-800 text-white shadow-md";

        switch (statusId) {
            case 21: return "bg-amber-500 text-white shadow-md";
            case 22: return "bg-blue-600 text-white shadow-md";
            case 23: return "bg-emerald-500 text-white shadow-md";
            case 24:
            case 25: return "bg-rose-500 text-white shadow-md";
            default: return "bg-slate-700 text-white shadow-md";
        }
    };

    const isToday = isSameDay(currentDate, new Date());
    const isTomorrow = isSameDay(currentDate, addDays(new Date(), 1));

    const activeFilterCount = (creatorFilter ? 1 : 0) + (tableFilter ? 1 : 0);

    return (
        <div className="flex flex-col gap-5 w-full mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t("title", { defaultMessage: "Reservations" })}</h1>

            <div className="flex flex-col xl:flex-row gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">

                <div className="flex flex-col md:flex-row gap-3 w-full justify-between items-center">

                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder={t("searchPlaceholder", { defaultMessage: "Search name, phone..." })}
                                className="pl-9 bg-slate-50 border-slate-200 h-10 rounded-xl focus-visible:ring-[#D5BA98] focus-visible:border-[#D5BA98]"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 items-center h-10 border border-slate-200">
                            <button
                                onClick={() => onDateChange(new Date())}
                                className={`px-4 h-full text-sm font-semibold rounded-lg transition-all ${isToday ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t("today", { defaultMessage: "Today" })}
                            </button>
                            <button
                                onClick={() => onDateChange(addDays(new Date(), 1))}
                                className={`px-4 h-full text-sm font-semibold rounded-lg transition-all ${isTomorrow ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t("tomorrow", { defaultMessage: "Tomorrow" })}
                            </button>

                            <div className="px-4 h-full flex items-center text-sm font-semibold text-slate-700 border-l border-slate-300 ml-1 cursor-pointer hover:bg-slate-200 rounded-r-lg transition-colors">
                                <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                                {format(currentDate, "dd/MM/yyyy")}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 font-semibold bg-white hover:bg-slate-50">
                                    <ArrowUpDown className="mr-2 h-4 w-4 text-slate-500" />
                                    {sortBy === 'createdAt' ? "Sort: Created" : "Sort: Date"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => onSortChange?.(val)}>
                                    <DropdownMenuRadioItem value="createdAt" className="cursor-pointer font-medium">Created Date</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="reservedDate" className="cursor-pointer font-medium">Reserved Date</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className={`h-10 rounded-xl font-semibold relative transition-colors ${activeFilterCount > 0 ? 'bg-[#D5BA98]/10 border-[#D5BA98] text-[#9A7B4F]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                    <Filter className={`mr-2 h-4 w-4 ${activeFilterCount > 0 ? 'text-[#9A7B4F]' : 'text-slate-500'}`} />
                                    Filter
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-3 rounded-xl">

                                <div className="mb-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center px-2">
                                        <User className="w-3.5 h-3.5 mr-1.5" /> Created By
                                    </h4>
                                    <div className="space-y-1">
                                        <button onClick={() => onCreatorFilterChange?.(null)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!creatorFilter ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                            All Creators
                                        </button>
                                        {mockUsers.map(user => (
                                            <button key={user.id} onClick={() => onCreatorFilterChange?.(user.id)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${creatorFilter === user.id ? 'bg-[#D5BA98]/15 text-[#9A7B4F] font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                                {user.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <DropdownMenuSeparator className="my-2" />

                                <div className="mt-2">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center px-2">
                                        <Armchair className="w-3.5 h-3.5 mr-1.5" /> Table
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                        <button onClick={() => onTableFilterChange?.(null)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!tableFilter ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                            All Tables
                                        </button>
                                        {mockTables.map(table => (
                                            <button key={table.id} onClick={() => onTableFilterChange?.(table.id)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${tableFilter === table.id ? 'bg-[#D5BA98]/15 text-[#9A7B4F] font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                                {table.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {activeFilterCount > 0 && (
                                    <>
                                        <DropdownMenuSeparator className="my-2" />
                                        <Button variant="ghost" onClick={() => { onCreatorFilterChange?.(null); onTableFilterChange?.(null); }} className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold justify-start px-2">
                                            <X className="w-4 h-4 mr-2" /> Clear all filters
                                        </Button>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 w-full xl:border-t-0 xl:pt-0 xl:w-auto xl:pl-3 xl:border-l">
                    <button
                        onClick={() => onStatusChange(null)}
                        className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all h-10 ${currentStatusId === null ? getStatusTabClasses(null) : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                    >
                        {t("all", { defaultMessage: "All" })}
                    </button>

                    {statuses.map((status) => (
                        <button
                            key={status.statusId}
                            onClick={() => onStatusChange(status.statusId)}
                            className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all h-10 ${currentStatusId === status.statusId ? getStatusTabClasses(status.statusId) : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                        >
                            {localizeStatusLabel(status.statusCode, status.statusName, tStatus)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};