"use client";

import React, { useState, useMemo } from "react";
import {
    User,
    Clock,
    AlertCircle,
    FileText,
    Play,
    CheckCircle2,
    Printer,
    MessageSquare,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KitchenOrder, KitchenOrderItem } from "../types/kitchen.types";
import { format } from "date-fns";

// ─── Status helpers ─────────────────────────────────────────────────────────

// Map backend status to UI design status for the card header
const getOrderCardStatus = (items: KitchenOrderItem[]) => {
    const isFinished = (s: string) => ["Served", "Ready", "Rejected"].includes(s);
    const hasProgress = (s: string) => ["In progress", "Served", "Ready"].includes(s);

    // 1. All items are Rejected -> Order is Rejected
    if (items.length > 0 && items.every(i => i.itemStatus === "Rejected")) return "rejected";

    // 2. All items are finished -> Order is Completed
    if (items.every(i => isFinished(i.itemStatus))) return "completed";

    // 3. Any item is started or finished -> Order is In Kitchen
    if (items.some(i => hasProgress(i.itemStatus))) return "in-kitchen";

    return "new";
};

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
    switch (status) {
        case 'Served':
        case 'Ready':
            return 'bg-green-500 border-green-500';
        case 'Rejected':
            return 'bg-red-500 border-red-500';
        case 'In progress':
            return 'bg-blue-500 border-blue-500';
        default:
            return 'bg-gray-300 border-gray-300';
    }
};

interface KitchenOrderCardProps {
    order: KitchenOrder;
    onUpdateStatus: (orderItemId: number, status: string, rejectReason?: string) => void;
    onBatchUpdateStatus: (updates: { orderItemId: number; status: string; rejectReason?: string }[]) => void;
    isUpdating: boolean;
    t: any;
}

export function KitchenOrderCard({ order, onUpdateStatus, onBatchUpdateStatus, isUpdating, t }: KitchenOrderCardProps) {
    const [rejectItemId, setRejectItemId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const status = useMemo(() => getOrderCardStatus(order.items), [order.items]);
    const config = STATUS_CONFIG[status] || STATUS_CONFIG["new"];

    const formattedDate = order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "-";
    const formattedTime = order.createdAt ? format(new Date(order.createdAt), "hh:mm a") : "-";

    const handleReject = (itemId: number) => {
        if (rejectItemId === itemId) {
            if (rejectReason.trim()) {
                onUpdateStatus(itemId, "REJECTED", rejectReason.trim());
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

    // Progress bar based on Served/Ready items
    const progressPercentage = useMemo(() => {
        const total = order.items.length;
        if (total === 0) return 0;
        const done = order.items.filter(i => i.itemStatus === "Served" || i.itemStatus === "Ready").length;
        return (done / total) * 100;
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
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-500 font-medium">
                    <div className="flex flex-row items-center gap-4 sm:gap-0 sm:flex-col sm:items-start sm:space-y-1">
                        <div>
                            <span>Token No : </span>
                            <span className="text-gray-900 font-bold">{order.orderId % 100}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>{formattedTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="px-3 py-3 sm:px-5 sm:py-4 flex-1 space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="space-y-2.5 sm:space-y-3">
                    {order.items.map((item) => (
                        <div key={item.orderItemId} className="group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start flex-1">
                                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${getItemStatusColor(item.itemStatus)} flex-shrink-0 mt-1 mr-2.5 sm:mr-3 flex items-center justify-center`}>
                                        <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${['Served', 'Ready'].includes(item.itemStatus) ? 'bg-white' : ''}`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                            <span className="text-[11px] sm:text-xs font-bold text-gray-800 break-words">
                                                {item.dishName}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">×{item.quantity}</span>
                                        </div>

                                        {item.note && (
                                            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 mt-1 border border-gray-100/50">
                                                <MessageSquare className="w-2.5 h-2.5 text-gray-400" />
                                                <span className="text-[9px] text-gray-600 font-medium">
                                                    {item.note}
                                                </span>
                                            </div>
                                        )}

                                        {item.rejectReason && (
                                            <div className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2 py-1 mt-1.5 border border-red-100">
                                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                                <span className="text-[10px] text-red-600 font-medium italic">
                                                    {item.rejectReason}
                                                </span>
                                            </div>
                                        )}

                                        {/* Item specific actions */}
                                        {item.itemStatus !== "Served" && item.itemStatus !== "Rejected" && (
                                            <div className="flex items-center gap-2 mt-2 transition-opacity">
                                                {item.itemStatus === "Created" && (
                                                    <button
                                                        disabled={isUpdating}
                                                        onClick={() => onUpdateStatus(item.orderItemId, "IN_PROGRESS")}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline"
                                                    >
                                                        {t?.("actions.start") || "Start"}
                                                    </button>
                                                )}
                                                {item.itemStatus === "In progress" && (
                                                    <button
                                                        disabled={isUpdating}
                                                        onClick={() => onUpdateStatus(item.orderItemId, "SERVED")}
                                                        className="text-[10px] font-bold text-green-600 hover:text-green-700 underline"
                                                    >
                                                        {t?.("actions.serve") || "Serve"}
                                                    </button>
                                                )}
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={() => handleReject(item.orderItemId)}
                                                    className="text-[10px] font-bold text-red-600 hover:text-red-700 underline"
                                                >
                                                    {t?.("actions.reject") || "Reject"}
                                                </button>
                                            </div>
                                        )}

                                        {rejectItemId === item.orderItemId && (
                                            <div className="mt-2 space-y-2">
                                                <input
                                                    autoFocus
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Reason..."
                                                    className="w-full text-[10px] border border-red-200 rounded-lg px-2 py-1.5 focus:outline-none bg-red-50"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleReject(item.orderItemId)} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded">Confirm</button>
                                                    <button onClick={cancelReject} className="text-[10px] text-gray-400">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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
                        <div className="flex items-center gap-1">
                            <span className="text-gray-900 font-bold">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-2">
                    {status === 'completed' ? (
                        <Button
                            variant="outline"
                            className="w-full h-9 gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100"
                        >
                            <Printer className="w-4 h-4" />
                            {t?.("actions.print") || "Print Order"}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const updates = order.items
                                    .filter(item => item.itemStatus !== "Served" && item.itemStatus !== "Ready" && item.itemStatus !== "Rejected")
                                    .map(item => ({ orderItemId: item.orderItemId, status: "SERVED" }));

                                if (updates.length > 0) {
                                    onBatchUpdateStatus(updates);
                                }
                            }}
                            disabled={isUpdating || progressPercentage === 100}
                            className="w-full h-9 gap-2 border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 bg-white"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {t?.("actions.markDone") || "Mark Done"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
