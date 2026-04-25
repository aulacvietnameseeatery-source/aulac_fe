"use client";

import React from "react";
import type { KitchenDisplayStatus } from "../utils/kitchen-status";

interface KitchenStatusBarProps {
    orderCounts: {
        all: number;
        new: number;
        inKitchen: number;
        completed: number;
        cancelled: number;
    };
    activeStatus: KitchenDisplayStatus;
    onStatusChange: (status: KitchenDisplayStatus) => void;
    t: any;
}

export function KitchenStatusBar({ orderCounts, activeStatus, onStatusChange, t }: KitchenStatusBarProps) {
    const statuses = [
        {
            key: "all",
            label: t?.("status.all") || "Tất cả",
            count: orderCounts.all,
            bg: "bg-slate-700",
            dot: "bg-white",
            active: "bg-slate-700 border-slate-700"
        },
        {
            key: "new",
            label: t?.("status.new") || "Mới",
            count: orderCounts.new,
            bg: "bg-amber-500",
            dot: "bg-amber-500",
            active: "bg-amber-600 border-amber-600"
        },
        {
            key: "in-kitchen",
            label: t?.("status.inKitchen") || "Đang làm",
            count: orderCounts.inKitchen,
            bg: "bg-blue-500",
            dot: "bg-blue-500",
            active: "bg-blue-600 border-blue-600"
        },
        {
            key: "completed",
            label: t?.("status.completed") || "Hoàn tất",
            count: orderCounts.completed,
            bg: "bg-emerald-500",
            dot: "bg-emerald-500",
            active: "bg-emerald-600 border-emerald-600"
        },
        {
            key: "cancelled",
            label: t?.("status.cancelled") || "Đã huỷ",
            count: orderCounts.cancelled,
            bg: "bg-slate-500",
            dot: "bg-slate-500",
            active: "bg-slate-600 border-slate-600"
        }
    ];

    return (
        <div className="flex items-center flex-nowrap gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar pb-1">
            {statuses.map((status) => {
                const isActive = activeStatus === status.key;
                return (
                    <button
                        key={status.key}
                        onClick={() => onStatusChange(status.key as KitchenDisplayStatus)}
                        className={`flex items-center gap-2 px-2.5 py-1 border rounded-lg shadow-sm h-8 shrink-0 transition-all ${isActive
                            ? status.active
                            : "bg-[#FDFBF9] border-[#D5BA98]/45 hover:border-[#D5BA98]/70 shadow-none"
                            }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-white' : status.dot} shrink-0 border border-black/5`} />
                            <span className={`text-[11px] font-medium leading-none ${isActive ? "text-white" : "text-[#1A3A52]/70"}`}>
                                {status.label}
                            </span>
                        </div>
                        <span className={`text-xs font-bold leading-none ${isActive ? "text-white" : "text-[#1A3A52]"}`}>
                            {status.count.toString().padStart(2, '0')}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
