import { z } from "zod";

// ─── Template Form ────────────────────────────────────────────────────────────

export const shiftTemplateFormSchema = z
  .object({
    templateName: z.string().trim().min(1, "Template name is required"),
    defaultStartTime: z.string().min(1, "Default start time is required"),
    defaultEndTime: z.string().min(1, "Default end time is required"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.defaultStartTime < data.defaultEndTime, {
    message: "Default start time must be before default end time",
    path: ["defaultEndTime"],
  });

export type ShiftTemplateFormValues = z.input<typeof shiftTemplateFormSchema>;

// ─── Assignment Form ──────────────────────────────────────────────────────────

export const assignmentFormSchema = z
  .object({
    shiftTemplateId: z.number({ message: "Shift template is required" }).min(1, "Shift template is required"),
    staffId: z.number({ message: "Staff member is required" }).min(1, "Staff member is required"),
    workDate: z.string().min(1, "Work date is required"),
    plannedStartAt: z.string().optional().nullable(),
    plannedEndAt: z.string().optional().nullable(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
  })
  .refine(
    (data) => {
      const hasStart = !!data.plannedStartAt;
      const hasEnd = !!data.plannedEndAt;
      return (hasStart && hasEnd) || (!hasStart && !hasEnd);
    },
    {
      message: "Set both planned start and planned end, or leave both empty",
      path: ["plannedEndAt"],
    }
  )
  .refine(
    (data) => {
      if (data.plannedStartAt && data.plannedEndAt) {
        return data.plannedStartAt < data.plannedEndAt;
      }
      return true;
    },
    {
      message: "Start time must be before end time",
      path: ["plannedEndAt"],
    }
  );

export type AssignmentFormValues = z.input<typeof assignmentFormSchema>;

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
      if (data.actualCheckOutAt && !data.actualCheckInAt) return false;
      return true;
    },
    {
      message: "Cannot set check-out without a check-in time",
      path: ["actualCheckOutAt"],
    }
  );

export type AttendanceAdjustmentFormValues = z.input<typeof attendanceAdjustmentSchema>;

// Deprecated alias kept so existing imports compile
/** @deprecated Use assignmentFormSchema instead */
export const scheduleFormSchema = assignmentFormSchema;
/** @deprecated */
export type ScheduleFormValues = AssignmentFormValues;
