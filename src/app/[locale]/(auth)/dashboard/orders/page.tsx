"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarDays,
    ChevronDown,
    RefreshCw,
    Loader2,
    LayoutGrid,
    Plus,
    SquareKanban,
    Search,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table/table-pagination";
import { useOrderHistory } from "@/features/staff/order-management/hooks/useOrderHistory";
import { useOrderStatusCounts } from "@/features/staff/order-management/hooks/useOrderStatusCounts";
import { OrderCard } from "@/features/staff/order-management/components/OrderCard";
import { KanbanOrderCard } from "@/features/staff/order-management/components/KanbanOrderCard";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { OrderHistory } from "@/features/staff/order-management/types/order-history.types";
import { OrderStatusCode } from "@/types/status-codes";
import { orderHistoryService } from "@/features/staff/order-management/services/order-history.service";
import { staffCouponService } from "@/features/staff/coupon-management/coupon-list/services/coupon-service";
import { CouponDTO } from "@/features/staff/coupon-management/coupon-list/types/coupon.types";
import { staffPromotionService } from "@/features/staff/promotion-management/promotion-list/services/promotion-service";
import { PromotionListDTO } from "@/features/staff/promotion-management/promotion-list/types/promotion-types";
import { toast } from "sonner";

interface KanbanColumnConfig {
    key: "pending" | "inProgress" | "completed" | "cancelled";
    headerColor: string;
    statuses: string[];
    primaryKey: "start" | "finish" | "complete" | "reset";
    secondaryKey: "cancel" | "printInvoice" | "delete";
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
    { key: "pending", headerColor: "bg-[#1A3A52]", statuses: ["Pending"], primaryKey: "start", secondaryKey: "cancel" },
    { key: "inProgress", headerColor: "bg-[#1A3A52]/80", statuses: ["In progress"], primaryKey: "finish", secondaryKey: "cancel" },
    { key: "completed", headerColor: "bg-[#4A5D4E]", statuses: ["Completed"], primaryKey: "complete", secondaryKey: "printInvoice" },
    { key: "cancelled", headerColor: "bg-[#8C3A3A]", statuses: ["Cancelled"], primaryKey: "reset", secondaryKey: "delete" },
];

const SEARCH_DEBOUNCE_MS = 400;
const KANBAN_PAGE_SIZE = 50;

