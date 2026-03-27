"use client";
import React from "react";
import { CircleDollarSign, TrendingUp, Donut, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import type { RevenueChartItemDto, TopSellingItemDto, DashboardSummaryDto } from "../types/dashboard-types";
import {RevenueChart} from "@/components/ui/revenue-chart";

interface DashboardChartsRow1Props {
    revenueData: RevenueChartItemDto[];
    topSelling: TopSellingItemDto[];
    summary: DashboardSummaryDto | null;
    isLoading: boolean;
}

export function DashboardChartsRow1({ revenueData, topSelling, summary, isLoading }: DashboardChartsRow1Props) {

    const bestSeller = topSelling.length > 0 ? topSelling[0] : null;


    const maxQuantity = topSelling.length > 0 ? topSelling[0].totalQuantity : 1;

    const colors = ["bg-blue-600", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 flex flex-col h-full border-gray-100/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md border flex items-center justify-center bg-gray-50 text-gray-700">
                            <CircleDollarSign size={16} />
                        </div>
                        <CardTitle className="text-base text-gray-800">Revenue Analysis</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-0 font-medium">Total Revenue</p>
                                <h4 className="text-xl font-bold text-gray-800 mb-0">
                                    {summary?.totalSales.value.toLocaleString() || '0'} CHF
                                </h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="w-3 h-3 rounded-full bg-[#FFAB2D]"></span> Revenue
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 min-h-[300px] bg-gray-50/50 animate-pulse rounded-lg border border-dashed border-gray-200"></div>
                    ) : (
                        <div className="flex-1 min-h-[300px]">
                            <RevenueChart data={revenueData} height={300} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Selling Item */}
            <Card className="lg:col-span-1 flex flex-col h-full border-gray-100/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md border flex items-center justify-center bg-gray-50 text-gray-700">
                            <Donut size={16} />
                        </div>
                        <CardTitle className="text-base text-gray-800">Top Selling Items</CardTitle>
                    </div>
                    <CardAction>
                        <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                    </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-sm text-gray-400 animate-pulse">Loading data...</div>
                    ) : topSelling.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-sm text-gray-400">No data available</div>
                    ) : (
                        <>
                            {/* Hiển thị món hạng 1 */}
                            {bestSeller && (
                                <>
                                    <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                                        ✨ Most Ordered : {bestSeller.dishName}
                                    </div>
                                    <div className="flex items-center border border-gray-100 rounded-lg p-3 shadow-sm bg-white">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md mr-3 overflow-hidden">
                                            {bestSeller.imageUrl ? (
                                                <img src={bestSeller.imageUrl} alt={bestSeller.dishName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Donut size={20}/></div>
                                            )}
                                        </div>
                                        <div>
                                            <h6 className="text-sm font-bold text-gray-800 mb-0.5">{bestSeller.dishName}</h6>
                                            <p className="text-xs text-gray-500 mb-0 font-medium">Total Sold : {bestSeller.totalQuantity}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Danh sách các món còn lại */}
                            <div className="flex flex-col gap-3 mt-2">
                                {topSelling.slice(1).map((item, index) => {
                                    const percent = (item.totalQuantity / maxQuantity) * 100;
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <div key={item.dishId} className="flex items-center justify-between">
                                            <h6 className="text-sm font-semibold text-gray-700 mb-0 w-1/2 truncate pr-2">
                                                <span className="text-gray-400 mr-1">#{index + 2}</span>
                                                {item.dishName}
                                            </h6>
                                            <div className="flex items-center gap-3 w-1/2">
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.totalQuantity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}