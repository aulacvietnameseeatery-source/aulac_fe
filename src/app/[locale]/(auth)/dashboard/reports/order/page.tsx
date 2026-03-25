"use client";
import React from "react";
import {useOrderReport} from "@/features/staff/report-management/order/hooks/use-order-report";
import {ReportHeader} from "@/features/staff/report-management/shared/components/report-header";
import {ReportTabs} from "@/features/staff/report-management/shared/components/report-tabs";
import {OrderFilter} from "@/features/staff/report-management/order/components/order-filter";
import {OrderTable} from "@/features/staff/report-management/order/components/order-table";
export default function OrderReportPage() {
    const { data, isLoading, refresh } = useOrderReport();

    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6 py-6">
            <ReportHeader onRefresh={refresh} />

            <ReportTabs activeTab="Order Report"  />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <OrderFilter />
                <OrderTable data={data} isLoading={isLoading} />
            </div>
        </div>
    );
}