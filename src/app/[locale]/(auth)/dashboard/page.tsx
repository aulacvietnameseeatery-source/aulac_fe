// src/app/(dashboard)/dashboard/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { DashboardHeader } from "@/features/staff/dashboard/component/dashboard-header";
import { DashboardStats } from "@/features/staff/dashboard/component/dashboard-stats";
import { DashboardChartsRow1 } from "@/features/staff/dashboard/component/dashboard-charts-row1";
import { DashboardTrendingRow } from "@/features/staff/dashboard/component/dashboard-trending-row";
import { DashboardChartsRow2 } from "@/features/staff/dashboard/component/dashboard-charts-row2";
import { DashboardActivityRow } from "@/features/staff/dashboard/component/dashboard-activity-row";
import { DevTestingArea } from "@/features/staff/dashboard/component/dev-testing-area";

import { useDashboard } from "@/features/staff/dashboard/hooks/use-dashboard";

export default function DashboardPage() {
    const { userInfo, isAuthenticated } = useAuth();

    const { data, isLoading, actions } = useDashboard();

    if (!isAuthenticated || !userInfo) {
        return <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6">
            <DashboardHeader />

            <DashboardStats
                // summaryData={data.summary}
                // isLoading={isLoading}
            />

            <DashboardChartsRow1
                // revenueData={data.revenueData}
                // isLoading={isLoading}
            />

            <DashboardChartsRow2 />

            <DashboardTrendingRow
                // topSelling={data.topSelling}
                // isLoading={isLoading}
            />

            <DashboardActivityRow />

            <hr className="my-8 border-gray-300 border-dashed" />

            <DevTestingArea userInfo={userInfo} />
        </div>
    );
}