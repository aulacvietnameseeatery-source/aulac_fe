"use client";

// Live on-duty board for managers — /dashboard/shifts/live
// TODO Phase 5: implement summary cards + live table with polling

export function ShiftLive() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Live On-Duty Board</h1>
        <p className="text-sm text-muted-foreground">
          Real-time view of today&apos;s shift attendance.
        </p>
      </div>
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Live board — coming soon
      </div>
    </div>
  );
}
