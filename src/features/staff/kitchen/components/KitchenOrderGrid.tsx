"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { KitchenOrderCard } from "./KitchenOrderCard";
import type { KitchenOrder, UpdateItemStatusRequest } from "../types/kitchen.types";

interface KitchenOrderGridProps {
    orders: KitchenOrder[];
    loading: boolean;
    onUpdateStatus: (orderItemId: number, status: UpdateItemStatusRequest['status'], rejectReason?: string) => void;
    onBatchUpdateStatus: (updates: { orderItemId: number; status: UpdateItemStatusRequest['status']; rejectReason?: string }[]) => void;
    isUpdating: boolean;
    isItemUpdating: (orderItemId: number) => boolean;
    t: any;
}

export function KitchenOrderGrid({
    orders,
    loading,
    onUpdateStatus,
    onBatchUpdateStatus,
    isUpdating,
    isItemUpdating,
    t
}: KitchenOrderGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                    >
                        <div className="h-16 bg-gray-100 rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                        </div>
                        <div className="h-10 bg-gray-100 rounded mt-4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <img src="/images/img_margin_2.svg" alt="Empty" className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-base font-medium">{t?.("empty.title") || "No orders found"}</p>
                <p className="text-sm mt-1">{t?.("empty.hint") || "Orders will appear here when they are placed"}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-1">
            {orders.map((order) => (
                <KitchenOrderCard
                    key={order.orderId}
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    onBatchUpdateStatus={onBatchUpdateStatus}
                    isUpdating={isUpdating}
                    isItemUpdating={isItemUpdating}
                    t={t}
                />
            ))}
        </div>
    );
}
