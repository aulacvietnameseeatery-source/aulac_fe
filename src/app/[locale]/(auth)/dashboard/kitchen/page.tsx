"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    ChefHat,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { useKitchen } from "@/features/staff/kitchen/hooks/useKitchen";
import { KitchenOrderCard } from "@/features/staff/kitchen/components/KitchenOrderCard";

type KDSTab = "all" | "new" | "inProgress";

function KitchenContent() {
    const t = useTranslations("Kitchen");
    const { orders, isLoading, isUpdating, updateItemStatus, refresh } = useKitchen();
    const [activeTab, setActiveTab] = useState<KDSTab>("all");
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

    // Count items per status across all orders
    const counts = useMemo(() => {
        let newCount = 0;
        let inProgressCount = 0;

        for (const order of orders) {
            for (const item of order.items) {
                if (item.itemStatus === "Created") newCount++;
                else if (item.itemStatus === "In progress") inProgressCount++;
            }
        }

        return {
            all: orders.length,
            new: newCount,
            inProgress: inProgressCount,
        };
    }, [orders]);

    // Filter orders based on active tab
    const filteredOrders = useMemo(() => {
        if (activeTab === "all") return orders;
        const statusMap: Record<string, string> = {
            new: "Created",
            inProgress: "In progress",
        };
        const target = statusMap[activeTab];
        return orders.filter((o) => o.items.some((i) => i.itemStatus === target));
    }, [orders, activeTab]);

    const TABS: { key: KDSTab; label: string; count: number; color: string }[] = [
        { key: "all", label: t("tabs.all"), count: counts.all, color: "bg-gray-700" },
        { key: "new", label: t("tabs.new"), count: counts.new, color: "bg-amber-500" },
        { key: "inProgress", label: t("tabs.inProgress"), count: counts.inProgress, color: "bg-blue-500" },
    ];

    return (
        <div className="w-full flex flex-col h-full">
            {/* ── Title ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                </div>
            </div>


            {/* ── Tabs bar ──────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-4 flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {tab.label}
                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${activeTab === tab.key
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-sm" title={t("liveUpdates")}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                    </div>
                    <button
                        className="ms-button btn-outline-neutral only-icon"
                        onClick={handleRefresh}
                        title={t("refresh")}
                        disabled={isLoading || isRefreshing}
                    >
                        <div className={`icon reload mi icon16${(isLoading || isRefreshing) ? " animate-spin" : ""}`}>&nbsp;</div>
                    </button>
                </div>
            </div>

            {/* ── Order cards grid ──────────────────────────────── */}
            <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24 h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        </div>
                        <p className="text-base font-medium">{t("empty.title")}</p>
                        <p className="text-sm mt-1">{t("empty.hint")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-1">
                        {filteredOrders.map((order) => (
                            <KitchenOrderCard
                                key={order.orderId}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                isUpdating={isUpdating}
                                t={t}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function KitchenPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewOrder}>
            <KitchenContent />
        </ProtectedRoute>
    );
}
