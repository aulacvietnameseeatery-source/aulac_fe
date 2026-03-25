"use client";
import React from "react";
import {ReportHeader} from "@/features/staff/report-management/shared/components/report-header";
import {ReportTabs} from "@/features/staff/report-management/shared/components/report-tabs";
import {AuditTimeline} from "@/features/staff/report-management/audit/components/audit-timeline";

export default function AuditReportPage() {
    return (
        <div className="w-full min-h-screen pb-10 bg-[#FDFBF9] px-4 md:px-6 py-6">
            <ReportHeader onRefresh={() => console.log('Refreshed Logs')} />
            <ReportTabs activeTab="Audit Logs" />
            <AuditTimeline />
        </div>
    );
}