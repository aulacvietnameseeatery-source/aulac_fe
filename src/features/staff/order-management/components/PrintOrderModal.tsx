import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useFormatter } from 'next-intl';
import { X, Printer } from 'lucide-react';
import { OrderHistory } from '../types/order-history.types';
import {
    ReceiptHeader,
    ReceiptInfoStrip,
    ReceiptItemList,
    ReceiptSummary,
    ReceiptPaymentFooter,
} from '@/features/customer/order-receipt';
import { OrderReceipt, ReceiptItem } from '@/features/customer/order-receipt/types/receipt.types';

interface PrintOrderModalProps {
    order: OrderHistory;
    isOpen: boolean;
    onClose: () => void;
    type: 'invoice' | 'receipt';
}

export const PrintOrderModal: React.FC<PrintOrderModalProps> = ({ order, isOpen, onClose, type }) => {
    const t = useTranslations('Order.List.card');
    const rt = useTranslations('OrderReceipt');
    const format = useFormatter();
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

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
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // Map OrderHistory to OrderReceipt
    const mappedOrder: OrderReceipt = {
        id: `#${order.orderId}`,
        date: order.createdAt ? format.dateTime(new Date(order.createdAt), { dateStyle: 'medium' }) : 'N/A',
        time: order.createdAt ? format.dateTime(new Date(order.createdAt), { timeStyle: 'short' }) : 'N/A',
        status: type === 'invoice' ? t('paymentStatus.unpaid') : (order.isPaid ? t('paymentStatus.paid') : t('paymentStatus.unpaid')),
        paymentMethod: (type === 'receipt' && order.isPaid) ? t('paymentStatus.paid') : '',
        tips: type === 'invoice' ? 0 : (order.tipAmount ?? 0),
        items: order.orderItems
            .filter(item => item.itemStatus !== 'REJECTED' && item.itemStatus !== 'CANCELLED')
            .map((item): ReceiptItem => ({
            name: item.dishName,
            qty: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
        })),
    };

    const subtotal = mappedOrder.items.reduce((acc, item) => acc + item.total, 0);
    const totalAmount = subtotal + mappedOrder.tips;

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Copy styles
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(s => s.outerHTML)
            .join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>${type === 'invoice' ? t('action.print') : t('action.printReceipt')} #${order.orderId}</title>
                    ${styles}
                    <style>
                        body { background: white !important; margin: 0; padding: 20px; }
                        #print-area { width: 100% !important; max-width: none !important; border: none !important; box-shadow: none !important; }
                    </style>
                </head>
                <body>
                    <div id="print-area">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
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
                {/* Header */}
                <div
                    className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {type === 'invoice' ? t('action.print') : t('action.printReceipt')}
                            </h3>
                            <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => handleClose(e)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview Area */}
                <div
                    className="flex-1 overflow-auto p-8 bg-gray-100/50 flex justify-center custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div
                        ref={printRef}
                        id="receipt-print-area"
                        className="w-full bg-white shadow-xl rounded-sm border border-[#1A3951] overflow-hidden"
                        style={{ height: 'fit-content' }}
                    >
                        <ReceiptHeader />
                        <ReceiptInfoStrip order={mappedOrder} showStatus={type === 'invoice'} />
                        <ReceiptItemList items={mappedOrder.items} />
                        <ReceiptSummary subtotal={subtotal} tips={mappedOrder.tips} total={totalAmount} />
                        {type === 'invoice' && mappedOrder.paymentMethod && (
                            <ReceiptPaymentFooter paymentMethod={mappedOrder.paymentMethod} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => handleClose(e)}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        {rt('BackLink.label')}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        {rt('Actions.print')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
