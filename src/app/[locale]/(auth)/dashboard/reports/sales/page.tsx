"use client";
import React from "react";
import {ReportHeader} from "@/features/staff/report-management/shared/components/report-header";
import {ReportTabs} from "@/features/staff/report-management/shared/components/report-tabs";
import {useSalesReport} from "@/features/staff/report-management/sales/hooks/use-sales-report";
import {SalesTable} from "@/features/staff/report-management/sales/components/sales-table";
import {SalesFilter} from "@/features/staff/report-management/sales/components/sales-filter";
export default function SalesReportPage() {
    const { data, isLoading, refresh } = useSalesReport();
    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6 py-6">
            <ReportHeader onRefresh={refresh} />
            <ReportTabs activeTab="Sales Report" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <SalesFilter />
                <SalesTable data={data} isLoading={isLoading} />
            </div>
        </div>
    );
}