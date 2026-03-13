"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    RefreshCw,
    Search
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { useKitchen } from "@/features/staff/kitchen/hooks/useKitchen";
import { KitchenOrderCard } from "@/features/staff/kitchen/components/KitchenOrderCard";
import { KitchenStatusBar } from "@/features/staff/kitchen/components/KitchenStatusBar";
import { KitchenOrderGrid } from "@/features/staff/kitchen/components/KitchenOrderGrid";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";

function KitchenContent() {
    const t = useTranslations("Kitchen");
    const { orders, isLoading, isUpdating, updateItemStatus, batchUpdateItemStatus, refresh } = useKitchen();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    }, [refresh]);

    const handleUpdateStatus = useCallback(
        (orderItemId: number, status: string, rejectReason?: string) => {
            updateItemStatus(orderItemId, { status, rejectReason });
        },
        [updateItemStatus],
    );

    const handleBatchUpdateStatus = useCallback(
        (updates: { orderItemId: number; status: string; rejectReason?: string }[]) => {
            batchUpdateItemStatus(updates);
        },
        [batchUpdateItemStatus],
    );

    // Filter orders based on search query and active status
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                order.orderId.toString().includes(searchLower) ||
                order.tableCode.toLowerCase().includes(searchLower) ||
                order.items.some(item => item.dishName.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;

            if (activeStatus) {
                return getOrderDisplayStatus(order.items) === activeStatus;
            }

            return true;
        });
    }, [orders, searchQuery, activeStatus]);

    // Calculate status counts
    const orderCounts = useMemo(() => {
        const counts = { all: orders.length, new: 0, inKitchen: 0, rejected: 0, completed: 0 };

        orders.forEach(order => {
            const status = getOrderDisplayStatus(order.items);
            if (status === 'completed') counts.completed++;
            else if (status === 'rejected') counts.rejected++;
            else if (status === 'in-kitchen') counts.inKitchen++;
            else counts.new++;
        });

        return counts;
    }, [orders]);

    return (
        <div className="w-full flex flex-col h-full bg-[#F8F9FA] px-4 md:px-0">
            {/* Page Header - Compact & Sticky on Mobile */}
            <div className="sticky top-0 z-20 bg-[#F8F9FA]/90 backdrop-blur-md -mx-4 px-4 py-2 border-b border-gray-100 mb-4 lg:relative lg:top-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none lg:mx-0 lg:px-0 lg:py-0 lg:border-none lg:mb-6 lg:mt-1">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                    <div className="flex items-center justify-between lg:justify-start gap-4 sm:gap-6 w-full lg:w-auto">
                        {/* Title and Refresh */}
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-none whitespace-nowrap">
                                {t("title") || "Màn Hình Bếp"}
                            </h1>
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading || isRefreshing}
                                className="p-1.5 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 group shrink-0"
                                title={t("refresh") || "Refresh"}
                            >
                                <RefreshCw className={`w-3 h-3 text-gray-600 transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`} />
                            </button>
                        </div>

                        {/* Order Status Bar - Scrollable Row */}
                        <div className="flex-1 lg:flex-initial min-w-0">
                            <KitchenStatusBar
                                orderCounts={orderCounts}
                                activeStatus={activeStatus}
                                onStatusChange={setActiveStatus}
                                t={t}
                            />
                        </div>
                    </div>

                    {/* Search Bar - Full width on Mobile */}
                    <div className="w-full lg:w-64 xl:w-72">
                        <KeywordSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t("searchPlaceholder") || "Tìm kiếm..."}
                            loading={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar -mx-1 px-1">
                <KitchenOrderGrid
                    orders={filteredOrders}
                    loading={isLoading}
                    onUpdateStatus={handleUpdateStatus}
                    onBatchUpdateStatus={handleBatchUpdateStatus}
                    isUpdating={isUpdating}
                    t={t}
                />
            </div>
        </div>
    );
}

// Map backend items to a single order status for display in status bar
function getOrderDisplayStatus(items: any[]) {
    const isFinished = (s: string) => ["Served", "Ready", "Rejected"].includes(s);
    const isTrulyFinished = (s: string) => ["Served", "Ready"].includes(s);
    const hasProgress = (s: string) => ["In progress", "Served", "Ready"].includes(s);

    // 1. All items are Rejected -> Order is Rejected
    if (items.length > 0 && items.every(i => i.itemStatus === "Rejected")) return "rejected";

    // 2. All items are finished (mix of Served/Ready/Rejected, but at least one success) -> Order is Completed
    if (items.every(i => isFinished(i.itemStatus))) return "completed";

    // 3. Any item is started or finished (but not all are finished/rejected) -> Order is In Kitchen
    if (items.some(i => hasProgress(i.itemStatus))) return "in-kitchen";

    // 4. Otherwise it's New
    return "new";
}

export default function KitchenPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewOrder}>
            <KitchenContent />
        </ProtectedRoute>
    );
}
