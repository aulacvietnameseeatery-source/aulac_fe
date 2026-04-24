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
        bg: "bg-amber-100",
        text: "text-amber-800",
        headerBg: "bg-amber-600"
    },
    "in-kitchen": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        headerBg: "bg-blue-600"
    },
    "completed": {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        headerBg: "bg-emerald-600"
    },
    "cancelled": {
        bg: "bg-slate-100",
        text: "text-slate-700",
        headerBg: "bg-slate-500"
    },
};

const getItemStatusColor = (status: string) => {
    switch (normalizeKitchenItemStatus(status)) {
        case OrderItemStatusCode.SERVED:
        case OrderItemStatusCode.READY:
            return 'bg-emerald-500 border-emerald-500';
        case OrderItemStatusCode.REJECTED:
            return 'bg-red-500 border-red-500';
        case OrderItemStatusCode.IN_PROGRESS:
            return 'bg-blue-500 border-blue-500';
        default:
            return 'bg-slate-300 border-slate-300';
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
    const status = useMemo(() => getOrderDisplayStatus(order.items, order.orderStatus), [order.items, order.orderStatus]);
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
        <div className="bg-white border border border-[#D5BA98]/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:-translate-y-0.5 hover:shadow-md transition-all">
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
            <div className="px-3 py-2 sm:px-5 sm:py-3 border-b border-[#D5BA98]/20 bg-[#D5BA98]/10">
                <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#1A3A52]/70 font-medium">
                    <div className="flex items-center gap-1.5">
                        <span>{t?.("tokenNo") || "Token No:"}</span>
                        <span className="text-[#1A3A52] font-bold">{order.orderId % 100}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#1A3A52]/60">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="font-semibold">{formattedTime}</span>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="px-3 py-3 sm:px-5 sm:py-4 flex-1 space-y-3 sm:space-y-4 max-h-62.5 sm:max-h-75 overflow-y-auto custom-scrollbar">
                <div className="space-y-2.5 sm:space-y-3">
                    {order.items.map((item) => {
                        const normalizedStatus = normalizeKitchenItemStatus(item.itemStatus);
                        const canAction = !isProcessedItemStatus(normalizedStatus);
                        const itemUpdating = isItemUpdating(item.orderItemId);

                        return (
                            <div key={item.orderItemId} className="group border border border-[#D5BA98]/60 rounded-xl p-2.5 sm:p-3 bg-white">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                                    <div className="flex items-start flex-1 min-w-0">
                                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${getItemStatusColor(item.itemStatus)} shrink-0 mt-1 mr-2.5 sm:mr-3 flex items-center justify-center`}>
                                            <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${DONE_ITEM_STATUSES.includes(normalizedStatus as OrderItemStatusCode) ? 'bg-white' : ''}`}></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                                <span className="text-xs sm:text-sm font-bold text-[#1A3A52] wrap-break-word">
                                                    {item.dishName}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-[#1A3A52]/55 font-bold">x{item.quantity}</span>
                                            </div>

                                            {item.note && (
                                                <div className="flex items-center gap-1.5 bg-[#D5BA98]/12 rounded-lg px-2.5 py-1.5 mt-1.5 border border-[#D5BA98]/30">
                                                    <MessageSquare className="w-3 h-3 text-[#1A3A52]/45" />
                                                    <span className="text-[10px] sm:text-xs text-[#1A3A52]/70 font-medium wrap-break-word">
                                                        {item.note}
                                                    </span>
                                                </div>
                                            )}

                                            {item.rejectReason && item.rejectReason !== 'Staff cancelled order' && (
                                                <div className="flex items-center gap-1.5 bg-[#8C3A3A]/8 rounded-lg px-2.5 py-1.5 mt-1.5 border border-[#8C3A3A]/20">
                                                    <AlertTriangle className="w-3 h-3 text-[#8C3A3A]" />
                                                    <span className="text-[10px] sm:text-xs text-[#8C3A3A] font-medium italic wrap-break-word">
                                                        {item.rejectReason}
                                                    </span>
                                                </div>
                                            )}

                                            {normalizedStatus === OrderItemStatusCode.CANCELLED && item.rejectReason === 'Staff cancelled order' && (
                                                <div className="flex items-center gap-1.5 bg-[#B05E00]/8 rounded-lg px-2.5 py-1.5 mt-1.5 border border-[#B05E00]/25">
                                                    <AlertTriangle className="w-3 h-3 text-[#B05E00]" />
                                                    <span className="text-[10px] sm:text-xs text-[#B05E00] font-medium italic wrap-break-word">
                                                        {t?.("staffCancelled") || "Staff cancelled order"}
                                                    </span>
                                                </div>
                                            )}

                                            {normalizedStatus === OrderItemStatusCode.CANCELLED && !item.rejectReason && (
                                                <div className="flex items-center gap-1.5 bg-[#8C3A3A]/8 rounded-lg px-2.5 py-1.5 mt-1.5 border border-[#8C3A3A]/20">
                                                    <AlertTriangle className="w-3 h-3 text-[#8C3A3A]" />
                                                    <span className="text-[10px] sm:text-xs text-[#8C3A3A] font-medium italic wrap-break-word">
                                                        {t?.("customerCancelled") || "Customer Cancelled"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Item specific actions: larger touch targets and placed near each item */}
                                    {canAction && (
                                        <div className="flex items-center sm:justify-end gap-2 sm:min-w-42.5">
                                            {normalizedStatus === OrderItemStatusCode.CREATED && (
                                                <button
                                                    type="button"
                                                    disabled={itemUpdating}
                                                    onClick={() => onUpdateStatus(item.orderItemId, OrderItemStatusCode.IN_PROGRESS)}
                                                    className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-[#1A3A52] bg-[#D5BA98]/18 border border-[#D5BA98]/50 hover:bg-[#D5BA98]/28 disabled:opacity-50"
                                                >
                                                    {t?.("actions.start") || "Start"}
                                                </button>
                                            )}
                                            {normalizedStatus === OrderItemStatusCode.IN_PROGRESS && (
                                                <button
                                                    type="button"
                                                    disabled={itemUpdating}
                                                    onClick={() => onUpdateStatus(item.orderItemId, OrderItemStatusCode.SERVED)}
                                                    className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-[#4A5D4E] bg-[#D5BA98]/18 border border-[#D5BA98]/50 hover:bg-[#D5BA98]/28 disabled:opacity-50"
                                                >
                                                    {t?.("actions.serve") || "Serve"}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                disabled={itemUpdating}
                                                onClick={() => handleReject(item.orderItemId)}
                                                className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-[#8C3A3A] bg-[#8C3A3A]/8 border border-[#8C3A3A]/25 hover:bg-[#8C3A3A]/12 disabled:opacity-50"
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
                                            className="w-full h-10 text-xs sm:text-sm border border-[#8C3A3A]/25 rounded-lg px-3 text-[#1A3A52] focus:outline-none focus:ring-2 focus:ring-[#8C3A3A]/10 bg-[#FDFBF9]"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={itemUpdating || !rejectReason.trim()}
                                                onClick={() => handleReject(item.orderItemId)}
                                                className="h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-[#8C3A3A] text-white hover:bg-[#8C3A3A]/90 disabled:opacity-50"
                                            >
                                                {t?.("rejectReason.confirm") || "Confirm"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelReject}
                                                className="h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold text-[#1A3A52]/70 bg-[#D5BA98]/15 hover:bg-[#D5BA98]/25"
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
            <div className="px-3 py-3 sm:px-5 sm:py-4 space-y-2.5 sm:space-y-3 mt-auto border-t border-[#D5BA98]/20 bg-[#D5BA98]/10">
                <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-[#1A3A52]/40">
                        <div className="bg-[#D5BA98]/20 flex-1 h-1 sm:h-1.5 rounded-full overflow-hidden mr-3 sm:mr-4">
                            <div
                                className="bg-[#4A5D4E] h-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#1A3A52]/60 font-semibold">
                                {processedItems}/{order.items.length}
                            </span>
                            <span className="text-[#1A3A52] font-bold">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-2">
                {(status === 'completed' || status === 'cancelled') ? (
                        <Button
                            variant="outline"
                            onClick={() => setIsPrintModalOpen(true)}
                            className="w-full h-9 gap-2 border-[#D5BA98]/60 text-[#1A3A52] bg-[#FDFBF9] font-bold text-xs rounded-xl hover:bg-[#D5BA98]/10"
                        >
                            <Printer className="w-4 h-4" />
                            {t?.("actions.print") || "Print Order"}
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsPrintModalOpen(true)}
                                className="h-9 gap-2 border-[#D5BA98]/60 text-[#1A3A52] bg-[#FDFBF9] font-bold text-xs rounded-xl hover:bg-[#D5BA98]/10"
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
                                className="h-9 gap-2 border-[#D5BA98]/60 text-[#1A3A52] font-bold text-xs rounded-xl hover:bg-[#D5BA98]/10 bg-[#FDFBF9]"
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
