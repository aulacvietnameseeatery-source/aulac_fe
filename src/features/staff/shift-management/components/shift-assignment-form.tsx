"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("ShiftManagement.AssignmentForm");
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
      title={isEdit ? t("editTitle") : t("createTitle")}
      width="540px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="assignment-form" variant="primary" className="w-full" isLoading={isPending}>
            {isEdit ? t("saveChanges") : t("assignStaff")}
          </Button>
        </div>
      }
    >
      <form id="assignment-form" onSubmit={onSubmit} className="space-y-4 p-1">
        {/* Shift Template */}
        <ALCombobox
          title={t("fields.shiftTemplate")}
          required
          placeholder={t("placeholders.shiftTemplate")}
          options={templateOptions}
          value={shiftTemplateId > 0 ? shiftTemplateId : undefined}
          onChange={(val) =>
            setValue("shiftTemplateId", typeof val === "number" ? val : 0, { shouldValidate: true })
          }
          disabled={isEdit}
          error={errors.shiftTemplateId?.message}
        />

        {/* Staff */}
        <ALCombobox
          title={t("fields.staffMember")}
          required
          placeholder={staffLoading ? t("placeholders.loadingStaff") : t("placeholders.staffMember")}
          options={staffOptions}
          value={staffId > 0 ? staffId : undefined}
          onChange={(val) =>
            setValue("staffId", typeof val === "number" ? val : 0, { shouldValidate: true })
          }
          disabled={isEdit || staffLoading}
          error={errors.staffId?.message}
        />

        {/* Work Date */}
        <ALDatePicker
          title={t("fields.workDate")}
          required
          value={watch("workDate")}
          onChange={(val) => setValue("workDate", val, { shouldValidate: true })}
          error={errors.workDate?.message}
          readOnly={isEdit}
          placeholder={t("placeholders.workDate")}
        />

        {/* Planned Start / End (optional override) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ALInput
            title={t("fields.plannedStart")}
            type="datetime-local"
            {...register("plannedStartAt")}
            error={errors.plannedStartAt?.message}
          />
          <ALInput
            title={t("fields.plannedEnd")}
            type="datetime-local"
            {...register("plannedEndAt")}
            error={errors.plannedEndAt?.message}
          />
        </div>
        <p className="text-xs text-[#1A3A52]/65">{t("plannedHint")}</p>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#1A3A52]">{t("fields.notes")}</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/50 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            placeholder={t("placeholders.notes")}
          />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
      </form>
    </Dialog>
  );
}
