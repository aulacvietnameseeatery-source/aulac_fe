"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ReportHeader } from "@/features/staff/report-management/shared/components/report-header";
import { ReportTabs } from "@/features/staff/report-management/shared/components/report-tabs";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    let activeTab = "Earning Report";
    if (pathname.includes("/reports/audit")) {
        activeTab = "Audit Logs";
    } else if (pathname.includes("/reports/customer")) {
        activeTab = "Customer Report";
    } else if (pathname.includes("/reports/sales")) {
        activeTab = "Sales Report";
    } else if (pathname.includes("/reports/order")) {
        activeTab = "Order Report";
    }

    const handleGlobalRefresh = () => {
        window.location.reload();
    };

    return (
        <ProtectedRoute permission={Permissions.ViewInventoryReport}>
            <div className="w-full min-h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <ReportHeader onRefresh={handleGlobalRefresh} />

                <ReportTabs activeTab={activeTab} />

                <div className="flex-1 w-full flex flex-col">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}