"use client";
import React from "react";
import {useEarningReport} from "@/features/staff/report-management/earning/hooks/use-earning-report";
import {ReportHeader} from "@/features/staff/report-management/shared/components/report-header";
import {ReportTabs} from "@/features/staff/report-management/shared/components/report-tabs";
import {EarningFilter} from "@/features/staff/report-management/earning/components/earning-filter";
import {EarningTable} from "@/features/staff/report-management/earning/components/earning-table";

export default function EarningReportPage() {
    const { data, isLoading, refresh } = useEarningReport();

    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6 py-6">
            <ReportHeader onRefresh={refresh} />
            <ReportTabs activeTab="Earning Report"/>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <EarningFilter />
                <EarningTable data={data} isLoading={isLoading} />
            </div>
        </div>
    );
}