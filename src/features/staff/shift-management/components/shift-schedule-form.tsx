"use client";

// _OLD: ShiftScheduleForm was removed during the ShiftSchedule → ShiftAssignment refactor.
// _OLD: The ShiftScheduleList / scheduler concept was merged into ShiftAssignment.
// _OLD: Use ShiftAssignmentForm instead.

/** @deprecated ShiftSchedule has been removed. Use ShiftAssignmentForm instead. */
export function ShiftScheduleForm_DEPRECATED() {
  return null;
}

// Keep the named export under the old name so any remaining imports compile.
/** @deprecated */
export const ShiftScheduleForm = ShiftScheduleForm_DEPRECATED;
