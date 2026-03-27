"use client";
import React from "react";
import { PieChart as PieChartIcon, ShoppingCart, CheckCircle, ShoppingBag, Wine, Utensils, User, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardStatisticsDto } from "../types/dashboard-types";

interface DashboardChartsRow2Props {
    statistics: DashboardStatisticsDto | null;
    activeOrders?: any[];
    isLoading?: boolean;
}

export function DashboardChartsRow2({ statistics, activeOrders = [], isLoading }: DashboardChartsRow2Props) {
    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-purple-100 text-purple-700";
            case "COMPLETED": return "bg-emerald-100 text-emerald-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };


    const categoryData = statistics?.ordersByType ? [
        { name: "Dine-In", value: statistics.ordersByType["DINE_IN"] || 0, color: "#3B82F6", icon: Wine, bgColor: "bg-blue-100 text-blue-600" },
        { name: "Takeaway", value: statistics.ordersByType["TAKEAWAY"] || 0, color: "#10B981", icon: ShoppingBag, bgColor: "bg-emerald-100 text-emerald-600" },
        { name: "Delivery", value: statistics.ordersByType["DELIVERY"] || 0, color: "#8B5CF6", icon: CheckCircle, bgColor: "bg-purple-100 text-purple-600" },
    ].filter(item => item.value > 0) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Category Statistics */}
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-4">
                    <div className="flex items-center gap-2">
                        <PieChartIcon size={18} className="text-gray-500" />
                        <CardTitle className="text-base text-gray-800">Category Statistics</CardTitle>
                    </div>
                    <CardAction>
                        <select className="text-xs border rounded-md px-2 py-1 outline-none text-gray-600 bg-gray-50">
                            <option>Selected Period</option>
                        </select>
                    </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                    {isLoading ? (
                        <div className="h-40 bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center mb-4"></div>
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
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} Orders`, 'Total']}
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
                                            <span className="text-sm font-bold text-gray-800">{item.value} Orders</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-gray-500" />
                        <CardTitle className="text-base text-gray-800">Active Orders</CardTitle>
                    </div>
                    <CardAction>
                        <button className="text-xs bg-white border rounded-md px-2 py-1 hover:bg-gray-50 text-gray-600">Add New</button>
                    </CardAction>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 mt-10 animate-pulse">Loading orders...</p>
                    ) : activeOrders.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 mt-10">No active orders</p>
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
                                            <p className="text-sm font-bold text-gray-800 mb-0.5 leading-tight">Order #{order.orderId}</p>
                                            <p className="text-xs text-gray-500 mb-0">{itemCount} items • {order.tableCode || "N/A"}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Customer Insights */}
            <Card className="flex flex-col h-full border-gray-100/50 shadow-sm min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-4">
                    <div className="flex items-center gap-2">
                        <Crown size={18} className="text-[#FFAB2D]" />
                        <CardTitle className="text-base text-gray-800">Customer Insights</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-center flex-1">
                    {isLoading ? (
                        <div className="h-full bg-gray-50/50 animate-pulse rounded-lg border border-dashed flex items-center justify-center"></div>
                    ) : statistics?.topCustomer ? (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#FFAB2D] to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-orange-50">
                                <User size={32} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Top Spender</h4>
                            <p className="text-xl font-bold text-gray-800">{statistics.topCustomer.customerName}</p>

                            <div className="mt-8 w-full bg-orange-50/50 rounded-xl p-5 border border-orange-100/50">
                                <p className="text-sm text-orange-600/80 font-medium mb-1">Total Spent</p>
                                <p className="text-3xl font-black text-orange-600">
                                    {statistics.topCustomer.spent.toLocaleString()} CHF
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <User size={32} className="text-gray-300 mb-2" />
                            <p className="text-sm">No customer data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}