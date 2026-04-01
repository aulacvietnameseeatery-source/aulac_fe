"use client";

import React from "react";
import { DollarSign, ShoppingBag, Receipt, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummaryDto } from "../types/dashboard-types";
import { useTranslations } from "next-intl";

interface DashboardSummaryCardsProps {
    summary: DashboardSummaryDto | null;
    isLoading: boolean;
}

export function DashboardSummaryCards({ summary, isLoading }: DashboardSummaryCardsProps) {
    const t = useTranslations("dashboard.summary");

    if (isLoading || !summary) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-3/4 bg-gray-200 rounded mt-2 mb-2"></div>
                            <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: t("totalRevenue"),
            value: `${summary.totalSales.value.toLocaleString()} CHF`,
            trend: summary.totalSales.trend,
            isUp: summary.totalSales.isUp,
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100"
        },
        {
            title: t("totalOrders"),
            value: summary.totalOrders.value.toLocaleString(),
            trend: summary.totalOrders.trend,
            isUp: summary.totalOrders.isUp,
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: t("avgOrderValue"),
            value: `${summary.averageOrderValue.value.toLocaleString()} CHF`,
            trend: summary.averageOrderValue.trend,
            isUp: summary.averageOrderValue.isUp,
            icon: Receipt,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: t("totalReservations"),
            value: summary.totalReservations.value.toLocaleString(),
            trend: summary.totalReservations.trend,
            isUp: summary.totalReservations.isUp,
            icon: CalendarDays,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.isUp ? TrendingUp : TrendingDown;
                const trendColor = card.isUp ? "text-emerald-500" : "text-rose-500";

                return (
                    <Card key={index} className="border-gray-100/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${card.bgColor}`}>
                                <Icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800">
                                {card.value}
                            </div>
                            <div className="flex items-center mt-1">
                                <span className={`flex items-center text-xs font-medium ${trendColor}`}>
                                    <TrendIcon className="w-3 h-3 mr-1" />
                                    {card.trend}%
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {t("vsLastPeriod")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}