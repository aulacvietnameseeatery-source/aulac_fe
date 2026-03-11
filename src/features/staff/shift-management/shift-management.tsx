"use client";

import { ShiftScheduleList } from "./components/shift-schedule-list";

// Orchestrator for /dashboard/shifts — manager schedule view
export function ShiftManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shift Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, publish, and manage shift schedules and staff assignments.
        </p>
      </div>
      <ShiftScheduleList />
    </div>
  );
}
