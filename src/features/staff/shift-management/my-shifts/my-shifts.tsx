"use client";

// Staff self-service — /dashboard/my-shifts
// TODO Phase 4: implement check-in card + shifts history list

export function MyShifts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Shifts</h1>
        <p className="text-sm text-muted-foreground">
          View your assigned shifts and check in or check out.
        </p>
      </div>
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        My shifts — coming soon
      </div>
    </div>
  );
}
