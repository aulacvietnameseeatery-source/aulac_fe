"use client";

import React from "react";
import { usePathname } from "next/navigation";
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

    return (
        <ProtectedRoute permission={Permissions.ViewInventoryReport}>
            <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
                <div className="shrink-0">
                    <ReportTabs activeTab={activeTab} />
                </div>

                <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}