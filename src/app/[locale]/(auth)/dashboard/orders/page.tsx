"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    BookmarkCheck,
    CircleArrowOutDownRight,
    Loader,
    Loader2,
    LayoutGrid,
    SquareKanban,
    UserX,
    Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { TablePagination } from "@/components/ui/table/table-pagination";
import { useOrderHistory } from "@/features/staff/order-management/hooks/useOrderHistory";
import { useOrderStatusCounts } from "@/features/staff/order-management/hooks/useOrderStatusCounts";
import { OrderCard } from "@/features/staff/order-management/components/OrderCard";
import { KanbanOrderCard } from "@/features/staff/order-management/components/KanbanOrderCard";
import { OrderStatusCard } from "@/features/staff/order-management/components/OrderStatusCard";
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

// ─── Main Content ──────────────────────────────────────────────────────────
function OrdersContent() {
    const t = useTranslations("Order.List");

    const { orders, isLoading, totalCount, onDataChange, refresh: refreshList } = useOrderHistory();
    const { counts, fetchCounts } = useOrderStatusCounts();

    const [activeTab, setActiveTab] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    // Status summary cards — counts từ API, không đổi khi filter
    const STATUS_CARDS = useMemo(() => [
        { label: t("statusCards.all"), colorClass: "bg-gray-100 text-gray-600", icon: <BookmarkCheck className="w-5 h-5" />, count: counts.all },
        { label: t("statusCards.pending"), colorClass: "bg-blue-100 text-blue-600", icon: <CircleArrowOutDownRight className="w-5 h-5" />, count: counts.pending },
        { label: t("statusCards.inProgress"), colorClass: "bg-orange-100 text-orange-600", icon: <Loader className="w-5 h-5" />, count: counts.inProgress },
        { label: t("statusCards.cancelled"), colorClass: "bg-red-100 text-red-600", icon: <UserX className="w-5 h-5" />, count: counts.cancelled },
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
        onDataChange({
            page: viewMode === "kanban" ? 1 : currentPage,
            pageSize: effectivePageSize,
            search: searchQuery || undefined,
            orderStatusLvId: statusLvId,
        });
    }, [activeTab, currentPage, pageSize, searchQuery, viewMode, onDataChange, TABS]);

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

    return (
        <div className="w-full flex flex-col h-full">
            {/* ── Title row ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("title")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                </div>
            </div>

            {/* ── Status summary cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {STATUS_CARDS.map((card) => (
                    <OrderStatusCard
                        key={card.label}
                        label={card.label}
                        count={card.count}
                        icon={card.icon}
                        colorClass={card.colorClass}
                    />
                ))}
            </div>

            {/* ── BaseTable-style toolbar ──────────────────────────────────── */}
            <div className="body-layout-list flex-1 flex flex-col min-h-0">
                <div className="body-list flex flex-col flex-1 min-h-0">
                    <div className="form-list flex flex-col flex-1 min-h-0">
                        {/* Condition / search bar */}
                        <div className="condition-box flex flex-row items-center w-full">
                            <div className="flex gap-2 items-center flex-1 flex-wrap">
                                {/* Search — giống BaseTable */}
                                <div className="ms-input ms-editor flex items-center search-input-list max-h-4" style={{ height: "auto" }}>
                                    <div className="flex-1 flex items-center input-container border pointer">
                                        <div className="mi icon16 icon left search" />
                                        <input
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="ms-input-item flex"
                                            placeholder={t("searchPlaceholder")}
                                            type="text"
                                            autoComplete="on"
                                        />
                                        {searchInput && (
                                            <button
                                                className="mi icon16 icon right close mr-1"
                                                onClick={() => setSearchInput("")}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Tabs — chỉ hiển thị ở grid mode */}
                                {viewMode === "grid" ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {TABS.map((tab, idx) => (
                                            <button
                                                key={tab.label}
                                                onClick={() => handleTabChange(idx)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === idx
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {tab.label}
                                                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${activeTab === idx
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
                                        {t("kanbanLabel")}
                                    </span>
                                )}
                            </div>

                            {/* Right: refresh + view toggle */}
                            <div className="action flex items-center gap-2">
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

                        {/* ── Content area ────────────────────────────────────── */}
                        <div className="voucher-body-grid flex-1 min-h-0">
                            <div className="ms-grid-viewer flex flex-col has-paging flex-box">
                                <div className="flex-1 overflow-auto p-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-24">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : viewMode === "kanban" ? (
                                        /* ── KANBAN VIEW ───────────────────────────────── */
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
                                                                    />
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : orders.length === 0 ? (
                                        /* ── GRID empty state ───────────────────────────── */
                                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <Search className="w-7 h-7" />
                                            </div>
                                            <p className="text-base font-medium">{t("empty.title")}</p>
                                            <p className="text-sm mt-1">{t("empty.hint")}</p>
                                        </div>
                                    ) : (
                                        /* ── GRID VIEW ─────────────────────────────────── */
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {orders.map((order) => (
                                                <OrderCard key={order.orderId} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Pagination — chỉ ở grid mode */}
                                {viewMode === "grid" && (
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
                                )}
                            </div>
                        </div>
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
