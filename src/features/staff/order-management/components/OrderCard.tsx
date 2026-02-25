import React, { useState } from 'react';
import {
    ShoppingBag,
    Clock,
    ChevronDown,
    ChevronUp,
    Utensils,
    Package,
    Bike,
} from 'lucide-react';
import { OrderHistory } from '../types/order-history.types';

const SOURCE_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    DINE_IN: { label: 'Dine In', icon: <Utensils className="w-3 h-3" /> },
    TAKE_AWAY: { label: 'Take Away', icon: <Package className="w-3 h-3" /> },
    DELIVERY: { label: 'Delivery', icon: <Bike className="w-3 h-3" /> },
};

const ORDER_STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    PREPARING: 'bg-blue-50 text-blue-700 border border-blue-200',
    SERVED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

function formatTime(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const VISIBLE_ITEMS_COUNT = 3;

interface OrderCardProps {
    order: OrderHistory;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const [expanded, setExpanded] = useState(false);

    const sourceInfo = SOURCE_LABEL[order.source] ?? { label: order.source, icon: <ShoppingBag className="w-3 h-3" /> };
    const statusStyle = ORDER_STATUS_STYLES[order.orderStatus] ?? 'bg-gray-50 text-gray-700 border border-gray-200';

    const visibleItems = expanded ? order.orderItems : order.orderItems.slice(0, VISIBLE_ITEMS_COUNT);
    const hiddenCount = order.orderItems.length - VISIBLE_ITEMS_COUNT;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="p-4 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        {/* Order info */}
                        <div>
                            <h6 className="font-semibold text-gray-900 text-sm leading-tight">
                                #{order.orderId}
                            </h6>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    {sourceInfo.icon}
                                    {sourceInfo.label}
                                </span>
                                {order.source === 'DINE_IN' && order.tableCode && (
                                    <>
                                        <span className="text-gray-300 text-xs">|</span>
                                        <span className="text-xs text-gray-500">Bàn {order.tableCode}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Status badge */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>
                        {order.orderStatus}
                    </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                            {order.customerName ?? order.staffName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(order.createdAt)}
                    </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-100 pt-3 mb-3 flex-1">
                    <ul className="space-y-2">
                        {visibleItems.map((item) => (
                            <li key={item.orderItemId} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                    <span className="text-gray-700 truncate">{item.dishName}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <span className="text-gray-500">×{item.quantity}</span>
                                    <span className="text-gray-400 font-mono">{formatCurrency(item.price)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Show more / less */}
                    {order.orderItems.length > VISIBLE_ITEMS_COUNT && (
                        <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="w-3 h-3" />
                                    Thu gọn
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />+{hiddenCount} món nữa
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    <span className="text-xs text-gray-500">
                        {order.itemCount} món
                    </span>
                </div>
            </div>
        </div>
    );
};
