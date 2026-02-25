"use client";

import React, { useState } from "react";
import {
    ShoppingBag,
    Clock,
    Utensils,
    Package,
    Bike,
    MoreVertical,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { OrderHistory } from "../types/order-history.types";

const SOURCE_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    DINE_IN: { label: "Dine In", icon: <Utensils className="w-3 h-3" /> },
    TAKE_AWAY: { label: "Take Away", icon: <Package className="w-3 h-3" /> },
    DELIVERY: { label: "Delivery", icon: <Bike className="w-3 h-3" /> },
};

function formatTime(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

const VISIBLE_ITEMS = 3;

interface KanbanOrderCardProps {
    order: OrderHistory;
    /** Primary action button label & handler */
    primaryAction?: { label: string; onClick: () => void };
    /** Secondary action button label & handler */
    secondaryAction?: { label: string; onClick: () => void };
}

export const KanbanOrderCard: React.FC<KanbanOrderCardProps> = ({
    order,
    primaryAction,
    secondaryAction,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const sourceInfo = SOURCE_LABEL[order.source] ?? {
        label: order.source,
        icon: <ShoppingBag className="w-3 h-3" />,
    };

    const visibleItems = expanded
        ? order.orderItems
        : order.orderItems.slice(0, VISIBLE_ITEMS);
    const hiddenCount = order.orderItems.length - VISIBLE_ITEMS;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        {/* Info */}
                        <div>
                            <h6 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
                                #{order.orderId}
                            </h6>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    {sourceInfo.icon}
                                    {sourceInfo.label}
                                </span>
                                {order.source === "DINE_IN" && order.tableCode && (
                                    <>
                                        <span className="text-gray-300 text-xs">|</span>
                                        <span className="text-xs text-gray-500">
                                            Bàn {order.tableCode}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions menu */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {menuOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-9 z-20 min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-lg py-1">
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                            {order.customerName ?? order.staffName}
                        </span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(order.createdAt)}
                    </div>
                </div>

                {/* Items list */}
                <div className="border-t border-gray-100 pt-3 mb-3">
                    <ul className="space-y-2">
                        {visibleItems.map((item) => (
                            <li
                                key={item.orderItemId}
                                className="flex items-center justify-between text-xs"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.itemStatus?.toUpperCase() === "DONE"
                                                ? "bg-green-400"
                                                : "bg-gray-300"
                                            }`}
                                    />
                                    <span className="text-gray-700 truncate">
                                        {item.dishName}
                                    </span>
                                </div>
                                <span className="text-gray-500 flex-shrink-0 ml-2">
                                    ×{item.quantity}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {order.orderItems.length > VISIBLE_ITEMS && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="w-3 h-3" /> Thu gọn
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />+{hiddenCount} món nữa
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Footer total */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
                    <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-xs text-gray-500">{order.itemCount} món</span>
                </div>

                {/* Action buttons */}
                {(primaryAction || secondaryAction) && (
                    <div className="flex gap-2">
                        {secondaryAction && (
                            <button
                                onClick={secondaryAction.onClick}
                                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                        {primaryAction && (
                            <button
                                onClick={primaryAction.onClick}
                                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                {primaryAction.label}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
