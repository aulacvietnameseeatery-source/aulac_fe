import React, { useEffect, useRef, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import {
    ShoppingBag,
    Clock,
    ChevronDown,
    ChevronUp,
    Utensils,
    Package,
    Bike,
    MoreHorizontal,
    Eye,
    Pencil,
    X,
    CheckCircle,
    RotateCcw,
    Printer,
    CreditCard,
} from 'lucide-react';
import { OrderHistory } from '../types/order-history.types';
import { PaymentModal } from './PaymentModal';
import { PrintOrderModal } from './PrintOrderModal';
import { orderHistoryService } from '../services/order-history.service';
import { toast } from 'sonner';

// ─── Constants ──────────────────────────────────────────────────────────────

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    DINE_IN: <Utensils className="w-3 h-3" />,
    TAKE_AWAY: <Package className="w-3 h-3" />,
    DELIVERY: <Bike className="w-3 h-3" />,
};

const STATUS_STYLES: Record<string, string> = {
    Pending: 'bg-amber-50  text-amber-700  border border-amber-200',
    'In progress': 'bg-blue-50   text-blue-700   border border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Cancelled: 'bg-red-50    text-red-700    border border-red-200',
};

const PAYMENT_STYLES = {
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    unpaid: 'bg-rose-50 text-rose-600 border-rose-100',
};

// Context actions per status
type ActionKey = 'view' | 'edit' | 'start' | 'complete' | 'cancel' | 'reset' | 'print' | 'pay' | 'printReceipt';
const STATUS_ACTIONS: Record<string, ActionKey[]> = {
    Pending: ['view', 'cancel'],
    'In progress': ['view', 'cancel'],
    Completed: ['view', 'print', 'pay', 'printReceipt'],
    Cancelled: ['view', 'reset'],
};

