"use client";
import React, { useState } from "react";
import { Calendar } from "lucide-react";
import {Button} from "@/components/ui/button";

interface EarningFilterProps {
    initialStart?: string;
    initialEnd?: string;
    onApply: (start: string, end: string) => void;
}

export function EarningFilter({ initialStart, initialEnd, onApply }: EarningFilterProps) {
    const [startDate, setStartDate] = useState(initialStart || "");
    const [endDate, setEndDate] = useState(initialEnd || "");

    const handleSubmit = () => {
        if (startDate && endDate) {
            onApply(startDate, endDate);
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                variant ={"outline"}
                className=" py-2 px-6 rounded-lg text-sm font-medium transition-colors"
            >
                Submit
            </Button>
        </div>
    );
}