"use client";
import React from "react";
import {useCustomerReport} from "@/features/staff/report-management/customer/hooks/use-customer-report";
import {ReportTabs} from "@/features/staff/report-management/shared/components/report-tabs";
import {ReportHeader} from "@/features/staff/report-management/shared/components/report-header";
import {CustomerFilter} from "@/features/staff/report-management/customer/components/customer-filter";
import {CustomerTable} from "@/features/staff/report-management/customer/components/customer-table";

export default function CustomerReportPage() {
    const { data, isLoading, refresh } = useCustomerReport();
    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6 py-6">
            <ReportHeader onRefresh={refresh} />
            <ReportTabs activeTab="Customer Report" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <CustomerFilter />
                <CustomerTable data={data} isLoading={isLoading} />
            </div>
        </div>
    );
}