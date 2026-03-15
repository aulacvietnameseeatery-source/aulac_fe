"use client";

import { ShiftScheduleList } from "./components/shift-schedule-list";

// Orchestrator for /dashboard/shifts — manager schedule view
export function ShiftManagement() {
  return (
    <div className="space-y-6">
      
      <ShiftScheduleList />
    </div>
  );
}
