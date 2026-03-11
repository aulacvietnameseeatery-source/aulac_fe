import { z } from "zod";

// ─── Schedule Form ────────────────────────────────────────────────────────────

export const scheduleFormSchema = z
  .object({
    businessDate: z.string().min(1, "Business date is required"),
    shiftTypeLvId: z.number().min(1, "Shift type is required"),
    plannedStartAt: z.string().min(1, "Start time is required"),
    plannedEndAt: z.string().min(1, "End time is required"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
  })
  .refine((data) => data.plannedStartAt < data.plannedEndAt, {
    message: "Start time must be before end time",
    path: ["plannedEndAt"],
  });

export type ScheduleFormValues = z.input<typeof scheduleFormSchema>;

// ─── Attendance Adjustment Form ───────────────────────────────────────────────

export const attendanceAdjustmentSchema = z
  .object({
    actualCheckInAt: z.string().optional().nullable(),
    actualCheckOutAt: z.string().optional().nullable(),
    adjustmentReason: z
      .string()
      .trim()
      .min(1, "Reason is required")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      if (data.actualCheckInAt && data.actualCheckOutAt) {
        return data.actualCheckInAt < data.actualCheckOutAt;
      }
      return true;
    },
    {
      message: "Check-out must be after check-in",
      path: ["actualCheckOutAt"],
    }
  )
  .refine(
    (data) => {
      // Cannot set checkout without checkin
      if (data.actualCheckOutAt && !data.actualCheckInAt) return false;
      return true;
    },
    {
      message: "Cannot set check-out without a check-in time",
      path: ["actualCheckOutAt"],
    }
  );

export type AttendanceAdjustmentFormValues = z.input<typeof attendanceAdjustmentSchema>;
