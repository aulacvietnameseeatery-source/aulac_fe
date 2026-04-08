"use client";
import React from "react";
import { CircleDollarSign, TrendingUp, Donut, MoreVertical, ChevronRight } from "lucide-react";
import { CardAction } from "@/components/ui/card";
import type { RevenueChartItemDto, TopSellingItemDto, DashboardSummaryDto } from "../types/dashboard-types";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/routing";
import {ALCard} from "@/components/ui/al-card";

interface DashboardChartsRow1Props {
    revenueData: RevenueChartItemDto[];
    topSelling: TopSellingItemDto[];
    summary: DashboardSummaryDto | null;
    isLoading: boolean;
}

export function DashboardChartsRow1({ revenueData, topSelling, summary, isLoading }: DashboardChartsRow1Props) {
    const t = useTranslations("dashboard.chartsRow1");
    const format = useFormatter();
    const router = useRouter();

    const bestSeller = topSelling.length > 0 ? topSelling[0] : null;
    const maxQuantity = topSelling.length > 0 ? topSelling[0].totalQuantity : 1;
    const colors = ["bg-blue-600", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];

    // Format tiền tệ dựa trên ngôn ngữ hiện tại của trang web
    const formatCurrency = (value: number) => {
        return format.number(value, { style: 'currency', currency: 'CHF' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ALCard
                variant="default"
                elevation="sm"
                padding="md"
                radius="xl"
                className="lg:col-span-2 flex flex-col h-full shadow-sm relative group"
            >
                <div className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md border flex items-center justify-center bg-gray-50 text-gray-700">
                            <CircleDollarSign size={16} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 m-0">{t("revenue.title")}</h3>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-0 font-medium">{t("revenue.total")}</p>
                                <h4 className="text-xl font-bold text-gray-800 mb-0">
                                    {formatCurrency(summary?.totalSales.value || 0)}
                                </h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="w-3 h-3 rounded-full bg-[#FFAB2D]"></span> {t("revenue.label")}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 min-h-[300px] bg-gray-50/50 animate-pulse rounded-lg border border-dashed border-gray-200"></div>
                    ) : (
                        <div className="flex-1 min-h-[300px]">
                            <RevenueChart data={revenueData} height={300} />
                        </div>
                    )}
                </div>
            </ALCard>

            <ALCard
                variant="default"
                elevation="sm"
                padding="md"
                radius="xl"
                className="lg:col-span-1 flex flex-col h-full shadow-sm relative"
            >
                <div className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/50 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md border flex items-center justify-center bg-gray-50 text-gray-700">
                            <Donut size={16} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 m-0">{t("topSelling.title")}</h3>
                    </div>

                </div>

                <div className="flex flex-col gap-4 flex-1">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-sm text-gray-400 animate-pulse">{t("common.loading")}</div>
                    ) : topSelling.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-sm text-gray-400">{t("common.noData")}</div>
                    ) : (
                        <>
                            {bestSeller && (
                                <>
                                    <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                                        ✨ {t("topSelling.mostOrdered")} : {bestSeller.dishName}
                                    </div>
                                    <div className="flex items-center border border-gray-100 rounded-lg p-3 shadow-sm bg-white">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md mr-3 overflow-hidden shrink-0">
                                            {bestSeller.imageUrl ? (
                                                <img src={bestSeller.imageUrl} alt={bestSeller.dishName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Donut size={20}/></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h6 className="text-sm font-bold text-gray-800 mb-0.5 truncate">{bestSeller.dishName}</h6>
                                            <p className="text-xs text-gray-500 mb-0 font-medium">{t("topSelling.totalSold")} : {bestSeller.totalQuantity}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto custom-scrollbar">
                                {topSelling.slice(1).map((item, index) => {
                                    const percent = (item.totalQuantity / maxQuantity) * 100;
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <div key={item.dishId} className="flex items-center justify-between group">
                                            <h6 className="text-sm font-semibold text-gray-700 mb-0 w-1/2 truncate pr-2 group-hover:text-gray-900 transition-colors">
                                                <span className="text-gray-400 mr-1">#{index + 2}</span>
                                                {item.dishName}
                                            </h6>
                                            <div className="flex items-center gap-3 w-1/2">
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.totalQuantity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </ALCard>
        </div>
    );
}