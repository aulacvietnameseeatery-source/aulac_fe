"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCcw, Download, Printer } from 'lucide-react';
import { getSaleInvoiceDetail } from '@/features/staff/invoices/api/invoice-api';
import { SaleInvoiceDto } from '@/features/staff/invoices/types/invoice.types';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { toast } from 'sonner';
// We can use html2pdf.js dynamically or just window.print
// For Export PDF, we can use the browser's Native Print to PDF but if needed we add a library.
// For now we'll rely on window.print() for both, but we can instruct users to "Save as PDF".

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const t = useTranslations("orders.management.InvoiceDetail");
    const router = useRouter();
    const [invoice, setInvoice] = useState<SaleInvoiceDto | null>(null);
    const [loading, setLoading] = useState(true);

    // Use store settings for restaurant info
    const { data: settings } = useStoreSettings();

    const printRef = useRef<HTMLDivElement>(null);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const data = await getSaleInvoiceDetail(Number(params.id));
            setInvoice(data);
        } catch (error: any) {
            toast.error(error.message || t('errorLoad'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;
    }

    if (!invoice) {
        return <div className="p-8 text-center text-red-500">{t('notFound')}</div>;
    }

    const storeName = settings?.name || 'Restaurant Name';
    const storeAddress = settings?.streetAddress || 'Restaurant Address';
    const storePhone = settings?.phone || 'Phone';

    return (
        <div className="w-full">
            {/* Page Header (Hidden on Print) */}
            <div className="d-flex align-items-sm-center flex-sm-row flex-col gap-3 mb-4 print:hidden flex justify-between">
                <div className="flex-grow-1 flex items-center gap-2">
                    <h3 className="mb-0 text-2xl font-semibold text-gray-800">{t('title')}</h3>
                    <button onClick={fetchInvoice} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                        <RefreshCcw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
                <div className="flex gap-2 relative group">
                    {/* Dropdown for export */}
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> {t('exportPrint')}
                    </button>
                </div>
            </div>

            {/* Back Button (Hidden on Print) */}
            <button
                onClick={() => router.push('/dashboard/invoices' as any)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 print:hidden transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> {t('back')}
            </button>

            {/* Printable Area */}
            <div
                ref={printRef}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0"
            >
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <h6 className="text-xl font-bold text-gray-900 mb-1">{invoice.invoiceCode}</h6>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                                {t('status.paid')}
                            </span>
                        </div>
                        <div className="mt-4 md:mt-0 text-left md:text-right">
                            <h2 className="text-2xl font-extrabold text-[#1A3A51] tracking-tight">{storeName}</h2>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('from')}</h6>
                            <p className="text-gray-900 font-bold mb-1">{storeName}</p>
                            <p className="text-gray-600 text-sm mb-1">{storeAddress}</p>
                            <p className="text-gray-600 text-sm mb-0">{t('phone')}: {storePhone}</p>
                        </div>
                        <div>
                            <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('to')}</h6>
                            <p className="text-gray-900 font-bold mb-1">{invoice.customerName || t('walkInCustomer')}</p>
                            {invoice.customerPhone && <p className="text-gray-600 text-sm mb-0">{t('phone')}: {invoice.customerPhone}</p>}
                        </div>
                        <div className="lg:text-right space-y-2">
                            <div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2">{t('date')}:</span>
                                <span className="text-sm text-gray-900 font-medium">{new Date(invoice.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2">{t('type')}:</span>
                                <span className="text-sm text-gray-900 font-medium">{invoice.orderType}</span>
                            </div>
                            {invoice.tableCode && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2">{t('table')}:</span>
                                    <span className="text-sm text-gray-900 font-medium">{invoice.tableCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6 overflow-x-auto">
                        <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('items')}</h6>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide border-y border-gray-200">
                                    <th className="py-3 px-4 font-semibold w-16 text-center">{t('no')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('itemDetails')}</th>
                                    <th className="py-3 px-4 font-semibold w-24 text-center">{t('qty')}</th>
                                    <th className="py-3 px-4 font-semibold w-32 text-right">{t('rate')}</th>
                                    <th className="py-3 px-4 font-semibold w-32 text-right">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800 text-sm">
                                {invoice.items.map((item, index) => (
                                    <tr key={item.orderItemId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center font-medium text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-900">{item.itemName}</p>
                                            {item.note && <p className="text-xs text-gray-500 mt-0.5 italic">{item.note}</p>}
                                        </td>
                                        <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                                        <td className="py-3 px-4 text-right">${item.itemPrice.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right font-semibold">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6 mb-6">
                        <div className="w-full md:w-1/2">
                            <h6 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('terms')}</h6>
                            <div className="text-xs text-gray-600 space-y-1 mb-4">
                                <p>{t('term1')}</p>
                                <p>{t('term2')}</p>
                            </div>
                            <div className="bg-blue-50/50 text-blue-800 px-4 py-3 rounded-lg text-xs font-medium border border-blue-100">
                                {t('paymentVerified', { staffName: invoice.staffName || t('defaultStaff') })}
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                            <div className="space-y-3 pb-4 border-b border-gray-100 text-sm">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span className="font-medium">{t('subtotal')}</span>
                                    <span>${invoice.subTotal.toFixed(2)}</span>
                                </div>
                                {invoice.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                        <span className="font-medium">{t('discount')}</span>
                                        <span className="font-semibold">- ${invoice.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <h6 className="text-lg font-bold text-gray-900">{t('total')}</h6>
                                <h6 className="text-2xl font-black text-[#1A3A51]">${invoice.totalAmount.toFixed(2)}</h6>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Hidden on Print) */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8 print:hidden">
                        <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <Download className="w-5 h-5" /> {t('downloadPdf')}
                        </button>
                        <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1A3A51] text-white font-semibold rounded-xl hover:bg-[#122838] transition-all shadow-md hover:shadow-lg">
                            <Printer className="w-5 h-5" /> {t('printInvoice')}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          /* Hide layout components */
          body > *:not(#__next), #__next > *:not(div) { 
            display: none !important; 
          }
          
          /* Hide the main scrollbar */
          ::-webkit-scrollbar { display: none; }
          
          /* Reset page margins and paddings for a clean print */
          @page { margin: 0; size: auto; }
          body { background: white !important; }
          
          /* Force white background and colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
        </div>
    );
}
