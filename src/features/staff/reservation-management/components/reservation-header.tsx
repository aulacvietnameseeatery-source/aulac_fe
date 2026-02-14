// features/staff/reservation/components/reservation-header.tsx

import React from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Input } from "@/components/ui/input";
import { ReservationStatusDto } from "../types/reservation-types";

interface ReservationHeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    currentStatusId: number | null;
    onStatusChange: (id: number | null) => void;
    statuses: ReservationStatusDto[];
}

export const ReservationHeader = ({
                                      searchTerm,
                                      onSearchChange,
                                      currentDate,
                                      onDateChange,
                                      currentStatusId,
                                      onStatusChange,
                                      statuses
                                  }: ReservationHeaderProps) => {

    // Helper check active date
    const isToday = isSameDay(currentDate, new Date());
    const isTomorrow = isSameDay(currentDate, addDays(new Date(), 1));

    return (
        <div className="flex flex-col gap-6 w-full mb-4">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reservation List</h1>
            </div>

            {/* Toolbar Container */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

                {/* LEFT: Search & Date Controls */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search customer, phone..."
                            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Date Toggles Group */}
                    <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 items-center">
                        <button
                            onClick={() => onDateChange(new Date())}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                isToday
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => onDateChange(addDays(new Date(), 1))}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                isTomorrow
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                            }`}
                        >
                            Tomorrow
                        </button>

                        {/* Date Display (Giả lập DatePicker như Figma) */}
                        <div className="px-3 py-1.5 text-sm font-medium text-gray-700 flex items-center border-l border-gray-300 ml-1 pl-3">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            {format(currentDate, "dd/MM/yyyy")}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Status Tabs */}
                <div className="flex flex-wrap gap-2">
                    {/* Tab ALL */}
                    <button
                        onClick={() => onStatusChange(null)}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-lg border transition-all
                            ${currentStatusId === null
                            ? 'bg-green-900 border-green-900 text-white shadow-sm' // Active Style (giống Figma Dark Green)
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                        `}
                    >
                        All
                    </button>

                    {/* Dynamic Tabs from API */}
                    {statuses.map((status) => (
                        <button
                            key={status.statusId}
                            onClick={() => onStatusChange(status.statusId)}
                            className={`
                                px-4 py-1.5 text-sm font-medium rounded-lg border transition-all
                                ${currentStatusId === status.statusId
                                ? 'bg-green-900 border-green-900 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                            `}
                        >
                            {status.statusName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};