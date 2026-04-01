"use client";
import React from "react";
import { PieChart as PieChartIcon, ShoppingCart, CheckCircle, ShoppingBag, Wine, Utensils, User, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardStatisticsDto, TopCustomerDto } from "../types/dashboard-types";
import { useTranslations } from "next-intl";

interface DashboardChartsRow2Props {
    statistics: DashboardStatisticsDto | null;
    activeOrders?: any[];
    topSpenders?: TopCustomerDto[]; // Bổ sung props nhận topSpenders độc lập
    isLoading?: boolean;
}

export function DashboardChartsRow2({ statistics, activeOrders = [], topSpenders = [], isLoading }: DashboardChartsRow2Props) {
    const t = useTranslations("dashboard.chartsRow2");

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-purple-100 text-purple-700";
            case "COMPLETED": return "bg-emerald-100 text-emerald-700";
            default: return "bg-gray-100 text-gray-700";
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
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-2">
                    <div className="flex items-center gap-2">
                        <PieChartIcon size={18} className="text-gray-500" />
                        <CardTitle className="text-base text-gray-800">{t("category.title")}</CardTitle>
                    </div>
                    <CardAction>
                        <select className="text-xs border rounded-md px-2 py-1 outline-none text-gray-600 bg-gray-50">
                            <option>{t("category.selectedPeriod")}</option>
                        </select>
                    </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                    {isLoading ? (
                        <div className="h-40 bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center mb-2"></div>
                    ) : categoryData.length > 0 ? (
                        <>
                            <div className="h-40 mb-2 w-full">
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
                                                <Cell key={`cell-${index}`} fill={entry.color} />
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
                                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
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
                </CardContent>
            </Card>

            {/* --- 2. Active Orders --- */}
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-2">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-gray-500" />
                        <CardTitle className="text-base text-gray-800">{t("activeOrders.title")}</CardTitle>
                    </div>
                    <CardAction>
                        <button className="text-xs bg-white border rounded-md px-2 py-1 hover:bg-gray-50 text-gray-600">{t("activeOrders.addNew")}</button>
                    </CardAction>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 mt-10 animate-pulse">{t("activeOrders.loading")}</p>
                    ) : activeOrders.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 mt-10">{t("activeOrders.empty")}</p>
                    ) : (
                        activeOrders.map((order: any, i: number) => {
                            const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                            return (
                                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                                            <Utensils size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-0.5 leading-tight">{t("activeOrders.orderId", { id: order.orderId })}</p>
                                            <p className="text-xs text-gray-500 mb-0">{itemCount} {t("activeOrders.itemsUnit")} • {order.tableCode || "N/A"}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* --- 3. Customer Insights (Top 5) --- */}
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-2">
                    <div className="flex items-center gap-2">
                        <Crown size={18} className="text-[#FFAB2D]" />
                        <CardTitle className="text-base text-gray-800">{t("customerInsights.title")}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                    {isLoading ? (
                        <div className="h-full bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center"></div>
                    ) : topSpenders && topSpenders.length > 0 ? (

                        <div className="flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100 rounded-xl mb-2 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#FFAB2D] to-orange-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                                        <Crown size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">{t("customerInsights.topSpender")}</h4>
                                        <p className="text-sm font-bold text-gray-800 leading-tight">{topSpenders[0].customerName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-orange-600">
                                        {topSpenders[0].spent.toLocaleString()} CHF
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {topSpenders.slice(1, 5).map((customer, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                #{idx + 2}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                {customer.customerName}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {customer.spent.toLocaleString()} CHF
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
                </CardContent>
            </Card>
        </div>
    );
}