"use client";

import React, { useState, useRef, useEffect } from "react";
import { RefreshCcw, FolderSync, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

interface DashboardHeaderProps {
    onRefresh: () => void;
    isLoading: boolean;
    currentPeriod?: string;
    onPeriodChange?: (period: string, startDate: string, endDate: string) => void;
}

export function DashboardHeader({ onRefresh, isLoading, currentPeriod = 'last_30_days', onPeriodChange }: DashboardHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const periods = [
        { id: "today", label: "Today" },
        { id: "yesterday", label: "Yesterday" },
        { id: "last_7_days", label: "Last 7 Days" },
        { id: "last_30_days", label: "Last 30 Days" },
        { id: "this_month", label: "This Month" },
        { id: "last_month", label: "Last Month" },
    ];

    const getDateRangeForPeriod = (periodId: string): { start: Date; end: Date } => {
        const today = new Date();
        switch (periodId) {
            case "today":
                return { start: today, end: today };
            case "yesterday":
                const yesterday = subDays(today, 1);
                return { start: yesterday, end: yesterday };
            case "last_7_days":
                return { start: subDays(today, 6), end: today };
            case "last_30_days":
                return { start: subDays(today, 29), end: today };
            case "this_month":
                return { start: startOfMonth(today), end: endOfMonth(today) };
            case "last_month":
                const lastMonth = subMonths(today, 1);
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            default:
                return { start: subDays(today, 29), end: today };
        }
    };

    useEffect(() => {
        if (currentPeriod && currentPeriod !== "custom") {
            const { start, end } = getDateRangeForPeriod(currentPeriod);
            setDateRange({ from: start, to: end });
        }
    }, [currentPeriod]);

    const getDisplayDateText = () => {
        if (!dateRange || !dateRange.from) return "Select Period";

        const startStr = format(dateRange.from, "dd MMM yy");
        if (!dateRange.to || dateRange.from.getTime() === dateRange.to.getTime()) {
            return startStr;
        }

        const endStr = format(dateRange.to, "dd MMM yy");
        return `${startStr} - ${endStr}`;
    };

    const handleSelectPreset = (periodId: string) => {
        if (!onPeriodChange) return;

        const { start, end } = getDateRangeForPeriod(periodId);
        setDateRange({ from: start, to: end });

        onPeriodChange(periodId, format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
        setIsDropdownOpen(false);
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setDateRange(range);

        if (range?.from && range?.to) {
            if (onPeriodChange) {
                onPeriodChange("custom", format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"));
            }
            setTimeout(() => setIsDropdownOpen(false), 200);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-50">
            <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-800 m-0">Dashboard</h3>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                    title="Refresh Data"
                >
                    <RefreshCcw size={16} className={isLoading ? "animate-spin text-[#FFAB2D]" : ""} />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">

                {/* Sync Data  */}
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60"
                >
                    <FolderSync size={16} className={`mr-2 ${isLoading ? "animate-spin text-[#FFAB2D]" : "text-gray-500"}`} />
                    {isLoading ? "Syncing..." : "Sync Data"}
                </button>

                {/* Dropdown Lịch & Presets */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`inline-flex items-center px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors shadow-sm min-w-[220px] justify-between ${isDropdownOpen ? 'border-[#1A3A52] ring-1 ring-[#1A3A52] text-[#1A3A52]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center">
                            <CalendarIcon size={16} className={`mr-2 ${isDropdownOpen ? 'text-[#1A3A52]' : 'text-gray-500'}`} />
                            <span>{getDisplayDateText()}</span>
                        </div>
                        <ChevronDown size={14} className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#1A3A52]' : 'text-gray-400'}`} />
                    </button>

                    {/* Popover/Dropdown  */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-top-2">

                            {/* (Presets) */}
                            <div className="flex flex-col border-b md:border-b-0 md:border-r border-gray-100 p-2 w-full md:w-40 bg-gray-50/50">
                                {periods.map((period) => (
                                    <button
                                        key={period.id}
                                        onClick={() => handleSelectPreset(period.id)}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-md ${
                                            currentPeriod === period.id
                                                ? 'bg-[#1A3A52] text-white font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>

                            {/* Calendar Component */}
                            <div className="p-3">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={handleCalendarSelect}
                                    numberOfMonths={2}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}