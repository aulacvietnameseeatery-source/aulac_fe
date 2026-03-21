"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useShiftTemplateForm } from "../hooks/use-shift-template-form";
import {
  useCreateShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
} from "../hooks/use-shift-queries";
import type { ShiftTemplateDto } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: ShiftTemplateDto | null;
}

function toTimeInput(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function toApiTime(value: string): string {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

export function ShiftTemplateForm({ open, onClose, editTarget }: Props) {
  const t = useTranslations("shift.schedule.templateForm");
  const create = useCreateShiftTemplateMutation();
  const update = useUpdateShiftTemplateMutation();
  const isEdit = !!editTarget;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useShiftTemplateForm();

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset({
        templateName: editTarget.templateName,
        defaultStartTime: toTimeInput(editTarget.defaultStartTime),
        defaultEndTime: toTimeInput(editTarget.defaultEndTime),
        description: editTarget.description ?? "",
        isActive: editTarget.isActive,
      });
      return;
    }

    reset({
      templateName: "",
      defaultStartTime: "",
      defaultEndTime: "",
      description: "",
      isActive: true,
    });
  }, [open, editTarget, reset]);

  const isPending = create.isPending || update.isPending;

  const onSubmit = handleSubmit((values) => {
    const body = {
      templateName: values.templateName,
      defaultStartTime: toApiTime(values.defaultStartTime),
      defaultEndTime: toApiTime(values.defaultEndTime),
      description: values.description ?? null,
      isActive: values.isActive,
    };

    if (isEdit && editTarget) {
      update.mutate(
        { id: editTarget.shiftTemplateId, body },
        { onSuccess: onClose }
      );
      return;
    }

    create.mutate(body, { onSuccess: onClose });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      width="520px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="shift-template-form"
            variant="primary"
            className="w-full"
            isLoading={isPending}
          >
            {isEdit ? t("saveChanges") : t("create")}
          </Button>
        </div>
      }
    >
      <form id="shift-template-form" onSubmit={onSubmit} className="space-y-5 p-5">
        <ALInput
          title={t("templateName")}
          required
          {...register("templateName")}
          error={errors.templateName?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ALInput
            title={t("defaultStart")}
            required
            type="time"
            {...register("defaultStartTime")}
            error={errors.defaultStartTime?.message}
          />
          <ALInput
            title={t("defaultEnd")}
            required
            type="time"
            {...register("defaultEndTime")}
            error={errors.defaultEndTime?.message}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[#1A3A52]">{t("description")}</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/50 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            placeholder={t("descriptionPlaceholder")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9] px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-[#1A3A52]">{t("activeTemplate")}</p>
            <p className="text-xs text-[#1A3A52]/70">{t("activeTemplateHint")}</p>
          </div>
          <Switch
            checked={!!watch("isActive")}
            onChange={(checked: boolean) =>
              setValue("isActive", checked, { shouldValidate: true })
            }
          />
        </div>
      </form>
    </Dialog>
  );
}
