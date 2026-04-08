"use client";
import React, { useState } from "react";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface FilterProps {
    initialStart?: string;
    initialEnd?: string;
    onApply: (start: string, end: string) => void;
}

export function OrderFilter({ initialStart, initialEnd, onApply }: FilterProps) {
    const t = useTranslations("reports.filters");
    const [startDate, setStartDate] = useState(initialStart || "");
    const [endDate, setEndDate] = useState(initialEnd || "");

    const handleSubmit = () => {
        if (startDate && endDate) {
            onApply(startDate, endDate);
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-2">
            <ALDatePicker
                title={t("startDate")}
                value={startDate}
                onChange={setStartDate}
                inputSize="sm"
                wrapperClassName="w-full min-w-[180px] sm:w-auto"
            />
            <ALDatePicker
                title={t("endDate")}
                value={endDate}
                onChange={setEndDate}
                inputSize="sm"
                wrapperClassName="w-full min-w-[180px] sm:w-auto"
            />
            <Button
                onClick={handleSubmit}
                variant={"outline"}
                className="h-9 rounded-lg border-[#D5BA98]/70 px-4 text-sm font-medium text-[#1A3A52] hover:bg-[#D5BA98]/10"
            >
                {t("submit")}
            </Button>
        </div>
    );
}