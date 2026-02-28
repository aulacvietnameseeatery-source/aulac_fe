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
import { Input } from '@/components/ui/input';
import { OrderHistory } from '../types/order-history.types';

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
    const [givenAmount, setGivenAmount] = useState<number>(order.totalAmount);
    const [note, setNote] = useState('');

    const subTotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subTotal * 0.1; // Example 10%
    const serviceCharge = 15; // Example fixed
    const total = order.totalAmount;
    const balance = Math.max(0, givenAmount - total);

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
            tipAmount: order.tipAmount || undefined
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
                            {order.tipAmount != null && order.tipAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>{t('tip')}</span>
                                    <span>{format.number(order.tipAmount, { style: 'currency', currency: 'CHF' })}</span>
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
                            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                                <span className="text-sm text-gray-700 font-medium">{t('discount')}</span>
                                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-bold uppercase">
                                    <Plus className="w-3 h-3" />
                                    {t('add')}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                                <span className="text-sm text-gray-700 font-medium">{t('tips')}</span>
                                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-bold uppercase">
                                    <Plus className="w-3 h-3" />
                                    {t('add')}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                                <span className="text-sm text-gray-700 font-medium">{t('coupon')}</span>
                                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-bold uppercase">
                                    <Plus className="w-3 h-3" />
                                    {t('add')}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {t('givenAmount')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={givenAmount}
                                    onChange={(e) => setGivenAmount(Number(e.target.value))}
                                    className="h-12 font-bold text-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {t('balance')} <span className="text-red-500">*</span>
                                </label>
                                <div className="h-12 border border-blue-200 bg-blue-50/30 rounded-md flex items-center px-3 font-bold text-lg text-blue-700">
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
        </Dialog>
    );
};
