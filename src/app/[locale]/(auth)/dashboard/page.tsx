// src/app/(dashboard)/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { DashboardHeader } from "@/features/staff/dashboard/component/dashboard-header";
import { DashboardSummaryCards } from "@/features/staff/dashboard/component/dashboard-summary-cards";
import { DashboardChartsRow1 } from "@/features/staff/dashboard/component/dashboard-charts-row1";
import { DashboardChartsRow2 } from "@/features/staff/dashboard/component/dashboard-charts-row2";
import { DashboardActivityRow } from "@/features/staff/dashboard/component/dashboard-activity-row";
import { DevTestingArea } from "@/features/staff/dashboard/component/dev-testing-area";

import { useDashboard } from "@/features/staff/dashboard/hooks/use-dashboard";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
    const t = useTranslations("dashboard.common");
    const { userInfo, isAuthenticated } = useAuth();
    const { data, isLoading, actions } = useDashboard();

    const mockActiveOrders: any[] = [];

    if (!isAuthenticated || !userInfo) {
        return <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">{t("loadingDashboard")}</div>;
    }

    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6">

            <DashboardHeader
                onRefresh={actions.refresh}
                isLoading={isLoading}
            />

            <DashboardSummaryCards
                summary={data.summary}
                isLoading={isLoading}
            />

            <DashboardChartsRow1
                revenueData={data.revenueData}
                topSelling={data.topSelling}
                summary={data.summary}
                isLoading={isLoading}
            />

            <DashboardChartsRow2
                statistics={data.statistics}
                activeOrders={[]}
                topSpenders={data.topSpenders}
                isLoading={isLoading}
            />

            <DashboardActivityRow
                reservations={data.reservations}
                tables={data.tables}
                notifications={data.notifications}
                isLoading={isLoading}
            />

            <hr className="my-8 border-gray-300 border-dashed" />

            <DevTestingArea userInfo={userInfo} />
        </div>
    );
}