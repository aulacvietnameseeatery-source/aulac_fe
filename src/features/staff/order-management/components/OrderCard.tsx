import React, { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import {
    ShoppingBag,
    Clock,
    ChevronDown,
    ChevronUp,
    Utensils,
    Package,
    Bike,
    Eye,
    X,
    RotateCcw,
    Printer,
    CreditCard,
} from 'lucide-react';
import { OrderHistory } from '../types/order-history.types';
import { OrderItemStatusCode } from '@/types/status-codes';
import { PaymentModal } from './PaymentModal';
import { PrintOrderModal } from './PrintOrderModal';
import { orderHistoryService } from '../services/order-history.service';
import { toast } from 'sonner';
import { CouponDTO } from '../../coupon-management/coupon-list/types/coupon.types';
import { staffCouponService } from '../../coupon-management/coupon-list/services/coupon-service';
import { PromotionListDTO } from '../../promotion-management/promotion-list/types/promotion-types';
import { OrderDetailDto } from '../../order-create/types/edit-order.types';
import { formatCHF } from '@/lib/format-chf-utils';
import { getLocalizedApiErrorMessage } from '@/lib/api-error';

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
type ActionKey = 'view' | 'cancel' | 'reset' | 'print' | 'pay' | 'printReceipt';
const STATUS_ACTIONS: Record<string, ActionKey[]> = {
    Pending: ['view', 'cancel'],
    'In progress': ['view', 'cancel'],
    Completed: ['view', 'print', 'pay', 'printReceipt'],
    Cancelled: ['view', 'reset'],
};

const ACTION_ICONS: Record<ActionKey, { icon: React.ReactNode; danger?: boolean }> = {
    view: { icon: <Eye className="w-3.5 h-3.5" /> },
    cancel: { icon: <X className="w-3.5 h-3.5" />, danger: true },
    reset: { icon: <RotateCcw className="w-3.5 h-3.5" /> },
    print: { icon: <Printer className="w-3.5 h-3.5" /> },
    pay: { icon: <CreditCard className="w-3.5 h-3.5" /> },
    printReceipt: { icon: <Printer className="w-3.5 h-3.5" /> },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const VISIBLE_ITEMS_COUNT = 3;

// Helper: Map OrderHistory sang OrderDetailDto cho Invoice
const mapOrderHistoryToOrderDetailDto = (order: OrderHistory): OrderDetailDto => {
    const subTotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        orderId: order.orderId,
        tableId: order.tableId,
        tableCode: order.tableCode,
        staffId: order.staffId,
        staffName: order.staffName,
        customerId: order.customerId,
        customerName: order.customerName,
        subTotalAmount: subTotal,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount || 0,
        tipAmount: order.tipAmount || 0,
        orderStatus: order.orderStatus as any,
        source: order.source,
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
        isPaid: order.isPaid,
        orderItems: order.orderItems.map(item => ({
            orderItemId: item.orderItemId,
            dishId: item.dishId,
            dishName: item.dishName,
            quantity: item.quantity,
            price: item.price,
            itemStatus: item.itemStatus as any,
            note: item.note,
            rejectReason: item.rejectReason,
        })),
        promotions: [],
        coupons: [],
        payments: [],
        itemCount: order.itemCount
    };
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface OrderCardProps {
    order: OrderHistory;
    onStatusChange?: (orderId: number, newStatus: string) => void;
    onAction?: (orderId: number, action: ActionKey) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, onAction }) => {
    const t = useTranslations('orders.management.List.card');
    const format = useFormatter();

    const [expanded, setExpanded] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printType, setPrintType] = useState<'invoice' | 'receipt'>('receipt');
    const [printData, setPrintData] = useState<OrderDetailDto | null>(null);
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [paymentCoupons, setPaymentCoupons] = useState<CouponDTO[]>([]);

    React.useEffect(() => {
        if (!isPaymentModalOpen) return;

        const loadCoupons = async () => {
            try {
                const data = await staffCouponService.getCoupons(order.customerId);
                setPaymentCoupons(data ?? []);
            } catch (error) {
                console.error('Failed to fetch customer coupons:', error);
                setPaymentCoupons([]);
            }
        };

        void loadCoupons();
    }, [isPaymentModalOpen, order.customerId]);

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

    const handleActionClick = async (key: ActionKey) => {
        if (key === 'pay') {
            setIsPaymentModalOpen(true);
        } else if (key === 'print') {
            const mappedData = mapOrderHistoryToOrderDetailDto(order);
            setPrintData(mappedData);
            setPrintType('invoice');
            setIsPrintModalOpen(true);
        } else if (key === 'printReceipt') {
            try {
                setIsFetchingOrder(true);
                const orderDetail = await orderHistoryService.getOrderById(order.orderId);
                const mappedOrderDetail: OrderDetailDto = {
                    ...orderDetail,
                    orderItems: orderDetail.orderItems.map(item => ({
                        ...item,
                        dishName: item.dishName || item.dishNameI18n?.['en'] || ''
                    }))
                };
                setPrintData(mappedOrderDetail);
                setPrintType('receipt');
                setIsPrintModalOpen(true);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error);
                toast.error(t('fetchOrderError') || 'Cannot load order details for printing.');
            } finally {
                setIsFetchingOrder(false);
            }
        } else {
            onAction?.(order.orderId, key);
        }
    };

    const handlePaymentComplete = async (orderId: number, data: any) => {
        setIsProcessingPayment(true);
        try {
            console.info('[OrderCard] submit payment request', {
                orderId,
                payload: data,
                orderCustomerId: order.customerId,
            });
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
            const apiError = error as any;
            console.error('Payment failed:', {
                error,
                response: apiError?.response?.data,
                orderId,
                payload: data,
            });

            const localizedMessage = getLocalizedApiErrorMessage(error, t('paymentError'));
            const validateInfo = apiError?.response?.data?.validateInfo;
            const systemMessage = apiError?.response?.data?.systemMessage;
            const details = Array.isArray(validateInfo) && validateInfo.length > 0
                ? validateInfo.filter(Boolean).map(String)
                : systemMessage
                    ? [String(systemMessage)]
                    : [];

            toast.error(localizedMessage, details.length > 0 ? { description: details.join(' | ') } : undefined);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div
                className="bg-white rounded-xl shadow-sm border border border-[#D5BA98]/60 flex flex-col flex-1 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
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

                        {/* Right: status badges */}
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
                                            <span className="text-[#1A3A52]/45 font-mono">{formatCHF(item.price)}</span>
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
                                    {item.itemStatus === OrderItemStatusCode.CANCELLED && (
                                        <div className="flex items-start gap-1 p-1 bg-[#8C3A3A]/8 rounded-md border border-[#8C3A3A]/20">
                                            <p className="text-[10px] text-[#8C3A3A] line-clamp-2 font-medium italic">
                                                {t('customerCancelled')}
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
                            <span className="text-sm font-bold text-[#1A3A52]">{formatCHF(order.totalAmount)}</span>
                            {order.tipAmount != null && order.tipAmount > 0 && (
                                <span className="text-xs text-[#4A5D4E] font-medium">
                                    + {t('tip')} {formatCHF(order.tipAmount)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-[#1A3A52]/55">{order.itemCount} {t('items')}</span>
                    </div>
                </div>
            </div>

            {/* External action bar below the card */}
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" onClick={(e) => e.stopPropagation()}>
                {contextActions.map((key) => {
                    const iconWrap = ACTION_ICONS[key];
                    return (
                        <button
                            key={key}
                            onClick={() => handleActionClick(key)}
                            className={`h-8 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${iconWrap.danger
                                ? 'border-[#8C3A3A]/30 text-[#8C3A3A] bg-[#FDFBF9] hover:bg-[#8C3A3A]/8'
                                : 'border-[#D5BA98]/60 text-[#1A3A52] bg-[#FDFBF9] hover:bg-[#D5BA98]/10'
                                }`}
                            data-tooltip-content={t(`action.${key}`)}
                            data-tooltip-id="my-tooltip"
                        >
                            {iconWrap.icon}
                            {t(`action.${key}`)}
                        </button>
                    );
                })}
            </div>

            <PaymentModal
                order={order}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentComplete={handlePaymentComplete}
                isLoading={isProcessingPayment}
                couponOptions={paymentCoupons}
            />

            <PrintOrderModal
                order={printData as any}
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                type={printType}
            />
        </div>
    );
};
