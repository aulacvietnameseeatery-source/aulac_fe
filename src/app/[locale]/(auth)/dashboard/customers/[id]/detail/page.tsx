"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Phone, CalendarDays } from "lucide-react";
import { customerDetailService } from "@/features/staff/customer-management/services/customer-detail-service";
import { CustomerProfileDto } from "@/features/staff/customer-management/types/customer-detail-types";
import { useCustomerOrders } from "@/features/staff/customer-management/hooks/use-customer-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetailModal } from "@/features/staff/customer-management/components/order-detail-modal";
import { CustomerOrderCard } from "@/features/staff/customer-management/components/customer-order-card";
import { TablePagination } from "@/components/ui/table/table-pagination"; 
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";

export default function CustomerDetailPage() {
    const t = useTranslations("Customer.Detail");
    const params = useParams();
    const router = useRouter();
    const rawCustomerId = Array.isArray(params.id) ? params.id[0] : params.id;
    const customerId = Number(rawCustomerId);
    const hasValidCustomerId = Number.isFinite(customerId) && customerId > 0;

    // Profile State
    const [profile, setProfile] = useState<CustomerProfileDto | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Modal State
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const [startDate, setStartDate] = useState<string>(""); 
    const [endDate, setEndDate] = useState<string>("");
    const [orderType, setOrderType] = useState<string>("");

    // Hooks
    const { orders, isLoading: isOrdersLoading, totalCount, paginationInfo, onDataChange } = useCustomerOrders(
        hasValidCustomerId ? customerId : 0
    );

    const { page: currentPage, pageSize } = paginationInfo;

    // --- AUTO-FETCH EFFECT ---
    useEffect(() => {
        const filters: Record<string, any> = {};

        if (startDate) {
            const { fromTime } = dateUtils.getUtcDayRange(startDate);
            filters.fromDate = { value: fromTime, operator: 'eq', type: 'date' };
        }
        
        if (endDate) {
            const { toTime } = dateUtils.getUtcDayRange(endDate);
            filters.toDate = { value: toTime, operator: 'eq', type: 'date' };
        }

        if (orderType) {
            filters.orderType = { value: orderType, operator: 'eq', type: 'string' };
        }

        onDataChange({ 
            page: currentPage, 
            pageSize, 
            filters 
        });
        
    }, [startDate, endDate, orderType, currentPage, pageSize]);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    useEffect(() => {
        if (!hasValidCustomerId) {
            setProfile(null);
            setIsLoadingProfile(false);
            return;
        }

        let isMounted = true;
        setIsLoadingProfile(true);

        customerDetailService.getProfile(customerId)
            .then((data) => {
                if (isMounted) {
                    setProfile(data);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setProfile(null);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingProfile(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [customerId, hasValidCustomerId]);

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

    const joinedDate = profile?.createdAt
        ? dateUtils.formatLocal(getUtcDateString(profile.createdAt), "dd/MM/yyyy")
        : "-";
      
    // This function receives the action parameter from TablePagination.
    const handlePageChange = (action: 'first' | 'prev' | 'next' | 'last') => {
        let newPage = currentPage;

        switch (action) {
            case 'first':
                newPage = 1;
                break;
            case 'prev':
                newPage = Math.max(1, currentPage - 1);
                break;
            case 'next':
                newPage = Math.min(totalPages, currentPage + 1);
                break;
            case 'last':
                newPage = totalPages;
                break;
        }

        if (newPage !== currentPage) {
            onDataChange({ page: newPage, pageSize });
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        onDataChange({ page: 1, pageSize: newPageSize });
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    const pageInfo = totalCount === 0 ? "0" : `${startItem} - ${endItem} of ${totalCount}`;

    if (isLoadingProfile) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8" /></div>;
    }

    if (!profile) return <div className="p-8 text-center text-slate-500 font-medium">{t('customerNotFound')}</div>;

    return (
        <div className="h-full bg-[#FDFBF9] flex flex-col space-y-5 overflow-hidden">
            
            {/* 1. Back */}
            <div className="shrink-0">
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 -ml-4 hover:bg-slate-100">
                    <ArrowLeft size={16} className="mr-2" /> {t('backToCustomers')}
                </Button>
            </div>

            {/* 2. Top Card: Customer information */}
            <div className="shrink-0 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-900">{profile.fullName || t('guestCustomer')}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {profile.phone || t('noPhone')}</div>
                        {profile.email && <div className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400"/> {profile.email}</div>}
                        <div className="flex items-center gap-1.5"><CalendarDays size={14} className="text-slate-400"/> {t('joined')}: {joinedDate}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="bg-slate-50 p-3 rounded-lg text-center flex-1 min-w-fit whitespace-nowrap border border-slate-100">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{t('orders')}</p>
                        <p className="text-xl font-extrabold text-slate-800">{profile.orderCount}</p>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-lg text-center flex-1 min-w-fit whitespace-nowrap border border-blue-100">
                        <p className="text-xs text-blue-600/80 font-semibold uppercase tracking-wider mb-1">{t('totalSpent')}</p>
                        <p className="text-xl font-extrabold text-blue-600">{formatCurrency(profile.totalSpent)}</p>
                    </div>
                    <div className="bg-orange-50/50 p-3 rounded-lg text-center flex-1 min-w-fit whitespace-nowrap border border-orange-100">
                        <p className="text-xs text-orange-600/80 font-semibold uppercase tracking-wider mb-1">{t('points')}</p>
                        <p className="text-xl font-extrabold text-orange-600">{profile.loyaltyPoints}</p>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Area */}
            <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
                
                {/* Header order list */}
                <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        {t('orderHistory')}
                    </h2>
                </div>

                {/* --- FILTER AREA (Auto Apply) --- */}
                <div className="shrink-0 flex flex-wrap items-center gap-4 p-4 border-b border-slate-100 bg-white">
                    
                    {/* 1. Start Date */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">{t('from')}</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-[#D5BA98]/60 text-sm font-semibold text-[#1A3A52] bg-[#FDFBF9] focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20 transition-colors cursor-pointer"
                        />
                    </div>
                    
                    {/* 2. End Date */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">{t('to')}</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate} 
                            className="h-9 px-3 rounded-lg border border-[#D5BA98]/60 text-sm font-semibold text-[#1A3A52] bg-[#FDFBF9] focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20 transition-colors cursor-pointer"
                        />
                    </div>

                    {/* 3. Order Type Select (Enum DINE_IN, TAKEAWAY) */}
                    <div>
                        <select 
                            value={orderType} 
                            onChange={(e) => setOrderType(e.target.value)}
                            className="h-9 px-3 min-w-[150px] rounded-lg border border-[#D5BA98]/60 text-sm font-semibold text-[#1A3A52] bg-[#FDFBF9] focus:outline-none hover:bg-[#D5BA98]/10 transition-colors cursor-pointer"
                        >
                            <option value="">{t('allOrderTypes')}</option>
                            <option value="DINE_IN">{t('orderType.DINE_IN')}</option>
                            <option value="TAKEAWAY">{t('orderType.TAKEAWAY')}</option>
                        </select>
                    </div>

                    {/* 4. The Delete Filter button (only appears when a filter is present) */}
                    {(startDate || endDate || orderType) && (
                        <button 
                            onClick={() => { setStartDate(""); setEndDate(""); setOrderType(""); }}
                            className="ml-auto h-9 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            {t('clear')}
                        </button>
                    )}

                </div>
                {/* --- END FILTER --- */}
                
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 relative">
                    {isOrdersLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full border border-slate-200 border-dashed rounded-xl">
                            <p className="text-slate-500 font-medium">{t('noOrdersFound')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                            {orders.map((order) => (
                                <CustomerOrderCard 
                                    key={order.orderId} 
                                    order={order} 
                                    onClick={setSelectedOrderId} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="shrink-0 border-t border-[#D5BA98]/40 bg-[#FDFBF9]">
                    <TablePagination
                        totalCount={totalCount}
                        pageSize={pageSize}
                        pageSizes={[12, 24, 36, 60]} 
                        pageInfo={pageInfo}
                        hasPrev={currentPage > 1}
                        hasNext={currentPage * pageSize < totalCount}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            <OrderDetailModal
                customerId={customerId} 
                orderId={selectedOrderId}
                isOpen={!!selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
            />
        </div>
    );
}