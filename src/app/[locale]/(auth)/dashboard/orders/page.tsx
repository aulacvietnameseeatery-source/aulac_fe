"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    BookmarkCheck,
    CalendarDays,
    CircleArrowOutDownRight,
    CheckCircle2,
    ChevronDown,
    Loader,
    Loader2,
    LayoutGrid,
    Plus,
    SquareKanban,
    UserX,
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

// statusLvId phải khớp với value_id trong bảng lookup_value (type_id = 10)
const STATUS_LV_IDS = {
    pending: 28,
    inProgress: 29,
    completed: 30,
    cancelled: 31,
} as const;

interface KanbanColumnConfig {
    key: "pending" | "inProgress" | "completed" | "cancelled";
    headerColor: string;
    statuses: string[];
    primaryKey: "start" | "finish" | "complete" | "reset";
    secondaryKey: "cancel" | "printInvoice" | "delete";
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
    { key: "pending", headerColor: "bg-gray-800", statuses: ["Pending"], primaryKey: "start", secondaryKey: "cancel" },
    { key: "inProgress", headerColor: "bg-blue-600", statuses: ["In progress"], primaryKey: "finish", secondaryKey: "cancel" },
    { key: "completed", headerColor: "bg-green-600", statuses: ["Completed"], primaryKey: "complete", secondaryKey: "printInvoice" },
    { key: "cancelled", headerColor: "bg-red-500", statuses: ["Cancelled"], primaryKey: "reset", secondaryKey: "delete" },
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

