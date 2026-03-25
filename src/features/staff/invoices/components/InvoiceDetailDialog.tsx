"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Download, Printer } from 'lucide-react';
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

    const fetchInvoice = async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const data = await getSaleInvoiceDetail(orderId);
            setInvoice(data);
        } catch (error: any) {
            toast.error(error.message || t('errorLoad'));
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

    const storeName = settings?.name || 'Restaurant Name';
    const storeAddress = settings?.streetAddress || 'Restaurant Address';
    const storePhone = settings?.phone || 'Phone';

    const bodyContent = () => {
        if (loading) {
            return <div className="py-12 text-center text-gray-500">{t('loading')}</div>;
        }
        if (!invoice) {
            return <div className="py-12 text-center text-red-500">{t('notFound')}</div>;
        }

        return (
            <div ref={printRef} className="bg-white w-full">
                <style type="text/css" media="print">
                    {`
                        @page { margin: 10mm; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    `}
                </style>
                <div className="w-full bg-white">
                    {/* Brand Header */}
                    <div className="bg-[#1A3A52] px-6 py-6 text-white flex flex-col sm:flex-row justify-between items-center sm:items-start relative overflow-hidden">
                        {/* subtle pattern */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                        <div className="relative z-10 text-center sm:text-left mb-6 sm:mb-0">
                            <h2 className="text-3xl font-black tracking-tight mb-2">{storeName}</h2>
                            <p className="text-white/70 text-sm max-w-[250px] leading-relaxed">{storeAddress}</p>
                            <p className="text-white/70 text-sm mt-1.5"><span className="opacity-60">{t('phone')}:</span> {storePhone}</p>
                        </div>

                        <div className="relative z-10 text-center sm:text-right">
                            <h6 className="text-3xl font-black mb-3 opacity-95">{invoice.invoiceCode}</h6>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 text-emerald-50 text-xs font-bold rounded-lg uppercase tracking-widest border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10-10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                                {t('status.paid')}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        {/* Info Section */}
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('to')}</h6>
                                    <p className="text-gray-900 text-lg font-bold">{invoice.customerName || t('walkInCustomer')}</p>
                                    {invoice.customerPhone && <p className="text-gray-500 text-sm mt-0.5"><span className="opacity-70">{t('phone')}:</span> {invoice.customerPhone}</p>}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-12 gap-y-5 md:justify-end">
                                <div className="md:text-right">
                                    <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('date')}</h6>
                                    <p className="text-gray-900 text-sm font-semibold">{new Date(invoice.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="md:text-right">
                                    <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('type')}</h6>
                                    <p className="text-gray-900 text-sm font-semibold">{invoice.orderType}</p>
                                </div>
                                {invoice.tableCode && (
                                    <div className="md:text-right">
                                        <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('table')}</h6>
                                        <p className="text-[#1A3A52] text-sm font-black">{invoice.tableCode}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Items Table - Clean minimalist look */}
                        <div className="mb-10 lg:mb-12">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest w-12 text-center">{t('no')}</th>
                                            <th className="py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t('itemDetails')}</th>
                                            <th className="py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest w-24 text-center">{t('qty')}</th>
                                            <th className="py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest w-32 text-right">{t('rate')}</th>
                                            <th className="py-4 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-widest w-36 text-right">{t('amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {invoice.items.map((item, index) => (
                                            <tr key={item.orderItemId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-5 px-2 text-center font-semibold text-gray-400 text-xs">{index + 1}</td>
                                                <td className="py-5 px-2">
                                                    <p className="font-bold text-gray-900 group-hover:text-[#1A3A52] transition-colors text-base">{item.itemName}</p>
                                                    {item.note && (
                                                        <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5">
                                                            <span className="text-gray-300">↳</span>
                                                            <span className="italic">{item.note}</span>
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-5 px-2">
                                                    <div className="mx-auto w-fit bg-gray-50 px-3 py-1 rounded-md text-gray-700 font-bold border border-gray-100">
                                                        {item.quantity}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-2 text-right font-medium text-gray-500">${item.itemPrice.toFixed(2)}</td>
                                                <td className="py-5 px-2 text-right font-black text-gray-900 text-base">${item.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-t-2 border-dashed border-gray-200 pt-6">

                            {/* Payment Verified & Method info */}
                            <div className="w-full lg:w-1/2 order-2 lg:order-1">
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                                    {/* decorative circle */}
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50 pointer-events-none"></div>

                                    <div className="flex items-start gap-3.5 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700"><path d="M22 11.08V12a10 10-10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{t('paymentVerified', { staffName: invoice.staffName || t('defaultStaff') })}</p>
                                            <p className="text-xs text-gray-500 mt-1">{t('thankYouBusiness')}</p>
                                        </div>
                                    </div>
                                    {invoice.paymentMethod && invoice.paymentMethod !== '-' && (
                                        <div className="pt-4 mt-1 border-t border-gray-100 flex justify-between items-center relative z-10">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t('paymentMethod')}</span>
                                            <span className="text-sm font-black text-[#1A3A52] bg-white px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">{invoice.paymentMethod}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="w-full lg:w-2/5 order-1 lg:order-2">
                                <div className="space-y-3.5 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span className="font-semibold text-xs uppercase tracking-wider">{t('subtotal')}</span>
                                        <span className="font-bold text-gray-900">${invoice.subTotal.toFixed(2)}</span>
                                    </div>
                                    {invoice.discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-red-500">
                                            <span className="font-semibold text-xs uppercase tracking-wider">{t('discount')}</span>
                                            <span className="font-bold">- ${invoice.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {invoice.tipAmount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-600">
                                            <span className="font-semibold text-xs uppercase tracking-wider">{t('tip')}</span>
                                            <span className="font-bold">+ ${invoice.tipAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-end pt-6 bg-[#1A3A52]/5 p-6 rounded-2xl border border-[#1A3A52]/10 shadow-inner">
                                    <div className="flex flex-col">
                                        <span className="text-[#1A3A52]/60 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t('total')}</span>
                                        <span className="text-sm font-bold text-[#1A3A52]/40">{t('currency')}</span>
                                    </div>
                                    <h6 className="text-[48px] leading-none font-black text-[#1A3A52] tracking-tight drop-shadow-sm">${invoice.totalAmount.toFixed(2)}</h6>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Bottom accent line */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#1A3A52] via-[#D5BA98] to-[#1A3A52]"></div>
                </div>
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            width="860px"
            bodyOverflowY="auto"
            title={
                <div className="flex items-center gap-2">
                    <span>{t('title')}</span>
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
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5"
                        >
                            <Download className="w-4 h-4" />
                            {t('downloadPdf')}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" />
                            {t('printInvoice')}
                        </Button>
                    </div>
                ) : undefined
            }
        >
            {bodyContent()}
        </Dialog>
    );
}
