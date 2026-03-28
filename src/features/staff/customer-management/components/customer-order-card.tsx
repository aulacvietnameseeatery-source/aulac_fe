import React from "react";
import { CalendarDays, ChevronRight, ReceiptText, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CustomerOrderDto } from "../types/customer-detail-types";
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";

interface CustomerOrderCardProps {
    order: CustomerOrderDto;
    onClick: (orderId: number) => void;
}

export const CustomerOrderCard: React.FC<CustomerOrderCardProps> = ({ order, onClick }) => {
    const t = useTranslations("Customer.Detail");
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-CH', { 
            style: 'currency', 
            currency: 'CHF',
            minimumFractionDigits: 2
        }).format(val);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
            case "COMPLETED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "CANCELLED": return "bg-rose-100 text-rose-800 border-rose-200";
            default: return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };

    return (
        <div 
            onClick={() => onClick(order.orderId)}
            className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
        >
            {/* Top: Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-base">#{order.orderId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {dateUtils.formatLocal(order.createdAt, "dd/MM/yyyy HH:mm")}
                    </div>
                </div>
                <Badge className={cn("uppercase text-[10px] tracking-wider px-2 py-0.5 border shadow-none", getStatusColor(order.status))}>
                    {order.status}
                </Badge>
            </div>

            {/* Middle: Type & Details */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 font-medium">
                    {order.orderType}
                </Badge>
            </div>

            <hr className="border-slate-100" />

            {/* Bottom: Amounts */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500 font-medium">{t('totalAmount')}</span>
                    <span className="font-extrabold text-slate-900 text-lg">
                        {formatCurrency(order.totalAmount)}
                    </span>
                </div>
                
                {order.tipAmount ? (
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <HeartHandshake className="w-3 h-3" /> {t('tip')}
                        </span>
                        <span className="font-semibold text-slate-600 text-sm">
                            {formatCurrency(order.tipAmount)}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    </div>
                )}
            </div>
        </div>
    );
};