    // Tabs config — label + badge count từ API
    const TABS = useMemo(() => [
        { label: t("tabs.all"), statusLvId: undefined, count: counts.all },
        { label: t("tabs.pending"), statusLvId: STATUS_LV_IDS.pending, count: counts.pending },
        { label: t("tabs.inProgress"), statusLvId: STATUS_LV_IDS.inProgress, count: counts.inProgress },
        { label: t("tabs.completed"), statusLvId: STATUS_LV_IDS.completed, count: counts.completed },
        { label: t("tabs.cancelled"), statusLvId: STATUS_LV_IDS.cancelled, count: counts.cancelled },
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
        const statusLvId = viewMode === "kanban" ? undefined : TABS[activeTab].statusLvId;

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
            orderStatusLvId: statusLvId,
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
        <div className="w-full flex flex-col h-full">
            {/* ── Title row ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("title")}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{t("description")}</p>
                </div>
                {/* Add New Order button — same as staff renderTitle pattern */}
                <Button onClick={handleCreate} variant="outline" size="sm" className="shadow-sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t("addNewOrder")}
                </Button>
            </div>


            {/* ── BaseTable-style toolbar ──────────────────────────────────── */}
            <div className="body-layout-list flex-1 flex flex-col min-h-0">
                <div className="body-list flex flex-col flex-1 min-h-0">
                    {/* Condition / search bar - Exactly matches BaseTable structure */}
                    <div className="form-list">
                        <div className="condition-box flex flex-row items-center w-full h-full">
                            <div className="flex gap-2 items-center flex-1 flex-wrap">
                                {/* Search — giống BaseTable */}
                                <div className="ms-input ms-editor w-full flex items-center gap-4 search-input-list" style={{ height: "auto" }}>
                                    <div className="flex-1 flex items-center input-container border pointer">
                                        <div className="mi icon16 icon left search" />
                                        <input
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="ms-input-item flex w-full min-w-[200px]"
                                            placeholder={t("searchPlaceholder")}
                                            type="text"
                                            autoComplete="on"
                                            size={Math.max((t("searchPlaceholder") as string)?.length || 20, searchInput.length) + 2}
                                        />
                                    </div>
                                </div>

                                {/* Tabs — chỉ hiển thị ở grid mode */}
                                {viewMode === "grid" ? (
                                    <div className="flex items-center gap-0.5 flex-wrap">
                                        {TABS.map((tab, idx) => (
                                            <button
                                                key={tab.label}
                                                onClick={() => handleTabChange(idx)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === idx
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {tab.label}
                                                <span className={`text-[10px] leading-tight rounded-full px-1.5 py-0.5 font-semibold ${activeTab === idx
                                                    ? "bg-white/20 text-white"
                                                    : "bg-gray-200 text-gray-600"
                                                    }`}>
                                                    {tab.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-700">
                                        {/*{t("kanbanLabel")}*/}
                                    </span>
                                )}
                                {/* Date range filter */}
                                <div className="relative" ref={datePickerRef}>
                                    <button
                                        onClick={() => setDatePickerOpen(o => !o)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${datePreset
                                            ? "bg-blue-50 border-blue-300 text-blue-700"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <CalendarDays className="w-4 h-4" />
                                        <span>{activeDateLabel ?? t("dateRange.label")}</span>
                                        {datePreset ? (
                                            <X className="w-3.5 h-3.5 ml-0.5 text-blue-500" onClick={clearDateFilter} />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                        )}
                                    </button>

                                    {datePickerOpen && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-64 py-1 text-sm">
                                            {DATE_PRESETS.filter(p => p.key !== "custom").map(preset => (
                                                <button
                                                    key={preset.key}
                                                    onClick={() => { setDatePreset(preset.key); setDatePickerOpen(false); }}
                                                    className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors ${datePreset === preset.key ? "bg-blue-600 text-white font-semibold" : "text-gray-700"
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                            <div className="border-t border-gray-100 mt-1 pt-2 px-4 pb-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("dateRange.custom")}</div>
                                                <div className="flex flex-col gap-1.5">
                                                    <input
                                                        type="date"
                                                        value={customFrom}
                                                        onChange={e => { setCustomFrom(e.target.value); setDatePreset("custom"); }}
                                                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder={t("dateRange.from")}
                                                    />
                                                    <input
                                                        type="date"
                                                        value={customTo}
                                                        onChange={e => { setCustomTo(e.target.value); setDatePreset("custom"); }}
                                                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder={t("dateRange.to")}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setDatePickerOpen(false)}
                                                    className="mt-2 w-full bg-blue-600 text-white rounded-lg py-1.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
                                                >
                                                    {t("dateRange.apply")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Right: refresh + view toggle */}
                            <div className="action flex items-center gap-2 pr-2">
                                <button
                                    className="ms-button btn-outline-neutral only-icon"
                                    onClick={handleRefresh}
                                    title={t("refresh")}
                                    disabled={isLoading || isRefreshing}
                                >
                                    <div className={`icon reload mi icon16${(isLoading || isRefreshing) ? " animate-spin" : ""}`}>&nbsp;</div>
                                </button>

                                <div className="flex items-center border border-gray-200 rounded-lg bg-white p-0.5 gap-0.5">
                                    <button
                                        onClick={() => handleViewMode("grid")}
                                        title="Grid"
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleViewMode("kanban")}
                                        title="Kanban"
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === "kanban" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                                    >
                                        <SquareKanban className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Content area ────────────────────────────────────── */}
                    <div className="voucher-body-grid flex-1 min-h-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24 h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : viewMode === "kanban" ? (
                            /* ── KANBAN VIEW — full-height scrollable, no pagination ── */
                            <div className="h-full overflow-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {KANBAN_COLUMNS.map((col) => {
                                        const colOrders = getColumnOrders(col);
                                        return (
                                            <div key={col.key} className="bg-gray-50 rounded-2xl border border-gray-200">
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
                                                        <div className="text-center py-10 text-gray-400 text-xs">
                                                            {t("kanban.empty")}
                                                        </div>
                                                    ) : (
                                                        colOrders.map((order) => (
                                                            <KanbanOrderCard
                                                                key={order.orderId}
                                                                order={order}
                                                                primaryAction={{ label: t(`kanban.${col.primaryKey}`), onClick: () => { } }}
                                                                secondaryAction={{ label: t(`kanban.${col.secondaryKey}`), onClick: () => { } }}
                                                                onAction={(id, action) => {
                                                                    console.log("Kanban Action:", action, "on order:", id);
                                                                    if (action === "view" || action === "edit") {
                                                                        router.push(`/dashboard/orders/${id}/edit`);
                                                                    } else if (action !== 'pay') {
                                                                        handleRefresh();
                                                                    }
                                                                }}
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
                            <div className="h-full overflow-auto p-4 custom-scrollbar">
                                {orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                            <Search className="w-7 h-7" />
                                        </div>
                                        <p className="text-base font-medium">{t("empty.title")}</p>
                                        <p className="text-sm mt-1">{t("empty.hint")}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col min-h-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4 flex-1">
                                            {orders.map((order) => (
                                                <OrderCard
                                                    key={order.orderId}
                                                    order={order}
                                                    onStatusChange={handleRefresh}
                                                    onAction={(id, action) => {
                                                        console.log("Action:", action, "on order:", id);
                                                        if (action === "view" || action === "edit") {
                                                            router.push(`/dashboard/orders/${id}/edit`);
                                                        } else if (action !== 'pay') {
                                                            handleRefresh();
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-auto">
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
