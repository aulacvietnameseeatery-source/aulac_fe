"use client";

import React from "react";
import { DollarSign, ShoppingBag, Receipt, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardSummaryDto } from "../types/dashboard-types";
import { useTranslations, useFormatter } from "next-intl";
import {ALCard} from "@/components/ui/al-card";

interface DashboardSummaryCardsProps {
    summary: DashboardSummaryDto | null;
    isLoading: boolean;
}

export function DashboardSummaryCards({ summary, isLoading }: DashboardSummaryCardsProps) {
    const t = useTranslations("dashboard.summary");
    const format = useFormatter();

    const formatCurrency = (value: number) => {
        return format.number(value, { style: 'currency', currency: 'CHF' });
    };

    if (isLoading || !summary) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <ALCard key={i} variant="default" elevation="sm" padding="md" radius="xl" className="animate-pulse">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-100 rounded-xl"></div>
                        </div>
                        <div className="mt-2">
                            <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
                        </div>
                    </ALCard>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: t("totalRevenue"),
            value: formatCurrency(summary.totalSales.value),
            trend: summary.totalSales.trend,
            isUp: summary.totalSales.isUp,
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100"
        },
        {
            title: t("totalOrders"),
            value: format.number(summary.totalOrders.value),
            trend: summary.totalOrders.trend,
            isUp: summary.totalOrders.isUp,
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: t("avgOrderValue"),
            value: formatCurrency(summary.averageOrderValue.value),
            trend: summary.averageOrderValue.trend,
            isUp: summary.averageOrderValue.isUp,
            icon: Receipt,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: t("totalReservations"),
            value: format.number(summary.totalReservations.value),
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
                    <ALCard
                        key={index}
                        variant="default"
                        elevation="sm"
                        padding="md"
                        radius="xl"
                        hoverEffect="lift"
                        className="flex flex-col shadow-sm border-gray-100/50"
                    >
                        <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <h3 className="text-sm font-medium text-muted-foreground m-0">
                                {card.title}
                            </h3>
                            <div className={`p-2 rounded-xl ${card.bgColor}`}>
                                <Icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>
                        <div className="mt-1">
                            <div className="text-2xl font-bold text-gray-800 tracking-tight">
                                {card.value}
                            </div>
                            <div className="flex items-center mt-2">
                                <span className={`flex items-center text-xs font-bold ${trendColor}`}>
                                    <TrendIcon className="w-3 h-3 mr-1 stroke-[2.5]" />
                                    {card.trend}%
                                </span>
                                <span className="text-xs text-muted-foreground ml-2 font-medium">
                                    {t("vsLastPeriod")}
                                </span>
                            </div>
                        </div>
                    </ALCard>
                );
            })}
        </div>
    );
}