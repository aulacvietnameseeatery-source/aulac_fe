import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { dateUtils } from '@/lib/date-utils';
import { X, Printer } from 'lucide-react';
import { OrderHistory } from '../types/order-history.types';
import { PrintOrderData, PrintStoreSettings, PrintDiscount, PrintPaymentInfo } from '@/features/customer/order-receipt/types/receipt.types'; 
import { OrderPrintDocument } from '@/features/customer/order-receipt';
import { OrderDetailDto } from '../../order-create/types/edit-order.types';
import { useStoreSettings } from '@/hooks/use-store-settings';

interface PrintOrderModalProps {
    order: OrderDetailDto;
    isOpen: boolean;
    onClose: () => void;
    type: 'invoice' | 'receipt';
}

export const PrintOrderModal: React.FC<PrintOrderModalProps> = ({ order, isOpen, onClose, type }) => {
    const t = useTranslations('orders.management.List.card');
    const rt = useTranslations('orders.receipt');
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const { data: storeData } = useStoreSettings();

    const handleClose = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        document.body.style.overflow = 'unset';
        onClose();
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // --- MAPPING DATA ---
    const storeSettings: PrintStoreSettings = {
        name: storeData?.name || "An Lac",
        streetAddress: storeData?.streetAddress || "Bahnhofstrasse 1",
        // Gộp postal code và city
        city: [storeData?.postalCode, storeData?.city].filter(Boolean).join(" ") || "8001 Zürich",
        phone: storeData?.phone || "+41 44 123 45 67",
        email: storeData?.email || "info@anlac.ch",
        vatNumber: "", // VAT number hiện chưa có trong hook, tạm hardcode
        logoUrl: storeData?.logoUrl || "/images/logo.png"
    };

    const printTranslations = {
        invoice: t('action.print', { fallback: "INVOICE" }),
        receipt: t('action.printReceipt', { fallback: "RECEIPT" }),
        date: "Date",
        orderType: "Type",
        dineIn: "Dine In",
        takeAway: "Take Away",
        table: "Table",
        customer: "Guest",
        guest: "Guest",
        qty: "Qty",
        item: "Item",
        total: "Total",
        subtotalExclTax: "Net Total (Excl. VAT)",
        subtotal: "Subtotal",
        discount: "Discount",
        tax: "Tax",
        tip: "Tip",
        totalAmount: "TOTAL",
        paidVia: "Paid via",
        given: "Given",
        change: "Change",
        thankYou: "Vielen Dank für Ihren Besuch!"
    };

    // Phân loại Discount
    const discounts: PrintDiscount[] = [];
    if (order.promotions && order.promotions.length > 0) {
        order.promotions.forEach((p: any) => discounts.push({ 
            type: 'Promotion', 
            name: p.promotionName, 
            amount: p.discountAmount 
        }));
    }
    if (order.coupons && order.coupons.length > 0) {
        order.coupons.forEach((c: any) => discounts.push({ 
            type: 'Coupon', 
            name: c.couponCode, 
            amount: c.discountAmount 
        }));
    }

    const paymentInfo: PrintPaymentInfo | undefined = (order.payments && order.payments.length > 0)
        ? {
            method: order.payments[0].method,
            received: order.payments[0].receivedAmount,
            change: order.payments[0].changeAmount
        }
        : undefined;

    const mappedPrintData: PrintOrderData = {
        id: order.orderId?.toString() || '',
        date: order.createdAt ? dateUtils.formatLocal(order.createdAt, 'dd MMM yyyy') : 'N/A',
        time: order.createdAt ? dateUtils.formatLocal(order.createdAt, 'HH:mm') : 'N/A',
        orderType: order.source || 'Dine-in',
        tableNumber: order.tableCode || null,
        customerName: order.customerName,
        items: (order.orderItems || [])
            .filter((item: any) => item.itemStatus !== 'REJECTED' && item.itemStatus !== 'CANCELLED')
            .map((item: any) => ({
                name: item.dishName,
                qty: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })),
        subtotal: order.subTotalAmount || 0,
        subtotalExclTax: (order.subTotalAmount || 0) - (order.taxAmount || 0),
        discounts: discounts,
        taxAmount: order.taxAmount || 0,
        tipAmount: order.tipAmount || 0,
        totalAmount: order.totalAmount || 0,
        paymentInfo: paymentInfo
    };

    // --- LOGIC IN ---
    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => handleClose(e)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div
                    className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {type === 'invoice' ? t('action.print', { fallback: 'Print Invoice' }) : t('action.printReceipt', { fallback: 'Print Receipt' })}
                            </h3>
                            <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                        </div>
                    </div>
                    <button onClick={(e) => handleClose(e)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div
                    className="flex-1 overflow-auto p-8 bg-gray-100/50 flex justify-center custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div id="receipt-print-area" className="w-full max-w-[100mm] bg-white shadow-xl rounded-sm border border-gray-300 overflow-hidden" style={{ height: 'fit-content' }}>
                        <OrderPrintDocument 
                            ref={printRef} 
                            type={type} 
                            order={mappedPrintData} 
                            settings={storeSettings} 
                            translations={printTranslations} 
                        />
                    </div>
                </div>

                <div
                    className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={(e) => handleClose(e)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                        {rt('BackLink.label', { fallback: 'Cancel' })}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
                        <Printer className="w-4 h-4" />
                        {rt('Actions.print', { fallback: 'Print' })}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};