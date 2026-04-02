"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, Ticket, Tag, Info, CreditCard } from "lucide-react";
import { customerDetailService } from "../services/customer-detail-service";
import { CustomerOrderDetailDto } from "../types/customer-detail-types";
import dayjs from "dayjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";

interface OrderDetailModalProps {
    customerId: number;
    orderId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetailModal = ({ customerId, orderId, isOpen, onClose }: OrderDetailModalProps) => {
    const t = useTranslations("Customer.Detail");
    const [detail, setDetail] = useState<CustomerOrderDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchDetail();
        } else {
            setDetail(null);
        }
    }, [isOpen, orderId]);

    const fetchDetail = async () => {
        setIsLoading(true);
        try {
            const data = await customerDetailService.getOrderDetail(customerId, orderId!);
            setDetail(data);
        } catch (error) {
            toast.error(t('fetchDetailError'));
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
            case "COMPLETED": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80";
            case "CANCELLED": return "bg-rose-100 text-rose-800 hover:bg-rose-100/80";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    const getItemStatusColor = (status: string) => {
        switch (status) {
            case "CREATED": return "border-slate-200 bg-slate-50 text-slate-600";
            case "IN_PROGRESS": return "border-blue-200 bg-blue-50 text-blue-700";
            case "READY": return "border-amber-300 bg-amber-50 text-amber-700 font-bold";
            case "SERVED": return "border-slate-300 bg-white text-slate-800 font-bold shadow-sm";
            case "REJECTED": return "border-red-200 bg-red-50 text-red-700 line-through opacity-70";
            case "CANCELLED": return "border-rose-200 bg-rose-50 text-rose-700 line-through opacity-70";
            default: return "border-slate-200 bg-slate-50 text-slate-600";
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-CH', { 
            style: 'currency', 
            currency: 'CHF',
            minimumFractionDigits: 2
        }).format(val);
    };

    const getUtcDateString = (utcDateString: string) => {
        const dateStringWithZ = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
        return dateStringWithZ;
    };

    const payment = detail?.payments?.[0];

    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            width="850px" 
        >
            {isLoading || !detail ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
                </div>
            ) : (
                <div className="flex flex-col text-slate-800 p-4 md:p-8 h-[85vh] md:max-h-[80vh] overflow-hidden">
                    
                    {/* --- HEADER --- */}
                    <div className="pb-5 border-b border-slate-100 mb-6 flex justify-between items-start shrink-0">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t('orderTitle')} #{detail.orderId}</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                {dateUtils.formatLocal(getUtcDateString(detail.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <h2 className="text-3xl font-bold text-blue-600">{formatCurrency(detail.totalAmount)}</h2>
                            <Badge className={cn("mt-2 px-3 py-1 shadow-sm border-none uppercase tracking-wider text-xs", getStatusColor(detail.status))}>
                                {t(`status.${detail.status}`)}
                            </Badge>
                        </div>
                    </div>

                    {/* --- INFO CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 shrink-0">
                        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-slate-400" />
                                <h3 className="font-bold text-slate-700">{t('generalInfo')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                <div><p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t('table')}</p><p className="font-semibold text-slate-800">{detail.tableCode || "-"}</p></div>
                                <div><p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t('staff')}</p><p className="font-semibold text-slate-800">{detail.staffName || "-"}</p></div>
                                <div><p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t('type')}</p><p className="font-semibold text-slate-800">{t(`orderType.${detail.orderType}`)}</p></div>
                                <div><p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{t('tip')}</p><p className="font-semibold text-slate-800">{detail.tipAmount ? formatCurrency(detail.tipAmount) : "-"}</p></div>
                            </div>
                        </div>

                        <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-blue-900">{t('paymentDetails')}</h3>
                            </div>
                            
                            {!payment ? (
                                <div className="h-[72px] flex items-center justify-center border-2 border-dashed border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-400 font-medium">{t('noPaymentRecorded')}</p>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                    <div>
                                        <p className="font-extrabold text-slate-800 text-lg">{payment.method}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{dayjs(payment.paidAt).format("DD/MM/YYYY HH:mm")}</p>
                                    </div>
                                    <div className="text-right flex flex-col gap-1">
                                        <p className="text-sm text-slate-600">
                                            {t('received')}: <span className="font-bold text-emerald-600 ml-1">{formatCurrency(payment.receivedAmount)}</span>
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {t('change')}: <span className="font-bold text-orange-500 ml-1">{formatCurrency(payment.changeAmount)}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 min-h-0">
                        <Tabs defaultValue="items" className="flex flex-col h-full w-full">
                            
                            {/* Tabs Header */}
                            <TabsList className="grid w-full grid-cols-3 bg-slate-100/80 p-1 rounded-xl shrink-0 h-auto">
                                <TabsTrigger value="items" className="flex gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><Receipt size={16}/> {t('items')}</TabsTrigger>
                                <TabsTrigger value="promotions" className="flex gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><Tag size={16}/> {t('promotions')}</TabsTrigger>
                                <TabsTrigger value="coupons" className="flex gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"><Ticket size={16}/> {t('coupons')}</TabsTrigger>
                            </TabsList>
                            
                            {/* Tab Content */}
                            <div className="flex-1 min-h-0 mt-4 overflow-hidden relative">
                                {/* TAB 1: ITEMS */}
                                <TabsContent value="items" className="h-full m-0 focus-visible:outline-none focus-visible:ring-0">
                                    <div className="h-full space-y-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                                        {detail.items.map(item => (
                                            <div key={item.orderItemId} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-slate-200 shadow-sm">
                                                        {item.quantity}x
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={cn("font-bold text-base", (item.status === 'CANCELLED' || item.status === 'REJECTED') ? "text-slate-400 line-through" : "text-slate-800")}>
                                                            {item.dishName}
                                                        </span>
                                                        {item.note && <span className="text-xs text-slate-500 mt-1 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded-md border border-slate-100 w-fit">{t('note')}: {item.note}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={cn("font-extrabold", (item.status === 'CANCELLED' || item.status === 'REJECTED') ? "text-slate-400 line-through" : "text-slate-800")}>
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5", getItemStatusColor(item.status))}>
                                                        {t(`itemStatus.${item.status}`)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* TAB 2: PROMOTIONS */}
                                <TabsContent value="promotions" className="h-full m-0 focus-visible:outline-none">
                                    <div className="h-full space-y-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                                        {detail.promotions.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                <Tag className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                                                <p className="text-slate-500 font-medium">{t('noPromotionsApplied')}</p>
                                            </div>
                                        ) : (
                                            detail.promotions.map(p => (
                                                <div key={p.promotionId} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-rose-50 rounded-lg"><Tag size={18} className="text-rose-500"/></div>
                                                        <span className="font-bold text-slate-700">{p.promotionName}</span>
                                                    </div>
                                                    <span className="text-rose-500 font-extrabold">-{formatCurrency(p.discountAmount)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>

                                {/* TAB 3: COUPONS */}
                                <TabsContent value="coupons" className="h-full m-0 focus-visible:outline-none">
                                    <div className="h-full space-y-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                                        {detail.coupons.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                <Ticket className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                                                <p className="text-slate-500 font-medium">{t('noCouponsApplied')}</p>
                                            </div>
                                        ) : (
                                            detail.coupons.map(c => (
                                                <div key={c.couponId} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Ticket size={20} className="text-slate-400"/>
                                                        <span className="font-mono bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-md font-bold tracking-widest text-sm">
                                                            {c.couponCode}
                                                        </span>
                                                    </div>
                                                    <span className="text-rose-500 font-extrabold">-{formatCurrency(c.discountAmount)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                </div>
            )}
        </Dialog>
    );
};