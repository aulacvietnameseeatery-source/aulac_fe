"use client";
import React from "react";
import {AuditTimeline} from "@/features/staff/report-management/audit/components/audit-timeline";

export default function AuditReportPage() {
    return (
        <div className="w-full h-full flex flex-col">
            <AuditTimeline />
        </div>
    );
}