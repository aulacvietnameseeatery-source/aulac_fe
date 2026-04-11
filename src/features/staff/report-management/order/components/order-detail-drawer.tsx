"use client";

import React, { useEffect, useState } from "react";
import { X, ReceiptText, User, Armchair, Printer, Download, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sửa lại đường dẫn import api của bạn nếu cần
import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";

interface OrderDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

export function OrderDetailDrawer({ isOpen, onClose, orderId }: OrderDetailDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState<any>(null);

    useEffect(() => {
        if (isOpen && orderId) {
            const fetchOrderDetail = async () => {
                setIsLoading(true);
                try {
                    // GỌI API THẬT
                    const response = await api.get<ApiResponse<any>>(`/api/orders/${orderId}`);
                    setOrderDetail(response.data);
                } catch (error) {
                    console.error("Failed to fetch order detail", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrderDetail();
        } else {
            setOrderDetail(null);
        }
    }, [isOpen, orderId]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(val);

    const calculateTotalDiscount = () => {
        if (!orderDetail) return 0;
        let total = 0;
        if (orderDetail.promotions) {
            total += orderDetail.promotions.reduce((sum: number, p: any) => sum + p.discountAmount, 0);
        }
        if (orderDetail.coupons) {
            total += orderDetail.coupons.reduce((sum: number, c: any) => sum + c.discountAmount, 0);
        }
        return total;
    };

    return (
        <>
            <div className={`fixed inset-0 bg-[#1A3A52]/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={onClose} />

            <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#FDFBF9] shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                <div className="flex items-center justify-between px-6 py-5 border-b border-[#D5BA98]/30 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <ReceiptText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-[#1A3A52]">Order #{orderId}</h2>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">
                                {orderDetail?.orderStatus || "Loading..."}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {isLoading || !orderDetail ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <User size={16} className="text-[#C5A059] mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                                    <p className="text-sm font-bold text-[#1A3A52] leading-tight">{orderDetail.customerName || "Guest"}</p>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                <Armchair size={16} className="text-[#C5A059] mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Table</p>
                                    <p className="text-sm font-bold text-[#1A3A52] leading-tight">{orderDetail.tableCode || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* TỜ BIÊN LAI */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                            <div className="h-3 w-full bg-[radial-gradient(circle,transparent_4px,#ffffff_4px)] bg-[length:12px_12px] -top-1 absolute border-b border-dashed border-slate-200"></div>

                            <div className="p-6 pt-8">
                                <div className="text-center mb-6 border-b border-dashed border-slate-200 pb-6">
                                    <h3 className="font-bold text-[#1A3A52]">An Lạc Restaurant</h3>
                                    <p className="text-xs text-slate-400 mt-1">{orderDetail.createdAt ? orderDetail.createdAt.replace('T', ' ') : ''}</p>
                                    <p className="text-xs text-slate-400">Server: {orderDetail.staffName || "System"}</p>
                                </div>

                                {/* Danh sách món ăn */}
                                <div className="space-y-4 mb-6">
                                    {orderDetail.orderItems?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div className="flex-1 pr-4">
                                                <p className="font-semibold text-[#1A3A52] leading-snug">
                                                    {item.dishNameI18n?.en || item.dishNameI18n?.vi || "Unknown Item"}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.quantity} x {formatCurrency(item.price)}</p>
                                            </div>
                                            <p className="font-bold text-[#1A3A52] whitespace-nowrap">
                                                {formatCurrency(item.quantity * item.price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tính toán tổng kết */}
                                <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(orderDetail.subTotalAmount)}</span>
                                    </div>

                                    {orderDetail.taxAmount > 0 && (
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>Tax</span>
                                            <span>{formatCurrency(orderDetail.taxAmount)}</span>
                                        </div>
                                    )}

                                    {calculateTotalDiscount() > 0 && (
                                        <div className="flex justify-between text-sm text-rose-500 font-medium">
                                            <span>Discount</span>
                                            <span>-{formatCurrency(calculateTotalDiscount())}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                                        <span className="font-extrabold text-[#1A3A52] uppercase tracking-wide">Grand Total</span>
                                        <span className="text-xl font-extrabold text-[#C5A059]">
                                            {formatCurrency(orderDetail.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán  */}
                        {orderDetail.payments && orderDetail.payments.length > 0 && (
                            <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0">
                                        {orderDetail.payments[0].method === "CASH" ? <Banknote size={14} className="text-slate-600" /> : <CreditCard size={14} className="text-slate-600" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</p>
                                        <p className="text-sm font-semibold text-slate-700">{orderDetail.payments[0].method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded border border-emerald-100">
                                        {orderDetail.isPaid ? "PAID" : "UNPAID"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 border-t border-[#D5BA98]/30 bg-white grid grid-cols-2 gap-3 shrink-0">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                    <Button className="w-full bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90">
                        <Download size={16} className="mr-2" /> PDF
                    </Button>
                </div>
            </div>
        </>
    );
}