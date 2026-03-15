"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALInput } from "@/components/ui/al-input";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Button } from "@/components/ui/button";
import { assignmentFormSchema, type AssignmentFormValues } from "../types/schema";
import {
  useShiftTemplatesQuery,
  useStaffForAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
} from "../hooks/use-shift-queries";
import type { ShiftAssignmentListDto } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: ShiftAssignmentListDto | null;
}

/** Convert ISO 8601 → <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") */
function toDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : "";
}

export function ShiftAssignmentForm({ open, onClose, editTarget }: Props) {
  const isEdit = !!editTarget;

  const { data: templates = [] } = useShiftTemplatesQuery({ isActive: true });
  const { data: staffList = [], isLoading: staffLoading } = useStaffForAssignmentQuery(open);

  const templateOptions = templates
    .filter((t) => t.isActive || (editTarget && t.shiftTemplateId === editTarget.shiftTemplateId))
    .map((t) => ({
      value: t.shiftTemplateId,
      label: `${t.templateName} (${t.defaultStartTime.slice(0, 5)} – ${t.defaultEndTime.slice(0, 5)})`,
    }));

  const staffOptions = staffList.map((s) => ({
    value: s.accountId,
    label: `${s.fullName} · ${s.roleName}`,
  }));

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      shiftTemplateId: 0, staffId: 0, workDate: "",
      plannedStartAt: "", plannedEndAt: "", notes: "",
    },
  });

  const shiftTemplateId = watch("shiftTemplateId");
  const staffId = watch("staffId");

  const create = useCreateAssignmentMutation();
  const update = useUpdateAssignmentMutation();
  const isPending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset({
        shiftTemplateId: editTarget.shiftTemplateId,
        staffId: editTarget.staffId,
        workDate: editTarget.workDate,
        plannedStartAt: toDatetimeLocal(editTarget.plannedStartAt),
        plannedEndAt: toDatetimeLocal(editTarget.plannedEndAt),
        notes: editTarget.notes ?? "",
      });
    } else {
      reset({ shiftTemplateId: 0, staffId: 0, workDate: "", plannedStartAt: "", plannedEndAt: "", notes: "" });
    }
  }, [open, editTarget, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && editTarget) {
      update.mutate(
        {
          id: editTarget.shiftAssignmentId,
          body: {
            plannedStartAt: values.plannedStartAt || null,
            plannedEndAt: values.plannedEndAt || null,
            notes: values.notes ?? null,
          },
        },
        { onSuccess: onClose }
      );
    } else {
      create.mutate(
        {
          shiftTemplateId: values.shiftTemplateId,
          staffId: values.staffId,
          workDate: values.workDate,
          plannedStartAt: values.plannedStartAt || null,
          plannedEndAt: values.plannedEndAt || null,
          notes: values.notes ?? null,
        },
        { onSuccess: onClose }
      );
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Assignment" : "New Shift Assignment"}
      width="540px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="assignment-form" variant="primary" className="w-full" isLoading={isPending}>
            {isEdit ? "Save Changes" : "Assign Staff"}
          </Button>
        </div>
      }
    >
      <form id="assignment-form" onSubmit={onSubmit} className="space-y-4 p-1">
        {/* Shift Template */}
        <div className="space-y-1 rounded-lg border border-slate-200 bg-[#FDFBF9] p-3">
          <ALCombobox
            title="Shift Template"
            required
            placeholder="Select shift template…"
            options={templateOptions}
            value={shiftTemplateId > 0 ? shiftTemplateId : undefined}
            onChange={(val) =>
              setValue("shiftTemplateId", typeof val === "number" ? val : 0, { shouldValidate: true })
            }
            disabled={isEdit}
          />
          {errors.shiftTemplateId && (
            <p className="text-xs text-destructive">{errors.shiftTemplateId.message}</p>
          )}
        </div>

        {/* Staff */}
        <div className="space-y-1 rounded-lg border border-slate-200 bg-[#FDFBF9] p-3">
          <ALCombobox
            title="Staff Member"
            required
            placeholder={staffLoading ? "Loading staff…" : "Select staff member…"}
            options={staffOptions}
            value={staffId > 0 ? staffId : undefined}
            onChange={(val) =>
              setValue("staffId", typeof val === "number" ? val : 0, { shouldValidate: true })
            }
            disabled={isEdit || staffLoading}
          />
          {errors.staffId && (
            <p className="text-xs text-destructive">{errors.staffId.message}</p>
          )}
        </div>

        {/* Work Date */}
        <div className="rounded-lg border border-slate-200 bg-[#FDFBF9] p-3">
          <ALDatePicker
            title="Work Date"
            required
            value={watch("workDate")}
            onChange={(val) => setValue("workDate", val, { shouldValidate: true })}
            error={errors.workDate?.message}
            readOnly={isEdit}
            placeholder="Select date"
          />
        </div>

        {/* Planned Start / End (optional override) */}
        <div className="rounded-lg border border-slate-200 bg-[#FDFBF9] p-3">
          <div className="grid grid-cols-2 gap-4">
            <ALInput
              title="Planned Start"
              type="datetime-local"
              {...register("plannedStartAt")}
              error={errors.plannedStartAt?.message}
            />
            <ALInput
              title="Planned End"
              type="datetime-local"
              {...register("plannedEndAt")}
              error={errors.plannedEndAt?.message}
            />
          </div>
          <p className="mt-2 text-xs text-[#1A3A52]/65">
            Leave planned times empty to use the template defaults.
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-1 rounded-lg border border-slate-200 bg-[#FDFBF9] p-3">
          <label className="text-sm font-medium text-[#1A3A52]">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/50 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            placeholder="Optional notes…"
          />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
      </form>
    </Dialog>
  );
}
