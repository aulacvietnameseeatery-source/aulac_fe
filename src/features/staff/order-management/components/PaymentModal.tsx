'use client';

import React, { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import {
    X,
    Banknote,
    CreditCard,
    QrCode,
    Plus,
} from 'lucide-react';
import {
    Dialog,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ALInput } from '@/components/ui/al-input';
import { ALCombobox } from '@/components/ui/al-combobox';
import { OrderHistory } from '../types/order-history.types';
import { staffPromotionService } from '../../promotion-management/promotion-list/services/promotion-service';
import { PromotionListDTO } from '../../promotion-management/promotion-list/types/promotion-types';

interface PaymentModalProps {
    order: OrderHistory;
    isOpen: boolean;
    onClose: () => void;
    onPaymentComplete: (orderId: number, paymentData: any) => void;
    isLoading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    order,
    isOpen,
    onClose,
    onPaymentComplete,
    isLoading = false,
}) => {
    const t = useTranslations('Order.PaymentModal');
    const tCommon = useTranslations('Order.List.card');
    const format = useFormatter();

    const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'scan'>('cash');
    const [tipAmount, setTipAmount] = useState<number>(0);
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
    const [promotions, setPromotions] = useState<PromotionListDTO[]>([]);
    const [note, setNote] = useState('');

    // Fetch promotions
    React.useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await staffPromotionService.getPromotions({
                    pageIndex: 1,
                    pageSize: 100,
                    promotionStatus: 'ACTIVE'
                });
                setPromotions(res.pageData);
            } catch (err) {
                console.error('Failed to fetch promotions', err);
            }
        };
        fetchPromotions();
    }, []);

    const subTotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subTotal * 0.1; // Example 10%
    const serviceCharge = 15; // Example fixed

    const selectedCoupon = promotions.find(p => p.promotionId === selectedCouponId);
    const couponDiscount = selectedCoupon
        ? (selectedCoupon.type === 'PERCENT' ? (subTotal * (selectedCoupon.discountValue / 100)) : selectedCoupon.discountValue)
        : 0;

    const totalDiscount = discountValue + couponDiscount;
    const total = Math.max(0, subTotal + tax + serviceCharge + tipAmount - totalDiscount);

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
            note: note || undefined,
            tipAmount: tipAmount || undefined,
            discountAmount: totalDiscount || undefined
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={t('title')}
            width="min(900px, 95vw)"
            footer={
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="h-12 px-8 font-bold text-gray-700 uppercase w-full sm:w-auto">
                        {t('close')}
                    </Button>
                    <Button
                        onClick={handlePay}
                        disabled={isLoading}
                        className="h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 uppercase w-full sm:w-auto flex items-center gap-2"
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {isLoading ? t('paying') : t('payAndComplete')}
                    </Button>
                </div>
            }
        >
            <div onClick={(e) => e.stopPropagation()}>
                <div className="space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    {/* Final Total Banner */}
                    <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center border border-gray-100">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                            {t('finalTotal')}: {format.number(total, { style: 'currency', currency: 'CHF' })}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Order Details */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('orderInfo')}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('orderNo')}</span>
                                        <span className="font-bold">#{order.orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('noOfItems')}</span>
                                        <span className="font-bold">{order.itemCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('orderType')}</span>
                                        <span className="font-bold">
                                            {tCommon(`source.${order.source}`)}
                                            {order.tableCode ? ` (${tCommon('table')} ${order.tableCode})` : ''}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('orderedMenus')}</h3>
                                <div className="max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{item.dishName} ×{item.quantity}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 border-b border-dotted border-gray-300 mx-4 min-w-[50px]"></div>
                                                <span className="font-mono text-gray-600">{format.number(item.price * item.quantity, { style: 'currency', currency: 'CHF' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('subTotal')}</span>
                                    <span>{format.number(subTotal, { style: 'currency', currency: 'CHF' })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('tax')} (10%)</span>
                                    <span>{format.number(tax, { style: 'currency', currency: 'CHF' })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>{t('serviceCharge')}</span>
                                    <span>{format.number(serviceCharge, { style: 'currency', currency: 'CHF' })}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-red-600 font-medium">
                                        <span>{t('discount')}</span>
                                        <span>-{format.number(totalDiscount, { style: 'currency', currency: 'CHF' })}</span>
                                    </div>
                                )}
                                {(tipAmount > 0) && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>{t('tip')}</span>
                                        <span>{format.number(tipAmount, { style: 'currency', currency: 'CHF' })}</span>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Right Column: Payment Input */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('paymentType')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        variant={paymentType === 'cash' ? 'default' : 'outline'}
                                        className={`h-12 flex items-center justify-center gap-2 ${paymentType === 'cash' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                        onClick={() => setPaymentType('cash')}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        {t('cash')}
                                    </Button>
                                    <Button
                                        variant={paymentType === 'card' ? 'default' : 'outline'}
                                        className={`h-12 flex items-center justify-center gap-2 ${paymentType === 'card' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                        onClick={() => setPaymentType('card')}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        {t('card')}
                                    </Button>
                                    <Button
                                        variant={paymentType === 'scan' ? 'default' : 'outline'}
                                        className={`h-12 flex items-center justify-center gap-2 ${paymentType === 'scan' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                        onClick={() => setPaymentType('scan')}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        {t('scan')}
                                    </Button>
                                </div>
                            </section>

                            <div className="space-y-4">
                                <ALInput
                                    title={t('tip')}
                                    type="number"
                                    value={tipAmount}
                                    onChange={(e) => setTipAmount(Number(e.target.value))}
                                    textEnd="CHF"
                                    placeholder={t('enterTip')}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ALCombobox
                                        title={t('discount')}
                                        options={[
                                            ...promotions.map(p => ({
                                                label: `${p.promoName} (${p.discountValue}${p.type === 'PERCENT' ? '%' : ' CHF'})`,
                                                value: p.discountValue,
                                                description: p.promoCode,
                                                group: t('promotions')
                                            })),
                                        ]}
                                        value={discountValue}
                                        onChange={(val) => setDiscountValue(Number(val))}
                                        placeholder={t('selectDiscount')}
                                        allowCreate
                                        onCreateOption={(val) => setDiscountValue(Number(val))}
                                    />

                                    <ALCombobox
                                        title={t('coupon')}
                                        options={promotions.map(p => ({
                                            label: p.promoCode,
                                            value: p.promotionId,
                                            description: p.promoName,
                                        }))}
                                        value={selectedCouponId ?? ''}
                                        onChange={(val) => setSelectedCouponId(Number(val) || null)}
                                        placeholder={t('selectCoupon')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ALInput
                                    title={t('givenAmount')}
                                    required
                                    type="number"
                                    value={givenAmount}
                                    onChange={(e) => setGivenAmount(Number(e.target.value))}
                                    className="font-bold text-lg"
                                    textEnd="CHF"
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {t('balance')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="h-10 border border-blue-200 bg-blue-50/30 rounded-md flex items-center px-3 font-bold text-lg text-blue-700">
                                        {format.number(balance, { style: 'currency', currency: 'CHF' })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('note')}</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full h-24 p-3 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