const ACTION_ICONS: Record<ActionKey, { icon: React.ReactNode; danger?: boolean }> = {
    view: { icon: <Eye className="w-3.5 h-3.5" /> },
    edit: { icon: <Pencil className="w-3.5 h-3.5" /> },
    start: { icon: <ChevronDown className="w-3.5 h-3.5" /> },
    complete: { icon: <CheckCircle className="w-3.5 h-3.5" /> },
    cancel: { icon: <X className="w-3.5 h-3.5" />, danger: true },
    reset: { icon: <RotateCcw className="w-3.5 h-3.5" /> },
    print: { icon: <Printer className="w-3.5 h-3.5" /> },
    pay: { icon: <CreditCard className="w-3.5 h-3.5" /> },
    printReceipt: { icon: <Printer className="w-3.5 h-3.5" /> },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const VISIBLE_ITEMS_COUNT = 3;

// ─── Props ───────────────────────────────────────────────────────────────────

interface OrderCardProps {
    order: OrderHistory;
    onStatusChange?: (orderId: number, newStatus: string) => void;
    onAction?: (orderId: number, action: ActionKey) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, onAction }) => {
    const t = useTranslations('Order.List.card');
    const format = useFormatter();
    const [expanded, setExpanded] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printType, setPrintType] = useState<'invoice' | 'receipt'>('receipt');

    const actionsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const sourceIcon = SOURCE_ICONS[order.source] ?? <ShoppingBag className="w-3 h-3" />;
    const statusStyle = STATUS_STYLES[order.orderStatus] ?? 'bg-gray-50 text-gray-700 border border-gray-200';

    // Filter context actions
    const contextActions: ActionKey[] = (STATUS_ACTIONS[order.orderStatus] ?? ['view']).filter(action => {
        if (action === 'print') {
            return order.orderStatus === 'Completed' && !order.isPaid;
        }
        if (action === 'pay') {
            return order.orderStatus === 'Completed' && !order.isPaid;
        }
        if (action === 'printReceipt') {
            return order.orderStatus === 'Completed' && order.isPaid;
        }
        return true;
    });

    const visibleItems = expanded ? order.orderItems : order.orderItems.slice(0, VISIBLE_ITEMS_COUNT);
    const hiddenCount = order.orderItems.length - VISIBLE_ITEMS_COUNT;
    const showPaymentBadge = order.orderStatus === 'Completed';

    const handleActionClick = (key: ActionKey) => {
        if (key === 'pay') {
            setIsPaymentModalOpen(true);
        } else if (key === 'print') {
            setPrintType('invoice');
            setIsPrintModalOpen(true);
        } else if (key === 'printReceipt') {
            setPrintType('receipt');
            setIsPrintModalOpen(true);
        } else {
            onAction?.(order.orderId, key);
        }
        setActionsOpen(false);
    };

    const handlePaymentComplete = async (orderId: number, data: any) => {
        setIsProcessingPayment(true);
        try {
            await orderHistoryService.processPayment(data);
            toast.success(t('paymentSuccess') || 'Payment processed successfully');
            setIsPaymentModalOpen(false);
            // Re-trigger a refresh of the parent list
            if (onStatusChange) {
                // We use a dummy status change or a dedicated refresh callback if available
                // For now, let's just trigger a re-fetch by notifying parent of its current status
                onStatusChange(orderId, order.orderStatus);
            }
        } catch (error) {
            console.error('Payment failed:', error);
            toast.error(t('paymentError') || 'Failed to process payment');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onAction?.(order.orderId, 'view')}
        >
            <div className="p-4 flex flex-col flex-1">

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    {/* Left: icon + order info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h6 className="font-semibold text-gray-900 text-sm leading-tight">#{order.orderId}</h6>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    {sourceIcon}
                                    {t(`source.${order.source}`)}
                                </span>
                                {order.source === 'DINE_IN' && order.tableCode && (
                                    <>
                                        <span className="text-gray-300 text-xs text-blue-100 italic">|</span>
                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                            {t('table')} {order.tableCode}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: status dropdown + 3-dot menu */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">

                        {/* Status badge (static) */}
                        <div
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.split(' ')[0].replace('bg-', 'bg-')}`} />
                            {t(`status.${order.orderStatus}`)}
                        </div>

                        {/* Payment badge */}
                        {showPaymentBadge && (
                            <div
                                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${order.isPaid ? PAYMENT_STYLES.paid : PAYMENT_STYLES.unpaid}`}
                                title={order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                            >
                                <CreditCard className="w-2.5 h-2.5" />
                                {order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                            </div>
                        )}

                        {/* 3-dot actions menu */}
                        <div className="relative" ref={actionsRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActionsOpen(o => !o); }}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title={t('actions')}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionsOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-44 py-1 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {contextActions.map(key => {
                                        const iconWrap = ACTION_ICONS[key];
                                        return (
                                            <button
                                                key={key}
                                                onClick={(e) => { e.stopPropagation(); handleActionClick(key); }}
                                                className={`w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${iconWrap.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}
                                            >
                                                {iconWrap.icon}
                                                {t(`action.${key}`)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Meta row ── */}
                <div className="flex items-center justify-between mb-3">
                    <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-700 block truncate">
                            {order.customerName ?? order.staffName}
                        </span>
                        {order.tableCode && (
                            <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
                                {t('table')} {order.tableCode}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Clock className="w-4 h-4" />
                        {order.createdAt ? format.dateTime(new Date(order.createdAt), { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                </div>

                {/* ── Order Items ── */}
                <div className="border-t border-gray-100 pt-3 mb-3 flex-1">
                    <ul className="space-y-2">
                        {visibleItems.map((item) => (
                            <li key={item.orderItemId} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        <span className="text-gray-700 truncate">{item.dishName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span className="text-gray-500">×{item.quantity}</span>
                                        <span className="text-gray-400 font-mono">{format.number(item.price, { style: 'currency', currency: 'CHF' })}</span>
                                    </div>
                                </div>
                                {item.note && (
                                    <div className="flex items-start gap-1 p-1 bg-gray-50/50 rounded-md border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-600 line-clamp-2">
                                            <span className="font-bold text-[9px] mr-1 text-gray-400 uppercase">
                                                {t('note')}:
                                            </span>
                                            {item.note}
                                        </p>
                                    </div>
                                )}
                                {item.rejectReason && (
                                    <div className="flex items-start gap-1 p-1 bg-red-50/50 rounded-md border border-red-100">
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

                    {order.orderItems.length > VISIBLE_ITEMS_COUNT && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpanded(prev => !prev); }}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {expanded ? (
                                <><ChevronUp className="w-3 h-3" />{t('collapse')}</>
                            ) : (
                                <><ChevronDown className="w-3 h-3" />+{hiddenCount} {t('moreItems')}</>
                            )}
                        </button>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{format.number(order.totalAmount, { style: 'currency', currency: 'CHF' })}</span>
                        {order.tipAmount != null && order.tipAmount > 0 && (
                            <span className="text-xs text-emerald-600 font-medium">
                                + {t('tip')} {format.number(order.tipAmount, { style: 'currency', currency: 'CHF' })}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">{order.itemCount} {t('items')}</span>
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
