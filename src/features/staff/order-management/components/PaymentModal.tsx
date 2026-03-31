'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations, useFormatter, useLocale } from 'next-intl';
import {
    Banknote,
    CreditCard,
    QrCode,
} from 'lucide-react';
import {
    Dialog,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ALInput } from '@/components/ui/al-input';
import { ALCombobox } from '@/components/ui/al-combobox';
import { OrderHistory } from '../types/order-history.types';
import { CouponDTO } from '../../coupon-management/coupon-list/types/coupon.types';
import { staffPromotionService } from '../../promotion-management/promotion-list/services/promotion-service';
import { AvailablePromotionDTO } from '../../promotion-management/promotion-list/types/promotion-types';
import { useTaxesQuery } from '../../tax-management/hooks/useTaxMutation';
import { formatCHF } from '@/lib/format-chf-utils';

interface PaymentModalProps {
    order: OrderHistory;
    isOpen: boolean;
    onClose: () => void;
    onPaymentComplete: (orderId: number, paymentData: any) => void;
    isLoading?: boolean;
    couponOptions?: CouponDTO[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    order,
    isOpen,
    onClose,
    onPaymentComplete,
    isLoading = false,
    couponOptions = [],
}) => {
    const t = useTranslations('orders.management.PaymentModal');
    const tCommon = useTranslations('orders.management.List.card');
    const format = useFormatter();
    const locale = useLocale();

    const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'scan'>('cash');
    const [tipAmount, setTipAmount] = useState<number>(0);
    const [note, setNote] = useState('');
    const [availablePromotions, setAvailablePromotions] = useState<AvailablePromotionDTO[]>([]);
    const [selectedCouponIds, setSelectedCouponIds] = useState<string[]>([]);
    const [isFetchingPromos, setIsFetchingPromos] = useState(false);

    // Fetch available promotions when modal opens
    React.useEffect(() => {
        if (isOpen && order.orderId) {
            const fetchPromos = async () => {
                setIsFetchingPromos(true);
                try {
                    const promos = await staffPromotionService.getAvailablePromotions(order.orderId);
                    setAvailablePromotions(promos || []);
                } catch (error) {
                    console.error("Failed to fetch available promotions:", error);
                } finally {
                    setIsFetchingPromos(false);
                }
            };
            void fetchPromos();
        } else {
            setAvailablePromotions([]);
        }
    }, [isOpen, order.orderId]);

    const subTotal = order.orderItems
        .filter(item => item.itemStatus !== 'REJECTED' && item.itemStatus !== 'CANCELLED')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: taxes = [] } = useTaxesQuery();
    const defaultTaxes = React.useMemo(() => taxes.filter(t => t.isActive && t.isDefault), [taxes]);

    const serviceCharge = 0;

    const selectedCoupons = React.useMemo(
        () => couponOptions.filter((p) => selectedCouponIds.includes(p.couponId.toString())),
        [couponOptions, selectedCouponIds],
    );

    const calcDiscountAmount = React.useCallback((discount?: { type?: string; promotionType?: string; discountValue: number }) => {
        if (!discount) return 0;
        const type = discount.promotionType || discount.type;
        if (type === 'PERCENT') {
            return subTotal * (discount.discountValue / 100);
        }
        return discount.discountValue;
    }, [subTotal]);

    const couponAmount = React.useMemo(() => {
        return selectedCoupons.reduce((sum, coupon) => sum + calcDiscountAmount(coupon), 0);
    }, [selectedCoupons, calcDiscountAmount]);

    const autoPromotionAmount = React.useMemo(() => {
        return availablePromotions.reduce((sum, promo) => sum + promo.estimatedDiscount, 0);
    }, [availablePromotions]);

    const totalDiscount = React.useMemo(() => {
        let amount = autoPromotionAmount;
        if (selectedCoupons.length > 0) {
            amount += couponAmount;
        }
        return amount;
    }, [autoPromotionAmount, selectedCoupons, couponAmount]);

    const baseForTax = Math.max(0, subTotal - totalDiscount);

    const calculatedTaxes = React.useMemo(() => {
        return defaultTaxes.map(t => {
            const amount = t.taxType === 'EXCLUSIVE'
                ? baseForTax * (t.taxRate / 100)
                : baseForTax * ((t.taxRate / 100) / (1 + (t.taxRate / 100)));
            return { ...t, amount };
        });
    }, [defaultTaxes, baseForTax]);

    const totalExclusiveTax = calculatedTaxes
        .filter(t => t.taxType === 'EXCLUSIVE')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalTaxAmount = calculatedTaxes.reduce((sum, t) => sum + t.amount, 0);

    const total = Math.max(0, subTotal + totalExclusiveTax + tipAmount - totalDiscount);

    const [givenAmount, setGivenAmount] = useState<number>(total);
    const balance = Math.max(0, givenAmount - total);

    // Sync givenAmount when total changes
    React.useEffect(() => {
        setGivenAmount(total);
    }, [total]);

    const handlePay = () => {
        const methodMap: Record<string, string> = {
            'cash': 'CASH',
            'card': 'CARD',
            'scan': 'QR'
        };
        onPaymentComplete(order.orderId, {
            orderId: order.orderId,
            receivedAmount: givenAmount,
            paymentMethod: methodMap[paymentType],
            couponIds: selectedCouponIds.map(Number),
            note: note || undefined,
            tipAmount: tipAmount || undefined
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={t('title')}
            width="min(900px, 95vw)"
            footer={
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full px-1 sm:px-0 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="h-11 px-7 font-semibold w-full sm:w-auto">
                        {t('close')}
                    </Button>
                    <Button
                        variant="success"
                        onClick={handlePay}
                        isLoading={isLoading}
                        className="h-11 px-7 font-semibold w-full sm:w-auto"
                    >
                        {isLoading ? t('paying') : t('payAndComplete')}
                    </Button>
                </div>
            }
        >
            <div onClick={(e) => e.stopPropagation()}>
                <div className="space-y-5 md:space-y-7 max-h-[70vh] overflow-y-auto px-2 py-1 sm:px-3 md:px-4 md:py-2 custom-scrollbar">
                    {/* Final Total Banner */}
                    <div className="bg-[#FDFBF9] rounded-2xl p-4 sm:p-5 md:p-6 text-center border border-[#D5BA98]/45 shadow-sm">
                        <p className="text-xs uppercase tracking-wider font-semibold text-[#1A3A52]/60 mb-1">{t('finalTotal')}</p>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A3A52] leading-tight">
                            {t('finalTotal')}: {formatCHF(total)}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8 lg:gap-10">
                        {/* Left Column: Order Details */}
                        <div className="space-y-5 sm:space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-[#1A3A52] mb-4 uppercase tracking-wider">{t('orderInfo')}</h3>
                                <div className="space-y-2.5 text-sm bg-[#FDFBF9] border border-[#D5BA98]/35 rounded-xl p-4 sm:p-4.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-[#1A3A52]/60">{t('orderNo')}</span>
                                        <span className="font-bold text-[#1A3A52]">#{order.orderId}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-[#1A3A52]/60">{t('noOfItems')}</span>
                                        <span className="font-bold text-[#1A3A52]">{order.itemCount}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-[#1A3A52]/60">{t('orderType')}</span>
                                        <span className="font-bold text-[#1A3A52] text-right break-words max-w-[60%]">
                                            {tCommon(`source.${order.source}`)}
                                            {order.tableCode ? ` (${tCommon('table')} ${order.tableCode})` : ''}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-[#1A3A52] mb-4 uppercase tracking-wider">{t('orderedMenus')}</h3>
                                <div className="max-h-48 overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scrollbar">
                                    {order.orderItems
                                        .filter(item => item.itemStatus !== 'REJECTED' && item.itemStatus !== 'CANCELLED')
                                        .map((item, idx) => {
                                            const itemPromos = availablePromotions.filter(p =>
                                                p.targetDishIds?.includes(item.dishId) ||
                                                p.targetCategoryIds?.includes(item.categoryId)
                                            );
                                            return (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex items-start justify-between gap-3 text-sm">
                                                        <span className="text-[#1A3A52]/85 flex-1 break-words">{item.dishName} ×{item.quantity}</span>
                                                        <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                                                            <span className="font-mono text-[#1A3A52]/75">{formatCHF(item.price * item.quantity)}</span>
                                                        </div>
                                                        <span className="sm:hidden font-mono text-[#1A3A52]/75 shrink-0">{formatCHF(item.price * item.quantity)}</span>
                                                    </div>
                                                    {itemPromos.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 ml-2">
                                                            {itemPromos.map((promo, pIdx) => (
                                                                <div key={pIdx} className="flex flex-col gap-0.5 text-[10px] text-emerald-600 font-bold">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="bg-emerald-50 px-1 rounded border border-emerald-100 italic">
                                                                            {t('autoPromotion')}: {promo.promoName} ({promo.promotionType === 'PERCENT' ? `${promo.discountValue}%` : formatCHF(promo.discountValue)})
                                                                        </span>
                                                                    </div>
                                                                    {promo.appliedRule && (
                                                                        <span className="text-[9px] text-[#1A3A52]/50 ml-1 font-normal italic leading-tight">
                                                                            <span className="block">{promo.appliedRule[locale] || promo.appliedRule['en']}</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </section>

                            <section className="pt-4 border-t border-[#D5BA98]/35 space-y-2.5 text-sm">
                                <div className="flex items-start justify-between gap-3 text-[#1A3A52]/70">
                                    <span>{t('subTotal')}</span>
                                    <span>{formatCHF(subTotal)}</span>
                                </div>
                                {calculatedTaxes.map((t, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-3 text-[#1A3A52]/70">
                                        <span>{t.taxName} ({t.taxRate}% {t.taxType.toLowerCase()})</span>
                                        <span>{formatCHF(t.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex items-start justify-between gap-3 text-[#1A3A52]/70 font-medium">
                                    <span>{t('totalTax')}</span>
                                    <span>{formatCHF(totalTaxAmount)}</span>
                                </div>
                                {autoPromotionAmount > 0 && (
                                    <div className="flex items-start justify-between gap-3 text-emerald-600 font-medium">
                                        <span>{t('appliedPromotions')}</span>
                                        <span>-{formatCHF(autoPromotionAmount)}</span>
                                    </div>
                                )}
                                {couponAmount > 0 && (
                                    <div className="flex items-start justify-between gap-3 text-red-600 font-medium">
                                        <span>{t('coupon')}</span>
                                        <span>-{formatCHF(couponAmount)}</span>
                                    </div>
                                )}
                                {(tipAmount > 0) && (
                                    <div className="flex items-start justify-between gap-3 text-emerald-600 font-medium">
                                        <span>{t('tip')}</span>
                                        <span>{formatCHF(tipAmount)}</span>
                                    </div>
                                )}
                                <div className="pt-2.5 border-t border-[#D5BA98]/35 flex items-start justify-between gap-3 font-bold text-base text-[#1A3A52]">
                                    <span>{t('finalTotal')}</span>
                                    <span>{formatCHF(total)}</span>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Payment Input */}
                        <div className="space-y-5 sm:space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-[#1A3A52] mb-4 uppercase tracking-wider">{t('paymentType')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                                    <Button
                                        variant={paymentType === 'cash' ? 'default' : 'outline'}
                                        className="h-11 flex items-center justify-center gap-2"
                                        onClick={() => setPaymentType('cash')}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        {t('cash')}
                                    </Button>
                                    <Button
                                        variant={paymentType === 'card' ? 'default' : 'outline'}
                                        className="h-11 flex items-center justify-center gap-2"
                                        onClick={() => setPaymentType('card')}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        {t('card')}
                                    </Button>
                                    <Button
                                        variant={paymentType === 'scan' ? 'default' : 'outline'}
                                        className="h-11 flex items-center justify-center gap-2"
                                        onClick={() => setPaymentType('scan')}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        {t('scan')}
                                    </Button>
                                </div>
                            </section>

                            <div className="space-y-4 bg-[#FDFBF9] border border-[#D5BA98]/35 rounded-xl p-4 sm:p-4.5">
                                <ALInput
                                    title={t('tip')}
                                    type="number"
                                    value={tipAmount}
                                    onChange={(e) => setTipAmount(Number(e.target.value))}
                                    textEnd="CHF"
                                    placeholder={t('enterTip')}
                                    numberDecimalScale={2}
                                    step={0.01}
                                    min={0}
                                />

                                <div className="grid grid-cols-1 gap-4">
                                    <ALCombobox
                                        title={t('coupon')}
                                        options={couponOptions.map((p) => ({
                                            label: p.couponCode,
                                            value: p.couponId.toString(),
                                            description: p.couponName,
                                            group: t('coupons'),
                                        }))}
                                        value={selectedCouponIds}
                                        onChange={(vals) => {
                                            setSelectedCouponIds(Array.isArray(vals) ? vals.map(String) : []);
                                        }}
                                        multiple={true}
                                        showSelectAll={true}
                                        placeholder={t('selectCoupon')}
                                        clearable={true}
                                    />
                                    {availablePromotions.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#1A3A52]/60 uppercase tracking-wider">{t('appliedPromotions')}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availablePromotions.map((p, i) => (
                                                    <div key={i} className="flex flex-col gap-1">
                                                        <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-medium w-fit">
                                                            {p.promoName} ({p.promotionType === 'PERCENT' ? `${p.discountValue}%` : formatCHF(p.discountValue)})
                                                        </span>
                                                        {p.appliedRule && (
                                                            <div className="flex flex-col gap-0.5 ml-2 text-[10px] text-[#1A3A52]/60 italic">
                                                                <span>{p.appliedRule[locale] || p.appliedRule['en']}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ALInput
                                    title={t('givenAmount')}
                                    required
                                    type="number"
                                    value={givenAmount}
                                    onChange={(e) => setGivenAmount(Number(e.target.value))}
                                    className="font-bold text-lg"
                                    textEnd="CHF"
                                    numberDecimalScale={2}
                                    step={0.01}
                                    min={0}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                                        {t('balance')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="min-h-10 border border-[#D5BA98]/55 bg-[#FDFBF9] rounded-md flex items-center px-3 py-2 font-bold text-lg text-[#1A3A52] break-all">
                                        {formatCHF(balance)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#1A3A52]/60 uppercase tracking-wider">{t('note')}</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full h-24 p-3 text-sm border border-[#D5BA98]/55 rounded-md text-[#1A3A52] bg-[#FDFBF9] focus:ring-2 focus:ring-[#1A3A52]/20 focus:border-[#1A3A52]/30 resize-none"
                                    placeholder={t('notePlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
