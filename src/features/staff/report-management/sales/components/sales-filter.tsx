"use client";
import React, { useState } from "react";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

interface FilterProps {
    initialStart?: string;
    initialEnd?: string;
    onApply: (start: string, end: string) => void;
}

export function SalesFilter({ initialStart, initialEnd, onApply }: FilterProps) {
    const t = useTranslations("reports.filters");
    const [startDate, setStartDate] = useState(initialStart || "");
    const [endDate, setEndDate] = useState(initialEnd || "");

    const handleSubmit = () => {
        if (startDate && endDate) {
            onApply(startDate, endDate);
        }
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        onApply("", "");
    };

    return (
        <div className="flex flex-wrap items-end gap-2">
            <ALDatePicker
                title={t("startDate")}
                value={startDate}
                onChange={setStartDate}
                inputSize="sm"
                wrapperClassName="w-full min-w-[160px] sm:w-auto"
            />
            <ALDatePicker
                title={t("endDate")}
                value={endDate}
                onChange={setEndDate}
                inputSize="sm"
                wrapperClassName="w-full min-w-[160px] sm:w-auto"
            />
            <div className="flex gap-2">
                <Button
                    onClick={handleSubmit}
                    className="h-9 rounded-lg bg-[#1A3A52] px-5 text-sm font-bold text-white hover:bg-[#1A3A52]/90 shadow-sm"
                >
                    {t("submit")}
                </Button>

                {/* Nút Clear Filter */}
                {(startDate || endDate) && (
                    <Button
                        onClick={handleClear}
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Clear Dates"
                    >
                        <X size={18} />
                    </Button>
                )}
            </div>
        </div>
    );
}