"use client";

import React, { useState, useMemo } from "react";
import {
    User,
    Clock,
    CheckCircle2,
    Printer,
    MessageSquare,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KitchenOrder } from "../types/kitchen.types";
import { useFormatter } from "next-intl";
import {
    DONE_ITEM_STATUSES,
    getOrderDisplayStatus,
    isProcessedItemStatus,
    normalizeKitchenItemStatus,
} from "../utils/kitchen-status";
import { KitchenPrintModal } from "./KitchenPrintModal";
import { OrderItemStatusCode } from "@/types/status-codes";
import type { UpdateItemStatusRequest } from "../types/kitchen.types";

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; headerBg: string }> = {
    "new": {
        bg: "bg-gray-100",
        text: "text-gray-900",
        headerBg: "bg-gray-500"
    },
    "in-kitchen": {
        bg: "bg-orange-50",
        text: "text-orange-900",
        headerBg: "bg-orange-600"
    },
    "rejected": {
        bg: "bg-red-50",
        text: "text-red-900",
        headerBg: "bg-red-500"
    },
    "completed": {
        bg: "bg-green-50",
        text: "text-green-900",
        headerBg: "bg-green-600"
    },
};

const getItemStatusColor = (status: string) => {
    switch (normalizeKitchenItemStatus(status)) {
        case OrderItemStatusCode.SERVED:
        case OrderItemStatusCode.READY:
            return 'bg-green-500 border-green-500';
        case OrderItemStatusCode.REJECTED:
            return 'bg-red-500 border-red-500';
        case OrderItemStatusCode.IN_PROGRESS:
            return 'bg-blue-500 border-blue-500';
        default:
            return 'bg-gray-300 border-gray-300';
    }
};

interface KitchenOrderCardProps {
    order: KitchenOrder;
    onUpdateStatus: (orderItemId: number, status: UpdateItemStatusRequest['status'], rejectReason?: string) => void;
    onBatchUpdateStatus: (updates: { orderItemId: number; status: UpdateItemStatusRequest['status']; rejectReason?: string }[]) => void;
    isUpdating: boolean;
    isItemUpdating: (orderItemId: number) => boolean;
    t: any;
}

