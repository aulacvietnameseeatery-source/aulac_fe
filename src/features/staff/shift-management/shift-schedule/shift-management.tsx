"use client";

import { ShiftScheduleList } from "../components/shift-schedule-list";

// Orchestrator for /dashboard/shifts — manager schedule view
export function ShiftManagement() {
  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
        <ShiftScheduleList />
    </div>
  );
}
