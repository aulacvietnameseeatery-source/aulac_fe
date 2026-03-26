"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { bulkCreateFormSchema, type BulkCreateFormValues } from "../types/schema";
import {
  useShiftTemplatesQuery,
  useStaffForAssignmentQuery,
  useBulkCreateAssignmentsMutation,
} from "../hooks/use-shift-queries";

export interface BulkAssignmentSelection {
  staffIds: number[];
  workDates: string[]; // yyyy-MM-dd[]
}

interface Props {
  open: boolean;
  onClose: () => void;
  selection: BulkAssignmentSelection | null;
}

export function BulkAssignmentDialog({ open, onClose, selection }: Props) {
  const t = useTranslations("shift.bulkAssignment");

  const { data: templates = [] } = useShiftTemplatesQuery({ isActive: true });
  const { data: staffList = [], isLoading: staffLoading } =
    useStaffForAssignmentQuery(open);

  const templateOptions = useMemo(
    () =>
      templates
        .filter((tpl) => tpl.isActive)
        .map((tpl) => ({
          value: tpl.shiftTemplateId,
          label: `${tpl.templateName} (${tpl.defaultStartTime.slice(0, 5)} – ${tpl.defaultEndTime.slice(0, 5)})`,
        })),
    [templates]
  );

  const staffOptions = useMemo(
    () =>
      staffList.map((s) => ({
        value: s.accountId,
        label: `${s.fullName} · ${s.roleName}`,
      })),
    [staffList]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BulkCreateFormValues>({
    resolver: zodResolver(bulkCreateFormSchema),
    defaultValues: {
      shiftTemplateId: 0,
      staffIds: [],
      workDates: [],
      plannedStartAt: "",
      plannedEndAt: "",
      notes: "",
      isDraft: true,
    },
  });

  const shiftTemplateId = watch("shiftTemplateId");
  const staffIds = watch("staffIds");

  // Sync selection into form when dialog opens
  useEffect(() => {
    if (!open || !selection) return;
    reset({
      shiftTemplateId: 0,
      staffIds: selection.staffIds,
      workDates: selection.workDates,
      plannedStartAt: "",
      plannedEndAt: "",
      notes: "",
      isDraft: true,
    });
  }, [open, selection, reset]);

  const bulkCreate = useBulkCreateAssignmentsMutation();

  const onSubmit = handleSubmit((values) => {
    bulkCreate.mutate(
      {
        shiftTemplateId: values.shiftTemplateId,
        staffIds: values.staffIds,
        workDate: values.workDates[0] ?? "",
        workDates: values.workDates,
        plannedStartAt: values.plannedStartAt || null,
        plannedEndAt: values.plannedEndAt || null,
        notes: values.notes ?? null,
        tags: values.tags ?? null,
        isDraft: values.isDraft ?? true,
      },
      { onSuccess: onClose }
    );
  });

  // Summary label
  const summaryLabel = selection
    ? t("summary", {
        staffCount: selection.staffIds.length,
        dateCount: selection.workDates.length,
      })
    : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      width="560px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={bulkCreate.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="bulk-assignment-form"
            variant="primary"
            className="w-full"
            isLoading={bulkCreate.isPending}
          >
            {t("confirm")}
          </Button>
        </div>
      }
    >
      <form
        id="bulk-assignment-form"
        onSubmit={onSubmit}
        className="space-y-4 p-5"
      >
        {/* Summary badge */}
        <div className="rounded-lg border border-[#D5BA98]/50 bg-[#FDFBF9] px-3 py-2 text-sm text-[#1A3A52]/80">
          {summaryLabel}
        </div>

        {/* Shift Template */}
        <ALCombobox
          title={t("fields.shiftTemplate")}
          required
          placeholder={t("placeholders.shiftTemplate")}
          options={templateOptions}
          value={shiftTemplateId > 0 ? shiftTemplateId : undefined}
          onChange={(val) =>
            setValue("shiftTemplateId", typeof val === "number" ? val : 0, {
              shouldValidate: true,
            })
          }
          error={errors.shiftTemplateId?.message}
        />

        {/* Staff (pre-filled, still editable) */}
        <ALCombobox
          title={t("fields.staffMembers")}
          required
          placeholder={
            staffLoading
              ? t("placeholders.loadingStaff")
              : t("placeholders.staffMembers")
          }
          options={staffOptions}
          value={staffIds}
          onChange={(val) => {
            const next = Array.isArray(val)
              ? val.map(Number)
              : val
                ? [Number(val)]
                : [];
            setValue("staffIds", next, { shouldValidate: true });
          }}
          multiple
          showSelectAll
          searchable
          clearable
          disabled={staffLoading}
          error={errors.staffIds?.message}
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
          <label className="text-sm font-medium text-[#1A3A52]">
            {t("fields.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/50 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            placeholder={t("placeholders.notes")}
          />
        </div>
      </form>
    </Dialog>
  );
}
