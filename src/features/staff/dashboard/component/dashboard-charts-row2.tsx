"use client";
import React from "react";
import { PieChart as PieChartIcon, ShoppingCart, CheckCircle, ShoppingBag, Wine, Utensils, User, Crown, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardStatisticsDto, TopCustomerDto } from "../types/dashboard-types";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/routing";
import {ALCard} from "@/components/ui/al-card";

interface DashboardChartsRow2Props {
    statistics: DashboardStatisticsDto | null;
    activeOrders?: any[];
    topSpenders?: TopCustomerDto[];
    isLoading?: boolean;
}

export function DashboardChartsRow2({ statistics, activeOrders = [], topSpenders = [], isLoading }: DashboardChartsRow2Props) {
    const t = useTranslations("dashboard.chartsRow2");
    const format = useFormatter();
    const router = useRouter();

    const formatCurrency = (value: number) => {
        return format.number(value, { style: 'currency', currency: 'CHF' });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-purple-100 text-purple-700 border-purple-200";
            case "COMPLETED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const categoryData = statistics?.ordersByType ? [
        { name: t("category.dineIn"), value: statistics.ordersByType["DINE_IN"] || 0, color: "#3B82F6", icon: Wine, bgColor: "bg-blue-100 text-blue-600" },
        { name: t("category.takeaway"), value: statistics.ordersByType["TAKEAWAY"] || 0, color: "#10B981", icon: ShoppingBag, bgColor: "bg-emerald-100 text-emerald-600" },
        { name: t("category.delivery"), value: statistics.ordersByType["DELIVERY"] || 0, color: "#8B5CF6", icon: CheckCircle, bgColor: "bg-purple-100 text-purple-600" },
    ].filter(item => item.value > 0) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* --- 1. Category Statistics --- */}
            <ALCard
                variant="default"
                elevation="sm"
                padding="md"
                radius="xl"
                className="flex flex-col h-full shadow-sm min-w-0"
            >
                <div className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2">
                        <PieChartIcon size={18} className="text-gray-500" />
                        <h3 className="text-base font-semibold text-gray-800 m-0">{t("category.title")}</h3>
                    </div>
                    <select className="text-xs border rounded-md px-2 py-1 outline-none text-gray-600 bg-gray-50 cursor-pointer hover:border-gray-300 transition-colors">
                        <option>{t("category.selectedPeriod")}</option>
                    </select>
                </div>

                <div className="flex flex-col h-full flex-1">
                    {isLoading ? (
                        <div className="h-40 bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center mb-2"></div>
                    ) : categoryData.length > 0 ? (
                        <>
                            <div className="h-40 mb-4 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={45}
                                            outerRadius={75}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} ${t("category.ordersUnit")}`, t("category.total")]}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 mt-auto">
                                {categoryData.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0 hover:bg-gray-50/50 p-1 -mx-1 rounded transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${item.bgColor}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{item.value} {t("category.ordersUnit")}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">{t("common.noData")}</div>
                    )}
                </div>
            </ALCard>

            {/* --- 2. Active Orders --- */}
            <ALCard
                variant="default"
                elevation="sm"
                padding="md"
                radius="xl"
                className="flex flex-col h-full shadow-sm min-w-0"
            >
                <div className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-gray-500" />
                        <h3 className="text-base font-semibold text-gray-800 m-0">{t("activeOrders.title")}</h3>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/kitchen')}
                        className="text-xs flex items-center text-[#9A7B4F] hover:text-[#7A623F] font-medium transition-colors"
                    >
                        {t("common.viewAll", { defaultMessage: "View All" })} <ChevronRight size={14} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 mt-10 animate-pulse">{t("activeOrders.loading")}</p>
                    ) : activeOrders.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 mt-10">{t("activeOrders.empty")}</p>
                    ) : (
                        activeOrders.map((order: any, i: number) => {
                            const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                            return (
                                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50/50 p-2 rounded-lg -mx-2 transition-colors cursor-pointer"
                                     onClick={() => router.push(`/dashboard/orders/${order.orderId}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                                            <Utensils size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-0.5 leading-tight">{t("activeOrders.orderId", { id: order.orderId })}</p>
                                            <p className="text-xs text-gray-500 mb-0">{itemCount} {t("activeOrders.itemsUnit")} • {order.tableCode || "N/A"}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-semibold border ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </ALCard>

            {/* --- 3. Customer Insights (Top 5) --- */}
            <ALCard
                variant="default"
                elevation="sm"
                padding="md"
                radius="xl"
                className="flex flex-col h-full shadow-sm min-w-0"
            >
                <div className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2">
                        <Crown size={18} className="text-[#FFAB2D]" />
                        <h3 className="text-base font-semibold text-gray-800 m-0">{t("customerInsights.title")}</h3>
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    {isLoading ? (
                        <div className="h-full bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center"></div>
                    ) : topSpenders && topSpenders.length > 0 ? (
                        <div className="flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#FFAB2D] to-orange-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white shrink-0">
                                        <Crown size={18} className="text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">{t("customerInsights.topSpender")}</h4>
                                        <p className="text-sm font-bold text-gray-800 leading-tight truncate">{topSpenders[0].customerName}</p>
                                    </div>
                                </div>
                                <div className="text-right pl-2 shrink-0">
                                    <p className="text-lg font-black text-orange-600">
                                        {formatCurrency(topSpenders[0].spent)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {topSpenders.slice(1, 5).map((customer, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0 hover:bg-gray-50/50 p-1 -mx-1 rounded transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-7 h-7 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                #{idx + 2}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                {customer.customerName}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800 shrink-0">
                                            {formatCurrency(customer.spent)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <User size={32} className="text-gray-300 mb-2" />
                            <p className="text-sm">{t("customerInsights.empty")}</p>
                        </div>
                    )}
                </div>
            </ALCard>
        </div>
    );
}