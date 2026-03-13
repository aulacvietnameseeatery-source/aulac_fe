"use client";

import React from "react";

interface KitchenStatusBarProps {
    orderCounts: {
        all: number;
        new: number;
        inKitchen: number;
        rejected: number;
        completed: number;
    };
    activeStatus: string | null;
    onStatusChange: (status: string | null) => void;
    t: any;
}

export function KitchenStatusBar({ orderCounts, activeStatus, onStatusChange, t }: KitchenStatusBarProps) {
    const statuses = [
        {
            key: "all",
            label: t?.("status.all") || "Tất cả",
            count: orderCounts.all,
            bg: "bg-gray-900",
            dot: "bg-white"
        },
        {
            key: "new",
            label: t?.("status.new") || "Mới",
            count: orderCounts.new,
            bg: "bg-[#F0F2F5]",
            dot: "bg-gray-400"
        },
        {
            key: "in-kitchen",
            label: t?.("status.inKitchen") || "Đang làm",
            count: orderCounts.inKitchen,
            bg: "bg-[#FF7A00]",
            dot: "bg-white"
        },
        {
            key: "rejected",
            label: t?.("status.rejected") || "Bị từ chối",
            count: orderCounts.rejected,
            bg: "bg-[#FF3B30]",
            dot: "bg-white"
        },
        {
            key: "completed",
            label: t?.("status.completed") || "Hoàn tất",
            count: orderCounts.completed,
            bg: "bg-[#00C853]",
            dot: "bg-white"
        }
    ];

    return (
        <div className="flex items-center flex-nowrap gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar pb-1">
            {statuses.map((status) => {
                const isActive = activeStatus === status.key;
                return (
                    <button
                        key={status.key}
                        onClick={() => onStatusChange(isActive ? null : status.key)}
                        className={`flex items-center gap-2 px-2.5 py-1 border rounded-lg shadow-sm h-8 shrink-0 transition-all ${isActive
                            ? "bg-gray-900 border-gray-900"
                            : "bg-white border-gray-100 hover:border-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ${status.key === 'all' && isActive ? 'bg-white' : status.bg} flex-shrink-0 border border-black/5`} />
                            <span className={`text-[11px] font-medium leading-none ${isActive ? "text-white" : "text-gray-600"}`}>
                                {status.label}
                            </span>
                        </div>
                        <span className={`text-xs font-bold leading-none ${isActive ? "text-white" : "text-gray-900"}`}>
                            {status.count.toString().padStart(2, '0')}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