function OrdersContent() {
    const t = useTranslations("Order.List");
    const router = useRouter();

    const { orders, isLoading, totalCount, onDataChange, refresh: refreshList } = useOrderHistory();
    const { counts, fetchCounts } = useOrderStatusCounts();

    const [activeTab, setActiveTab] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [paymentCoupons, setPaymentCoupons] = useState<CouponDTO[]>([]);
    const [paymentPromotions, setPaymentPromotions] = useState<PromotionListDTO[]>([]);
    const hasLoadedCouponsRef = useRef(false);
    const hasLoadedPromotionsRef = useRef(false);

    // ── Date range filter ──────────────────────────────────────────────────
    type DatePreset = "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom";
    const DATE_PRESETS: { key: DatePreset; label: string }[] = useMemo(() => [
        { key: "today", label: t("dateRange.today") },
        { key: "yesterday", label: t("dateRange.yesterday") },
        { key: "last7", label: t("dateRange.last7") },
        { key: "last30", label: t("dateRange.last30") },
        { key: "thisMonth", label: t("dateRange.thisMonth") },
        { key: "lastMonth", label: t("dateRange.lastMonth") },
        { key: "custom", label: t("dateRange.custom") },
    ], [t]);

    const [datePreset, setDatePreset] = useState<DatePreset | null>(null);
    const [customFrom, setCustomFrom] = useState("");  // YYYY-MM-DD
    const [customTo, setCustomTo] = useState("");  // YYYY-MM-DD
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Close picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
                setDatePickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const getPresetDates = (preset: DatePreset): { from: Date | null; to: Date | null } => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const eod = new Date(); eod.setHours(23, 59, 59, 999);
        switch (preset) {
            case "today": return { from: today, to: eod };
            case "yesterday": {
                const y = new Date(today); y.setDate(y.getDate() - 1);
                const ye = new Date(y); ye.setHours(23, 59, 59, 999);
                return { from: y, to: ye };
            }
            case "last7": { const f = new Date(today); f.setDate(f.getDate() - 6); return { from: f, to: eod }; }
            case "last30": { const f = new Date(today); f.setDate(f.getDate() - 29); return { from: f, to: eod }; }
            case "thisMonth": { const f = new Date(today.getFullYear(), today.getMonth(), 1); return { from: f, to: eod }; }
            case "lastMonth": {
                const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const t = new Date(today.getFullYear(), today.getMonth(), 0); t.setHours(23, 59, 59, 999);
                return { from: f, to: t };
            }
            default: return { from: null, to: null };
        }
    };

    const activeDateLabel = useMemo(() => {
        if (!datePreset) return null;
        if (datePreset !== "custom") return DATE_PRESETS.find(p => p.key === datePreset)?.label ?? null;
        if (customFrom && customTo) return `${customFrom} – ${customTo}`;
        if (customFrom) return `${t("dateRange.from")} ${customFrom}`;
        return t("dateRange.custom");
    }, [datePreset, customFrom, customTo, DATE_PRESETS, t]);

    const clearDateFilter = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDatePreset(null); setCustomFrom(""); setCustomTo("");
    };

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch counts once on mount (and after each manual refresh)
    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    // Fetch payment promotions once when entering Orders page.
    useEffect(() => {
        if (hasLoadedCouponsRef.current) return;
        hasLoadedCouponsRef.current = true;

        const fetchPaymentCoupons = async () => {
            try {
                const data = await staffCouponService.getCoupons();
                setPaymentCoupons(data ?? []);
            } catch (error) {
                console.error("Failed to fetch payment coupons:", error);
                setPaymentCoupons([]);
            }
        };

        void fetchPaymentCoupons();
    }, []);

    useEffect(() => {
        if (hasLoadedPromotionsRef.current) return;
        hasLoadedPromotionsRef.current = true;

        const fetchPaymentPromotions = async () => {
            try {
                const data = await staffPromotionService.getPromotions({
                    pageIndex: 1,
                    pageSize: 100,
                    promotionStatus: "ACTIVE",
                });
                setPaymentPromotions(data.pageData ?? []);
            } catch (error) {
                console.error("Failed to fetch payment promotions:", error);
                setPaymentPromotions([]);
            }
        };

        void fetchPaymentPromotions();
    }, []);

    // Tabs config — label + badge count từ API
    const TABS = useMemo(() => [
        { label: t("tabs.all"), statusCode: undefined, count: counts.all },
        { label: t("tabs.pending"), statusCode: OrderStatusCode.PENDING, count: counts.pending },
        { label: t("tabs.inProgress"), statusCode: OrderStatusCode.IN_PROGRESS, count: counts.inProgress },
        { label: t("tabs.completed"), statusCode: OrderStatusCode.COMPLETED, count: counts.completed },
        { label: t("tabs.cancelled"), statusCode: OrderStatusCode.CANCELLED, count: counts.cancelled },
    ], [t, counts]);

    // Debounce search — giống BaseTable
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchQuery(searchInput);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchInput]);

    // Trigger data fetch khi params thay đổi
    useEffect(() => {
        const effectivePageSize = viewMode === "kanban" ? KANBAN_PAGE_SIZE : pageSize;
        const statusCode = viewMode === "kanban" ? undefined : TABS[activeTab].statusCode;

        // Compute date range from preset
        let fromDate: Date | undefined;
        let toDate: Date | undefined;
        if (datePreset && datePreset !== "custom") {
            const { from, to } = getPresetDates(datePreset);
            if (from) fromDate = from;
            if (to) toDate = to;
        } else if (datePreset === "custom") {
            if (customFrom) fromDate = new Date(customFrom);
            if (customTo) { toDate = new Date(customTo); toDate.setHours(23, 59, 59, 999); }
        }

        onDataChange({
            page: viewMode === "kanban" ? 1 : currentPage,
            pageSize: effectivePageSize,
            search: searchQuery || undefined,
            orderStatusCode: statusCode,
            fromDate,
            toDate,
        });
    }, [activeTab, currentPage, pageSize, searchQuery, viewMode, datePreset, customFrom, customTo, onDataChange, TABS]);

    const handleTabChange = (idx: number) => { setActiveTab(idx); setCurrentPage(1); };
    const handleViewMode = (mode: "grid" | "kanban") => { setViewMode(mode); setCurrentPage(1); setActiveTab(0); };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([refreshList(), fetchCounts()]);
        setIsRefreshing(false);
    }, [refreshList, fetchCounts]);

    const handleOrderAction = useCallback(async (orderId: number, action: string) => {
        const statusMap: Partial<Record<string, OrderStatusCode>> = {
            start: OrderStatusCode.IN_PROGRESS,
            finish: OrderStatusCode.COMPLETED,
            complete: OrderStatusCode.COMPLETED,
            cancel: OrderStatusCode.CANCELLED,
            reset: OrderStatusCode.PENDING,
        };

        const targetStatus = statusMap[action];
        if (!targetStatus) {
            return;
        }

        try {
            await orderHistoryService.updateOrderStatus(orderId, targetStatus);
            toast.success(t("statusUpdateSuccess"));
            await handleRefresh();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error(t("statusUpdateError"));
        }
    }, [handleRefresh]);

    // Pagination helpers
    const pageInfo = useMemo(() => {
        if (!totalCount) return "0 - 0";
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCount);
        return `${start} - ${end}`;
    }, [currentPage, pageSize, totalCount]);

    const handlePageChange = useCallback((action: "first" | "prev" | "next" | "last") => {
        const totalPages = Math.ceil(totalCount / pageSize);
        switch (action) {
            case "first": setCurrentPage(1); break;
            case "prev": setCurrentPage((p) => Math.max(1, p - 1)); break;
            case "next": setCurrentPage((p) => Math.min(totalPages, p + 1)); break;
            case "last": setCurrentPage(totalPages); break;
        }
    }, [totalCount, pageSize]);

    const handlePageSizeChange = useCallback((size: number) => { setPageSize(size); setCurrentPage(1); }, []);

    // Kanban helpers
    const getColumnOrders = (col: KanbanColumnConfig): OrderHistory[] => {
        const lower = col.statuses.map((s) => s.toLowerCase());
        return orders.filter((o) => lower.includes(o.orderStatus.toLowerCase()));
    };

    const handleCreate = () => {
        router.push(`/dashboard/orders/create`);
    };

    return (
        <div className="w-full flex flex-col h-full bg-[#FDFBF9] px-4 md:px-0">
            <div className="sticky top-0 z-20 bg-[#FDFBF9]/90 backdrop-blur-md -mx-4 px-4 py-2 border-b border-[#D5BA98]/30 mb-4 lg:relative lg:top-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none lg:mx-0 lg:px-0 lg:py-0 lg:border-none lg:mb-6 lg:mt-1">
                <div className="flex flex-col gap-3 lg:gap-4">
                    <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-[#1A3A52] leading-none whitespace-nowrap">
                                {t("title")}
                            </h1>
                            <p className="text-xs text-[#1A3A52]/60 mt-1">{t("description")}</p>
                        </div>
                        <Button onClick={handleCreate} variant="outline" size="sm" className="h-9 px-3.5 text-sm font-semibold bg-[#FDFBF9] border-[#D5BA98]/60 text-[#1A3A52] hover:bg-[#D5BA98]/10 shadow-none">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            {t("addNewOrder")}
                        </Button>
                    </div>

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 xl:gap-4">
                        <div className="flex-1 min-w-0">
                            {viewMode === "grid" ? (
                                <div className="-mx-0.5 overflow-x-auto">
                                    <div className="px-0.5 flex items-center gap-1.5 min-w-max">
                                        {TABS.map((tab, idx) => (
                                            <button
                                                key={tab.label}
                                                onClick={() => handleTabChange(idx)}
                                                className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === idx
                                                    ? "bg-[#1A3A52] text-white shadow-sm"
                                                    : "text-[#1A3A52]/70 bg-[#FDFBF9] border border-[#D5BA98]/50 hover:bg-[#D5BA98]/10"
                                                    }`}
                                            >
                                                <span>{tab.label}</span>
                                                <span className={`text-[10px] leading-tight rounded-full px-1.5 py-0.5 font-bold ${activeTab === idx
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[#D5BA98]/25 text-[#1A3A52]/70"
                                                    }`}>
                                                    {tab.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs sm:text-sm font-medium text-[#1A3A52]/60 px-0.5">
                                    {t("kanbanLabel")}
                                </div>
                            )}
                        </div>

                        <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="relative w-full xl:w-72">
                                <Search className="w-4 h-4 text-[#1A3A52]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-[#D5BA98]/60 bg-[#FDFBF9] pl-9 pr-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/40 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/15 focus:border-[#1A3A52]/40"
                                    placeholder={t("searchPlaceholder")}
                                    type="text"
                                    autoComplete="on"
                                />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative" ref={datePickerRef}>
                                    <button
                                        onClick={() => setDatePickerOpen(o => !o)}
                                        className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border text-sm font-semibold transition-colors ${datePreset
                                            ? "bg-[#D5BA98]/20 border-[#D5BA98]/70 text-[#1A3A52]"
                                            : "bg-[#FDFBF9] border-[#D5BA98]/60 text-[#1A3A52]/70 hover:bg-[#D5BA98]/10"
                                            }`}
                                    >
                                        <CalendarDays className="w-4 h-4" />
                                        <span>{activeDateLabel ?? t("dateRange.label")}</span>
                                        {datePreset ? (
                                            <X className="w-3.5 h-3.5 ml-0.5 text-[#1A3A52]/60" onClick={clearDateFilter} />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                        )}
                                    </button>

                                    {datePickerOpen && (
                                        <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1 z-50 bg-[#FDFBF9] border border-[#D5BA98]/50 rounded-xl shadow-xl w-64 py-1 text-sm">
                                            {DATE_PRESETS.filter(p => p.key !== "custom").map(preset => (
                                                <button
                                                    key={preset.key}
                                                    onClick={() => { setDatePreset(preset.key); setDatePickerOpen(false); }}
                                                    className={`w-full text-left px-4 py-2.5 hover:bg-[#D5BA98]/15 transition-colors ${datePreset === preset.key ? "bg-[#1A3A52] text-white font-semibold" : "text-[#1A3A52]"
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                            <div className="border-t border-[#D5BA98]/40 mt-1 pt-2 px-4 pb-3">
                                                <div className="text-xs font-semibold text-[#1A3A52]/50 uppercase tracking-wider mb-2">{t("dateRange.custom")}</div>
                                                <div className="flex flex-col gap-1.5">
                                                    <input
                                                        type="date"
                                                        value={customFrom}
                                                        onChange={e => { setCustomFrom(e.target.value); setDatePreset("custom"); }}
                                                        className="w-full border border-[#D5BA98]/60 rounded-lg px-2 py-1.5 text-sm text-[#1A3A52] bg-[#FDFBF9] focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20"
                                                        placeholder={t("dateRange.from")}
                                                    />
                                                    <input
                                                        type="date"
                                                        value={customTo}
                                                        onChange={e => { setCustomTo(e.target.value); setDatePreset("custom"); }}
                                                        className="w-full border border-[#D5BA98]/60 rounded-lg px-2 py-1.5 text-sm text-[#1A3A52] bg-[#FDFBF9] focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20"
                                                        placeholder={t("dateRange.to")}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setDatePickerOpen(false)}
                                                    className="mt-2 w-full bg-[#1A3A52] text-white rounded-lg py-1.5 text-sm font-semibold hover:bg-[#1A3A52]/90 transition-colors"
                                                >
                                                    {t("dateRange.apply")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading || isRefreshing}
                                    className="p-1.5 bg-[#FDFBF9] border border-[#D5BA98]/50 rounded-lg hover:bg-[#D5BA98]/10 transition-colors shadow-none disabled:opacity-50 group shrink-0"
                                    title={t("refresh")}
                                >
                                    <RefreshCw className={`w-3 h-3 text-[#1A3A52]/60 transition-transform duration-500 ${(isLoading || isRefreshing) ? "animate-spin" : "group-hover:rotate-180"}`} />
                                </button>

                                <div className="h-8 inline-flex items-center border border-[#D5BA98]/60 rounded-lg bg-[#FDFBF9] p-0.5 gap-0.5">
                                    <button
                                        onClick={() => handleViewMode("grid")}
                                        title={t("viewMode.grid")}
                                        className={`h-full px-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#1A3A52] text-white shadow-sm" : "text-[#1A3A52]/50 hover:bg-[#D5BA98]/15"}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleViewMode("kanban")}
                                        title={t("viewMode.kanban")}
                                        className={`h-full px-2 rounded-md transition-colors ${viewMode === "kanban" ? "bg-[#1A3A52] text-white shadow-sm" : "text-[#1A3A52]/50 hover:bg-[#D5BA98]/15"}`}
                                    >
                                        <SquareKanban className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <div className="h-full">
                    <div className="voucher-body-grid flex-1 min-h-0 h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24 h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#1A3A52]" />
                            </div>
                        ) : viewMode === "kanban" ? (
                            /* ── KANBAN VIEW — full-height scrollable, no pagination ── */
                            <div className="h-full overflow-auto p-0 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                                    {KANBAN_COLUMNS.map((col) => {
                                        const colOrders = getColumnOrders(col);
                                        return (
                                            <div key={col.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                <div className={`flex items-center justify-between ${col.headerColor} rounded-t-2xl px-4 py-3`}>
                                                    <span className="text-white font-semibold text-sm">{t(`kanban.${col.key}`)}</span>
                                                    <span className="text-white text-sm font-medium bg-white/20 rounded-full px-2 py-0.5">
                                                        {col.key === "pending" ? counts.pending
                                                            : col.key === "inProgress" ? counts.inProgress
                                                                : col.key === "completed" ? counts.completed
                                                                    : counts.cancelled}
                                                    </span>
                                                </div>
                                                <div className="p-3 flex flex-col gap-3">
                                                    {colOrders.length === 0 ? (
                                                        <div className="text-center py-10 text-[#1A3A52]/40 text-xs">
                                                            {t("kanban.empty")}
                                                        </div>
                                                    ) : (
                                                        colOrders.map((order) => (
                                                            <KanbanOrderCard
                                                                key={order.orderId}
                                                                order={order}
                                                                primaryAction={{ label: t(`kanban.${col.primaryKey}`), onClick: () => { void handleOrderAction(order.orderId, col.primaryKey); } }}
                                                                secondaryAction={{ label: t(`kanban.${col.secondaryKey}`), onClick: () => { void handleOrderAction(order.orderId, col.secondaryKey); } }}
                                                                onAction={(id, action) => {
                                                                    console.log("Kanban Action:", action, "on order:", id);
                                                                    if (action === "view" || action === "edit") {
                                                                        router.push(`/dashboard/orders/${id}/edit`);
                                                                    } else if (action !== 'pay') {
                                                                        void handleOrderAction(id, action);
                                                                    }
                                                                }}
                                                                couponOptions={paymentCoupons}
                                                                promotionOptions={paymentPromotions}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* ── GRID VIEW — scrollable cards + inline pagination ── */
                            <div className="h-full flex flex-col overflow-hidden p-0">
                                {orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-24 text-[#1A3A52]/50">
                                        <div className="w-16 h-16 rounded-full bg-[#D5BA98]/20 flex items-center justify-center mb-4">
                                            <Search className="w-7 h-7" />
                                        </div>
                                        <p className="text-base font-medium">{t("empty.title")}</p>
                                        <p className="text-sm mt-1">{t("empty.hint")}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar pr-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                                {orders.map((order) => (
                                                    <OrderCard
                                                        key={order.orderId}
                                                        order={order}
                                                        onStatusChange={handleRefresh}
                                                        couponOptions={paymentCoupons}
                                                        promotionOptions={paymentPromotions}
                                                        onAction={(id, action) => {
                                                            console.log("Action:", action, "on order:", id);
                                                            if (action === "view" || action === "edit") {
                                                                router.push(`/dashboard/orders/${id}/edit`);
                                                            } else if (action !== 'pay') {
                                                                void handleOrderAction(id, action);
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="shrink-0 border-t rounded-xl border-[#D5BA98]/40 bg-[#FDFBF9]">
                                            <TablePagination
                                                totalCount={totalCount}
                                                pageSize={pageSize}
                                                pageSizes={[10, 20, 30, 50]}
                                                pageInfo={pageInfo}
                                                hasPrev={currentPage > 1}
                                                hasNext={currentPage * pageSize < totalCount}
                                                onPageChange={handlePageChange}
                                                onPageSizeChange={handlePageSizeChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewOrder}>
            <OrdersContent />
        </ProtectedRoute>
    );
}
