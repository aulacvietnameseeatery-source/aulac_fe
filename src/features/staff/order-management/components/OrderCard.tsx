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
    Pending: 'bg-amber-600 text-white border border-amber-600',
    'In progress': 'bg-blue-600 text-white border border-blue-600',
    Completed: 'bg-emerald-600 text-white border border-emerald-600',
    Cancelled: 'bg-red-600 text-white border border-red-600',
};

const PAYMENT_STYLES = {
    paid: 'bg-emerald-600 text-white border-emerald-600',
    unpaid: 'bg-red-600 text-white border-red-600',
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onAction?.(order.orderId, 'view')}
        >
            <div className="p-4 flex flex-col flex-1">

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    {/* Left: icon + order info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-[#1A3A52] flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h6 className="font-semibold text-[#1A3A52] text-sm leading-tight">#{order.orderId}</h6>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-[#1A3A52]/55">
                                    {sourceIcon}
                                    {t(`source.${order.source}`)}
                                </span>
                                {order.source === 'DINE_IN' && order.tableCode && (
                                    <>
                                        <span className="text-[#D5BA98] text-xs italic">|</span>
                                        <span className="text-xs font-bold text-[#1A3A52] bg-[#D5BA98]/18 px-1.5 py-0.5 rounded border border-[#D5BA98]/45 shadow-none animate-in fade-in zoom-in duration-300">
                                            {t('table')} {order.tableCode}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: status dropdown + 3-dot menu */}
                    <div className="flex items-center gap-1.5 shrink-0">

                        {/* Status badge (static) */}
                        <div
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${statusStyle}`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/85" />
                            {t(`status.${order.orderStatus}`)}
                        </div>

                        {/* Payment badge */}
                        {showPaymentBadge && (
                            <div
                                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shadow-sm ${order.isPaid ? PAYMENT_STYLES.paid : PAYMENT_STYLES.unpaid}`}
                                data-tooltip-content={order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                                data-tooltip-id="my-tooltip"
                            >
                                <CreditCard className="w-2.5 h-2.5" />
                                {order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')}
                            </div>
                        )}

                        {/* 3-dot actions menu */}
                        <div className="relative" ref={actionsRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActionsOpen(o => !o); }}
                                className="p-1 rounded-lg text-[#1A3A52]/40 hover:text-[#1A3A52] hover:bg-[#D5BA98]/12 transition-colors"
                                data-tooltip-content={t('actions')}
                                data-tooltip-id="my-tooltip"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionsOpen && (
                                <div
                                    className="absolute right-0 top-full mt-1 z-50 bg-[#FDFBF9] border border-[#D5BA98]/50 rounded-lg shadow-lg w-44 py-1 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {contextActions.map(key => {
                                        const iconWrap = ACTION_ICONS[key];
                                        return (
                                            <button
                                                key={key}
                                                onClick={(e) => { e.stopPropagation(); handleActionClick(key); }}
                                                className={`w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-[#D5BA98]/10 transition-colors ${iconWrap.danger ? 'text-[#8C3A3A] hover:bg-[#8C3A3A]/8' : 'text-[#1A3A52]'}`}
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
                        <span className="text-xs font-medium text-[#1A3A52] block truncate">
                            {order.customerName ?? order.staffName}
                        </span>
                        {order.tableCode && (
                            <span className="text-[11px] text-[#1A3A52]/75 font-semibold block mt-0.5">
                                {t('table')} {order.tableCode}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1A3A52]/75">
                        <Clock className="w-4 h-4" />
                        {order.createdAt ? format.dateTime(new Date(order.createdAt), { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                </div>

                {/* ── Order Items ── */}
                <div className="border-t border-[#D5BA98]/25 pt-3 mb-3 flex-1">
                    <ul className="space-y-2">
                        {visibleItems.map((item) => (
                            <li key={item.orderItemId} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D5BA98] shrink-0" />
                                        <span className="text-[#1A3A52]/85 truncate">{item.dishName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-[#1A3A52]/55">×{item.quantity}</span>
                                        <span className="text-[#1A3A52]/45 font-mono">{format.number(item.price, { style: 'currency', currency: 'CHF' })}</span>
                                    </div>
                                </div>
                                {item.note && (
                                    <div className="flex items-start gap-1 p-1 bg-[#D5BA98]/10 rounded-md border border-[#D5BA98]/30">
                                        <p className="text-[10px] font-bold text-[#1A3A52]/75 line-clamp-2">
                                            <span className="font-bold text-[9px] mr-1 text-[#1A3A52]/45 uppercase">
                                                {t('note')}:
                                            </span>
                                            {item.note}
                                        </p>
                                    </div>
                                )}
                                {item.rejectReason && (
                                    <div className="flex items-start gap-1 p-1 bg-[#8C3A3A]/8 rounded-md border border-[#8C3A3A]/20">
                                        <p className="text-[10px] text-[#8C3A3A] line-clamp-2 font-medium">
                                            <span className="font-bold text-[9px] mr-1 text-[#8C3A3A]/70 uppercase">
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
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#1A3A52] hover:text-[#1A3A52]/80 transition-colors"
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
                <div className="flex items-center justify-between pt-3 border-t border-[#D5BA98]/25">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1A3A52]">{format.number(order.totalAmount, { style: 'currency', currency: 'CHF' })}</span>
                        {order.tipAmount != null && order.tipAmount > 0 && (
                            <span className="text-xs text-[#4A5D4E] font-medium">
                                + {t('tip')} {format.number(order.tipAmount, { style: 'currency', currency: 'CHF' })}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-[#1A3A52]/55">{order.itemCount} {t('items')}</span>
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
