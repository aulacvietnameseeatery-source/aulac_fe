"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Printer } from 'lucide-react';
import { getSaleInvoiceDetail } from '@/features/staff/invoices/api/invoice-api';
import { SaleInvoiceDto } from '@/features/staff/invoices/types/invoice.types';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InvoiceDetailDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number | null;
}

export function InvoiceDetailDialog({ open, onClose, orderId }: InvoiceDetailDialogProps) {
    const t = useTranslations("orders.management.InvoiceDetail");
    const [invoice, setInvoice] = useState<SaleInvoiceDto | null>(null);
    const [loading, setLoading] = useState(false);

    const { data: settings } = useStoreSettings();
    const printRef = useRef<HTMLDivElement>(null);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-CH', { 
            style: 'currency', 
            currency: 'CHF',
            minimumFractionDigits: 2
        }).format(val);
    };

    const fetchInvoice = async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const data = await getSaleInvoiceDetail(orderId);
            setInvoice(data);
        } catch (error: any) {
            toast.error(error.message || t('errorLoad', { fallback: 'Failed to load invoice' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && orderId) {
            setInvoice(null);
            fetchInvoice();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, orderId]);

    const handlePrint = () => {
        window.print();
    };

    const bodyContent = () => {
        if (loading) {
            return <div className="py-12 text-center text-gray-500">{t('loading', { fallback: 'Loading...' })}</div>;
        }
        if (!invoice) {
            return <div className="py-12 text-center text-red-500">{t('notFound', { fallback: 'Invoice not found' })}</div>;
        }

        const storeName = invoice.restaurantName || settings?.name || 'Restaurant Name';
        const storeAddress = invoice.restaurantAddress || settings?.streetAddress || 'Restaurant Address';
        const storePhone = invoice.restaurantPhone || settings?.phone || 'Phone';

        return (
            <div className="bg-gray-100 flex flex-col items-center py-6 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                <style type="text/css" media="print">
                    {`
                        @page { margin: 0; size: auto; }
                        body * { visibility: hidden; }
                        #receipt-print-area, #receipt-print-area * {
                            visibility: visible;
                        }
                        #receipt-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100mm;
                            margin: 0;
                            padding: 10mm;
                        }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    `}
                </style>
                
                {/* PHẦN SẼ ĐƯỢC IN RA */}
                <div 
                    id="receipt-print-area" 
                    ref={printRef} 
                    className="w-full max-w-[100mm] bg-white text-black p-4 text-sm font-sans shadow-xl border border-gray-300 mb-6"
                    style={{ color: '#000', height: 'fit-content' }}
                >
                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <img 
                            src={settings?.logoUrl || '/images/logo.png'} 
                            alt="Logo" 
                            className="w-16 h-16 mx-auto mb-2 object-contain grayscale"
                        />
                        <h1 className="font-bold text-lg uppercase tracking-wider">{storeName}</h1>
                        <p className="text-xs">{storeAddress}</p>
                        <p className="text-xs">Tel: {storePhone}</p>
                    </div>

                    <div className="border-t border-black border-dashed my-3"></div>

                    {/* ORDER INFO */}
                    <div className="mb-4 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-sm mb-2">
                            <span>{t('title', { fallback: 'INVOICE' })}</span>
                            <span>{invoice.invoiceCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('date', { fallback: 'Date' })}: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                            <span>{new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('type', { fallback: 'Type' })}: {invoice.orderType}</span>
                            {invoice.tableCode && (
                                <span className="font-bold">{t('table', { fallback: 'Table' })}: {invoice.tableCode}</span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span>{t('customer', { fallback: 'Guest' })}:</span>
                            <span>{invoice.customerName || t('walkInCustomer', { fallback: 'Guest' })}</span>
                        </div>
                        {/* <div className="flex justify-between">
                            <span>{t('staff', { fallback: 'Staff' })}:</span>
                            <span>{invoice.staffName}</span>
                        </div> */}
                    </div>

                    <div className="border-t border-black my-2"></div>

                    {/* ITEM LIST */}
                    <div className="mb-4">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-black text-left">
                                    <th className="py-1 w-8">{t('qty', { fallback: 'Qty' })}</th>
                                    <th className="py-1">{t('itemDetails', { fallback: 'Item' })}</th>
                                    <th className="py-1 text-right">{t('amount', { fallback: 'Total' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.orderItemId} className="align-top">
                                        <td className="py-1 font-semibold">{item.quantity}x</td>
                                        <td className="py-1">
                                            {item.itemName}
                                            <div className="text-[10px] text-gray-600">@ {formatCurrency(item.itemPrice)}</div>
                                            {item.note && (
                                                <div className="text-[10px] italic text-gray-500">- {item.note}</div>
                                            )}
                                        </td>
                                        <td className="py-1 text-right">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-black my-2"></div>

                    {/* FINANCIAL SUMMARY */}
                    <div className="text-xs space-y-1 mb-4">
                        <div className="flex justify-between font-semibold">
                            <span>{t('subtotal', { fallback: 'Subtotal' })}</span>
                            <span>{formatCurrency(invoice.subTotal)}</span>
                        </div>

                        {invoice.discountAmount > 0 && (
                            <div className="flex justify-between text-black">
                                <span>{t('discount', { fallback: 'Discount' })}</span>
                                <span>-{formatCurrency(invoice.discountAmount)}</span>
                            </div>
                        )}

                        {invoice.tipAmount > 0 && (
                            <div className="flex justify-between">
                                <span>{t('tip', { fallback: 'Tip' })}</span>
                                <span>+{formatCurrency(invoice.tipAmount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t-2 border-black my-2"></div>

                    {/* TOTAL */}
                    <div className="flex justify-between font-bold text-lg mb-4">
                        <span>{t('totalAmount', { fallback: 'TOTAL' })}</span>
                        <span>{formatCurrency(invoice.totalAmount)}</span>
                    </div>

                    {/* PAYMENT METHOD */}
                    {invoice.paymentMethod && invoice.paymentMethod !== '-' && (
                        <>
                            <div className="border-t border-black border-dashed my-2"></div>
                            <div className="text-xs space-y-1 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span>{t('paymentMethod', { fallback: 'Paid via' })}</span>
                                    <span className="uppercase">{invoice.paymentMethod}</span>
                                </div>
                                {/* <div className="flex justify-between text-black">
                                    <span>{t('status.title', { fallback: 'Status' })}</span>
                                    <span>{invoice.isPaid ? t('status.paid', { fallback: 'PAID' }) : t('status.unpaid', { fallback: 'UNPAID' })}</span>
                                </div> */}
                            </div>
                        </>
                    )}

                    {/* FOOTER RECEIPT */}
                    <div className="text-center mt-8 text-[10px] space-y-1">
                        <p>Please retain for your records</p>
                    </div>
                </div>

                {/* PHẦN HIỂN THỊ TRÊN GIAO DIỆN KHÔNG IN RA GIẤY */}
                <div className="w-full max-w-[100mm] bg-white rounded-xl p-4 border border-gray-200 shadow-sm print:hidden">
                    <div className="flex flex-col text-center">
                        <p className="text-sm font-bold text-gray-900">
                            {t('paymentVerified', { staffName: invoice.staffName || t('defaultStaff', { fallback: 'System' }) })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('thankYouBusiness', { fallback: 'Thank you for your business!' })}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            width="600px"
            bodyOverflowY="auto"
            title={
                <div className="flex items-center gap-2">
                    <span>{t('title', { fallback: 'Invoice Detail' })}</span>
                    {invoice && !loading && (
                        <button
                            onClick={fetchInvoice}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCcw className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    )}
                </div>
            }
            footer={
                invoice && !loading ? (
                    <div className="flex justify-end gap-2 w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            {t('close', { fallback: 'Close' })}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Printer className="w-4 h-4" />
                            {t('printInvoice', { fallback: 'Print' })}
                        </Button>
                    </div>
                ) : undefined
            }
        >
            {bodyContent()}
        </Dialog>
    );
}