"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { useAdjustAttendanceMutation } from "../hooks/use-shift-queries";
import { attendanceAdjustmentSchema, type AttendanceAdjustmentFormValues } from "../types/schema";
import type { AttendanceRecordDto } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  attendanceRecord: AttendanceRecordDto;
  staffName?: string;
}

/** Convert ISO → "YYYY-MM-DDTHH:mm" for datetime-local input */
function toLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    // Trim seconds / millis
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export function AttendanceAdjustmentDialog({ open, onClose, attendanceRecord, staffName }: Props) {
  const adjust = useAdjustAttendanceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceAdjustmentFormValues>({
    resolver: zodResolver(attendanceAdjustmentSchema),
    mode: "onBlur",
    defaultValues: {
      actualCheckInAt: toLocal(attendanceRecord.actualCheckInAt),
      actualCheckOutAt: toLocal(attendanceRecord.actualCheckOutAt),
      adjustmentReason: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      actualCheckInAt: toLocal(attendanceRecord.actualCheckInAt),
      actualCheckOutAt: toLocal(attendanceRecord.actualCheckOutAt),
      adjustmentReason: "",
    });
  }, [open, attendanceRecord, reset]);

  const onSubmit = handleSubmit((values) => {
    adjust.mutate(
      {
        attendanceId: attendanceRecord.attendanceId,
        body: {
          actualCheckInAt: values.actualCheckInAt || null,
          actualCheckOutAt: values.actualCheckOutAt || null,
          adjustmentReason: values.adjustmentReason,
        },
      },
      { onSuccess: onClose }
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Adjust Attendance"
      width="480px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={adjust.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="attendance-adj-form"
            variant="primary"
            className="w-full"
            isLoading={adjust.isPending}
          >
            Save Adjustment
          </Button>
        </div>
      }
    >
      <form id="attendance-adj-form" onSubmit={onSubmit} className="space-y-4 p-1">
        {staffName && (
          <div className="rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] px-3 py-2 text-sm">
            <span className="text-[#1A3A52]/70">Staff: </span>
            <span className="font-medium">{staffName}</span>
          </div>
        )}

        <div className="rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] p-3">
          <div className="grid grid-cols-2 gap-4">
            <ALInput
              title="Actual Check-in"
              type="datetime-local"
              {...register("actualCheckInAt")}
              error={errors.actualCheckInAt?.message}
            />
            <ALInput
              title="Actual Check-out"
              type="datetime-local"
              {...register("actualCheckOutAt")}
              error={errors.actualCheckOutAt?.message}
            />
          </div>
        </div>

        <div className="space-y-1 rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] p-3">
          <label className="text-sm font-medium text-[#1A3A52]">
            Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            {...register("adjustmentReason")}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/50 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            placeholder="Explain why this attendance record is being adjusted…"
          />
          {errors.adjustmentReason && (
            <p className="text-xs text-destructive">{errors.adjustmentReason.message}</p>
          )}
        </div>

        {attendanceRecord.isManualAdjustment && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            This record has already been manually adjusted.
            {attendanceRecord.reviewedByName && (
              <span className="ml-1">Previous reviewer: {attendanceRecord.reviewedByName}.</span>
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
}
