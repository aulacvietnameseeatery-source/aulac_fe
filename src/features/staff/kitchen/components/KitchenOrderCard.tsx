"use client";

import React, { useState } from "react";
import { AlertTriangle, MessageSquare } from "lucide-react";
import type { KitchenOrder, KitchenOrderItem } from "../types/kitchen.types";

// ─── Status helpers ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    Created: { bg: "bg-amber-50", text: "text-amber-700", label: "New", dot: "bg-amber-400" },
    "In progress": { bg: "bg-blue-50", text: "text-blue-700", label: "In Progress", dot: "bg-blue-400" },
    Ready: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Ready", dot: "bg-emerald-400" },
    Served: { bg: "bg-gray-100", text: "text-gray-500", label: "Served", dot: "bg-gray-400" },
    Rejected: { bg: "bg-red-50", text: "text-red-600", label: "Rejected", dot: "bg-red-400" },
};

function statusOf(s: string) {
    return STATUS_CONFIG[s] ?? STATUS_CONFIG["Created"];
}

function nextStatus(current: string): string | null {
    if (current === "Created") return "IN_PROGRESS";
    if (current === "In progress") return "SERVED"; // Skip READY
    return null;
}

function nextLabel(current: string): string | null {
    if (current === "Created") return "Start";
    if (current === "In progress") return "Serve"; // Skip Ready label
    return null;
}


// ─── Props ──────────────────────────────────────────────────────────────────
interface KitchenOrderCardProps {
    order: KitchenOrder;
    onUpdateStatus: (orderItemId: number, status: string, rejectReason?: string) => void;
    isUpdating: boolean;
    t: any; // Translation function from useTranslations("Kitchen")
}

export function KitchenOrderCard({ order, onUpdateStatus, isUpdating, t }: KitchenOrderCardProps) {
    const [rejectItemId, setRejectItemId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const handleReject = (itemId: number) => {
        if (rejectItemId === itemId) {
            // Submit rejection
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


    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">#{order.orderId}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-amber-400 font-semibold text-sm">{order.tableCode}</span>
                </div>
            </div>

            {/* ── Item list ───────────────────────────────────────────── */}
            <div className="flex-1 divide-y divide-gray-100">
                {order.items.map((item) => {
                    const cfg = statusOf(item.itemStatus);
                    const next = nextStatus(item.itemStatus);
                    const label = nextLabel(item.itemStatus);
                    const isRejecting = rejectItemId === item.orderItemId;

                    return (
                        <div key={item.orderItemId} className="px-4 py-3">
                            {/* Item info row */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-800 text-white text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800 truncate">
                                            {item.dishName}
                                        </span>
                                    </div>
                                    {item.note && (
                                        <div className="flex items-start gap-1.5 mt-1.5 ml-7 p-2 bg-gray-50/50 rounded-lg border border-gray-100">
                                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                                                <span className="font-bold tracking-wider text-[9px] mr-1.5 text-gray-400 uppercase opacity-70">
                                                    {t("note")}:
                                                </span>
                                                {item.note}
                                            </p>
                                        </div>
                                    )}
                                    {item.rejectReason && (
                                        <div className="flex items-start gap-1.5 mt-1.5 ml-7 p-2 bg-red-50/50 rounded-lg border border-red-100">
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-red-600 leading-relaxed font-medium">
                                                <span className="font-bold tracking-wider text-[9px] mr-1.5 text-red-400 uppercase opacity-70">
                                                    {t("rejectReason.label")}:
                                                </span>
                                                {item.rejectReason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Status badge */}
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-2 ml-7">
                                {next && label && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => onUpdateStatus(item.orderItemId, next)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {label}
                                    </button>
                                )}
                                {item.itemStatus !== "Rejected" && item.itemStatus !== "Served" && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleReject(item.orderItemId)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 border border-red-200"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>

                            {/* Reject reason input */}
                            {isRejecting && (
                                <div className="mt-2 ml-7 flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && rejectReason.trim()) {
                                                onUpdateStatus(item.orderItemId, "REJECTED", rejectReason.trim());
                                                setRejectItemId(null);
                                                setRejectReason("");
                                            }
                                            if (e.key === "Escape") cancelReject();
                                        }}
                                        placeholder="Enter reason..."
                                        className="flex-1 text-xs border border-red-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                                    />
                                    <button
                                        onClick={() => {
                                            if (rejectReason.trim()) {
                                                onUpdateStatus(item.orderItemId, "REJECTED", rejectReason.trim());
                                                setRejectItemId(null);
                                                setRejectReason("");
                                            }
                                        }}
                                        disabled={!rejectReason.trim()}
                                        className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={cancelReject}
                                        className="px-2.5 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
            </div>
        </div >
    );
}