export function KitchenOrderCard({ order, onUpdateStatus, onBatchUpdateStatus, isUpdating, isItemUpdating, t }: KitchenOrderCardProps) {
    const [rejectItemId, setRejectItemId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const format = useFormatter();
    const status = useMemo(() => getOrderDisplayStatus(order.items), [order.items]);
    const config = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
    const formattedTime = order.createdAt ? format.dateTime(new Date(order.createdAt), { hour: '2-digit', minute: '2-digit' }) : "-";

    const handleReject = (itemId: number) => {
        if (rejectItemId === itemId) {
            if (rejectReason.trim()) {
                onUpdateStatus(itemId, OrderItemStatusCode.REJECTED, rejectReason.trim());
                setRejectItemId(null);
                setRejectReason("");
            }
        } else {
            setRejectItemId(itemId);
            setRejectReason("");
        }
    };

    const cancelReject = () => {
        setRejectItemId(null);
        setRejectReason("");
    };

    // Progress bar based on processed items (Served/Ready/Rejected)
    const progressPercentage = useMemo(() => {
        const total = order.items.length;
        if (total === 0) return 0;
        const done = order.items.filter((i) => {
            const status = normalizeKitchenItemStatus(i.itemStatus);
            return isProcessedItemStatus(status);
        }).length;
        return (done / total) * 100;
    }, [order.items]);

    const processedItems = useMemo(() => {
        return order.items.filter((i) => {
            const status = normalizeKitchenItemStatus(i.itemStatus);
            return isProcessedItemStatus(status);
        }).length;
    }, [order.items]);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            {/* Header */}
            <div className={`${config.headerBg} px-3 py-2.5 sm:px-4 sm:py-3.5`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs sm:text-sm font-bold text-white">
                                {order.tableCode}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-white/80 font-medium uppercase tracking-wider">
                                {t?.("orderType") || "Dine In"}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1">
                        <span className="text-[10px] sm:text-xs font-bold text-white">
                            #{order.orderId}
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Info */}
            <div className="px-3 py-2 sm:px-5 sm:py-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-1.5">
                        <span>{t?.("tokenNo") || "Token No:"}</span>
                        <span className="text-gray-900 font-bold">{order.orderId % 100}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="font-semibold">{formattedTime}</span>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="px-3 py-3 sm:px-5 sm:py-4 flex-1 space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="space-y-2.5 sm:space-y-3">
                    {order.items.map((item) => {
                        const normalizedStatus = normalizeKitchenItemStatus(item.itemStatus);
                        const canAction = !isProcessedItemStatus(normalizedStatus);
                        const itemUpdating = isItemUpdating(item.orderItemId);

                        return (
                            <div key={item.orderItemId} className="group border border-gray-100 rounded-xl p-2.5 sm:p-3 bg-white">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                                    <div className="flex items-start flex-1 min-w-0">
                                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${getItemStatusColor(item.itemStatus)} flex-shrink-0 mt-1 mr-2.5 sm:mr-3 flex items-center justify-center`}>
                                            <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${DONE_ITEM_STATUSES.includes(normalizedStatus as OrderItemStatusCode) ? 'bg-white' : ''}`}></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                                <span className="text-xs sm:text-sm font-bold text-gray-800 break-words">
                                                    {item.dishName}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-gray-500 font-bold">x{item.quantity}</span>
                                            </div>

                                            {item.note && (
                                                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 mt-1.5 border border-gray-100/60">
                                                    <MessageSquare className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium break-words">
                                                        {item.note}
                                                    </span>
                                                </div>
                                            )}

                                            {item.rejectReason && (
                                                <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2.5 py-1.5 mt-1.5 border border-red-100">
                                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                                    <span className="text-[10px] sm:text-xs text-red-600 font-medium italic break-words">
                                                        {item.rejectReason}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Item specific actions: larger touch targets and placed near each item */}
                                    {canAction && (
                                        <div className="flex items-center sm:justify-end gap-2 sm:min-w-[170px]">
                                            {normalizedStatus === OrderItemStatusCode.CREATED && (
                                                <button
                                                    type="button"
                                                    disabled={itemUpdating}
                                                    onClick={() => onUpdateStatus(item.orderItemId, OrderItemStatusCode.IN_PROGRESS)}
                                                    className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                                >
                                                    {t?.("actions.start") || "Start"}
                                                </button>
                                            )}
                                            {normalizedStatus === OrderItemStatusCode.IN_PROGRESS && (
                                                <button
                                                    type="button"
                                                    disabled={itemUpdating}
                                                    onClick={() => onUpdateStatus(item.orderItemId, OrderItemStatusCode.SERVED)}
                                                    className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 disabled:opacity-50"
                                                >
                                                    {t?.("actions.serve") || "Serve"}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                disabled={itemUpdating}
                                                onClick={() => handleReject(item.orderItemId)}
                                                className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {t?.("actions.reject") || "Reject"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {rejectItemId === item.orderItemId && (
                                    <div className="mt-2.5 space-y-2">
                                        <input
                                            autoFocus
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder={t?.("rejectReason.placeholder") || "Nhập lý do từ chối..."}
                                            className="w-full h-10 text-xs sm:text-sm border border-red-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-red-100 bg-red-50"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={itemUpdating || !rejectReason.trim()}
                                                onClick={() => handleReject(item.orderItemId)}
                                                className="h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {t?.("rejectReason.confirm") || "Confirm"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelReject}
                                                className="h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                                            >
                                                {t?.("rejectReason.cancel") || "Cancel"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Progress */}
            <div className="px-3 py-3 sm:px-5 sm:py-4 space-y-2.5 sm:space-y-3 mt-auto border-t border-gray-50 bg-gray-50/20">
                <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-gray-400">
                        <div className="bg-gray-100 flex-1 h-1 sm:h-1.5 rounded-full overflow-hidden mr-3 sm:mr-4">
                            <div
                                className="bg-green-500 h-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-semibold">
                                {processedItems}/{order.items.length}
                            </span>
                            <span className="text-gray-900 font-bold">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-2">
                    {status === 'completed' ? (
                        <Button
                            variant="outline"
                            onClick={() => setIsPrintModalOpen(true)}
                            className="w-full h-9 gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100"
                        >
                            <Printer className="w-4 h-4" />
                            {t?.("actions.print") || "Print Order"}
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsPrintModalOpen(true)}
                                className="h-9 gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100"
                            >
                                <Printer className="w-4 h-4" />
                                {t?.("actions.print") || "Print Order"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const updates = order.items
                                        .filter((item) => !isProcessedItemStatus(normalizeKitchenItemStatus(item.itemStatus)))
                                        .map(item => ({ orderItemId: item.orderItemId, status: OrderItemStatusCode.SERVED }));

                                    if (updates.length > 0) {
                                        onBatchUpdateStatus(updates);
                                    }
                                }}
                                disabled={isUpdating || progressPercentage === 100}
                                className="h-9 gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 bg-white"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {t?.("actions.markDone") || "Mark Done"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <KitchenPrintModal
                order={order}
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                t={t}
            />
        </div>
    );
}
