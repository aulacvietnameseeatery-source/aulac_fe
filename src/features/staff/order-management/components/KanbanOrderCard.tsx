"use client";

import React, { useState } from "react";
import {
    ShoppingBag,
    Clock,
    Utensils,
    Package,
    Bike,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { OrderHistory } from "../types/order-history.types";
import { PrintOrderModal } from "./PrintOrderModal";
import { PaymentModal } from "./PaymentModal";
import { orderHistoryService } from "../services/order-history.service";
import { toast } from "sonner";

const SOURCE_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    DINE_IN: { label: "Dine In", icon: <Utensils className="w-3 h-3" /> },
    TAKE_AWAY: { label: "Take Away", icon: <Package className="w-3 h-3" /> },
    DELIVERY: { label: "Delivery", icon: <Bike className="w-3 h-3" /> },
};

const PAYMENT_STYLES = {
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    unpaid: 'bg-rose-50 text-rose-600 border-rose-100',
};

function formatTime(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(amount: number) {
    // Format with en-US to ensure dot for decimals instead of comma
    return `CHF ${amount.toLocaleString('en-US')}`;
}

const VISIBLE_ITEMS = 3;

interface KanbanOrderCardProps {
    order: OrderHistory;
    /** Primary action button label & handler */
    primaryAction?: { label: string; onClick: () => void };
    /** Secondary action button label & handler */
    secondaryAction?: { label: string; onClick: () => void };
    onAction?: (orderId: number, action: string) => void;
}

export const KanbanOrderCard: React.FC<KanbanOrderCardProps> = ({
    order,
    primaryAction,
    secondaryAction,
    onAction,
}) => {
    const t = useTranslations("Order.List.card");
    const [expanded, setExpanded] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printType, setPrintType] = useState<'invoice' | 'receipt'>('receipt');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handlePaymentComplete = async (orderId: number, data: any) => {
        setIsProcessingPayment(true);
        try {
            await orderHistoryService.processPayment(data);
            toast.success(t('paymentSuccess') || 'Payment processed successfully');
            setIsPaymentModalOpen(false);
            if (onAction) {
                // Refresh list using an action callback
                onAction(orderId, 'pay_complete');
            }
        } catch (error) {
            console.error('Payment failed:', error);
            toast.error(t('paymentError') || 'Failed to process payment');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const sourceInfo = SOURCE_LABEL[order.source] ?? {
        label: order.source,
        icon: <ShoppingBag className="w-3 h-3" />,
    };

    const visibleItems = expanded
        ? order.orderItems
        : order.orderItems.slice(0, VISIBLE_ITEMS);
    const hiddenCount = order.orderItems.length - VISIBLE_ITEMS;

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onAction?.(order.orderId, 'view')}
        >
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
                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                            {t('table') || 'Bàn'} {order.tableCode}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions menu removed as per user request, but keeping payment status */}
                    <div className="relative flex-shrink-0 flex items-center">
                        {order.orderStatus === 'Completed' && (
                            <div
                                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${order.isPaid ? PAYMENT_STYLES.paid : PAYMENT_STYLES.unpaid}`}
                                title={order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                            >
                                {order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                            </div>
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
                                className="flex flex-col gap-0.5"
                            >
                                <div className="flex items-center justify-between text-xs">
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
                                </div>
                                {item.note && (
                                    <div className="flex items-start gap-1 p-1 bg-gray-50/50 rounded-md border border-gray-100 mt-1">
                                        <p className="text-[10px] font-bold text-gray-600 line-clamp-2">
                                            <span className="font-bold text-[9px] mr-1 text-gray-400 uppercase">
                                                {t('note')}:
                                            </span>
                                            {item.note}
                                        </p>
                                    </div>
                                )}
                                {item.rejectReason && (
                                    <div className="flex items-start gap-1 p-1 bg-red-50/50 rounded-md border border-red-100 mt-1">
                                        <p className="text-[10px] text-red-600 line-clamp-2 font-medium">
                                            <span className="font-bold text-[9px] mr-1 text-red-400 uppercase">
                                                {t('rejectReason')}:
                                            </span>
                                            {item.rejectReason}
                                        </p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {order.orderItems.length > VISIBLE_ITEMS && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
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
                <div className="flex gap-2">
                    {/* Secondary action based on status and payment */}
                    {(order.orderStatus === 'Pending' || order.orderStatus === 'In progress') ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction?.(order.orderId, 'view'); }}
                                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                {t('action.view')}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction?.(order.orderId, 'cancel'); }}
                                className="flex-1 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
                            >
                                {t('action.cancel')}
                            </button>
                        </>
                    ) : order.orderStatus === 'Completed' ? (
                        order.isPaid ? (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAction?.(order.orderId, 'view'); }}
                                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    {t('action.view')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPrintType('receipt'); setIsPrintModalOpen(true); }}
                                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    {t('action.printReceipt')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAction?.(order.orderId, 'view'); }}
                                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    title={t('action.view')}
                                >
                                    {t('action.view')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsPaymentModalOpen(true); }}
                                    className="flex-1 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    {t('action.pay')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPrintType('invoice'); setIsPrintModalOpen(true); }}
                                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    {t('action.print')}
                                </button>
                            </>
                        )
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction?.(order.orderId, 'view'); }}
                                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                {t('action.view')}
                            </button>
                            {primaryAction && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); primaryAction.onClick(); }}
                                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    {primaryAction.label}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <PaymentModal
                order={order}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentComplete={handlePaymentComplete}
                isLoading={isProcessingPayment}
            />

            <PrintOrderModal
                order={order}
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                type={printType}
            />
        </div>
    );
};
