"use client";

import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ALInput } from "@/components/ui/al-input";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Button } from "@/components/ui/button";
import { LOOKUP_TYPE, useLookupCrud, LookupCombobox } from "@/features/lookup";
import { useScheduleForm } from "../hooks/use-schedule-form";
import {
  useCreateShiftScheduleMutation,
  useUpdateShiftScheduleMutation,
} from "../hooks/use-shift-queries";
import type { ShiftScheduleListDto } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: ShiftScheduleListDto | null;
}

/** Convert ISO 8601 → value accepted by <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") */
function toDatetimeLocal(iso: string): string {
  return iso ? iso.slice(0, 16) : "";
}

export function ShiftScheduleForm({ open, onClose, editTarget }: Props) {
  const shiftTypeLookup = useLookupCrud({
    typeId: LOOKUP_TYPE.ShiftType,
    queryKey: ["lookups", "shift-type"],
    entityLabel: "Shift Type",
    typeLabel: "Shift Type",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useScheduleForm();

  const shiftTypeLvId = watch("shiftTypeLvId");

  const create = useCreateShiftScheduleMutation();
  const update = useUpdateShiftScheduleMutation();

  const isEdit = !!editTarget;
  const isPending = create.isPending || update.isPending;

  // Populate form when opening in edit mode
  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      reset({
        businessDate: editTarget.businessDate,
        shiftTypeLvId: editTarget.shiftTypeLvId,
        plannedStartAt: toDatetimeLocal(editTarget.plannedStartAt),
        plannedEndAt: toDatetimeLocal(editTarget.plannedEndAt),
        notes: editTarget.notes ?? "",
      });
    } else {
      reset({
        businessDate: "",
        shiftTypeLvId: 0,
        plannedStartAt: "",
        plannedEndAt: "",
        notes: "",
      });
    }
  }, [open, editTarget, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && editTarget) {
      update.mutate(
        {
          id: editTarget.shiftScheduleId,
          body: {
            plannedStartAt: values.plannedStartAt,
            plannedEndAt: values.plannedEndAt,
            notes: values.notes ?? null,
          },
        },
        { onSuccess: onClose }
      );
    } else {
      create.mutate(
        {
          businessDate: values.businessDate,
          shiftTypeLvId: values.shiftTypeLvId,
          plannedStartAt: values.plannedStartAt,
          plannedEndAt: values.plannedEndAt,
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
      title={isEdit ? "Edit Shift Schedule" : "Create Shift Schedule"}
      width="540px"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="schedule-form"
            variant="primary"
            className="w-full"
            isLoading={isPending}
          >
            {isEdit ? "Save Changes" : "Create Schedule"}
          </Button>
        </div>
      }
    >
      <form id="schedule-form" onSubmit={onSubmit} className="space-y-4 p-1">
        {/* Business Date */}
        <ALDatePicker
          title="Business Date"
          required
          value={watch("businessDate")}
          onChange={(val) => setValue("businessDate", val, { shouldValidate: true })}
          error={errors.businessDate?.message}
          readOnly={isEdit}
          placeholder="Select business date"
        />

        {/* Shift Type — LookupCombobox (read-only when editing) */}
        <div className="space-y-1">
          <LookupCombobox
            lookup={shiftTypeLookup}
            title="Shift Type"
            required
            placeholder="Select shift type…"
            value={shiftTypeLvId > 0 ? shiftTypeLvId : undefined}
            onChange={(val) =>
              setValue("shiftTypeLvId", typeof val === "number" ? val : 0, {
                shouldValidate: true,
              })
            }
            disabled={isEdit}
          />
          {errors.shiftTypeLvId && (
            <p className="text-xs text-destructive">{errors.shiftTypeLvId.message}</p>
          )}
        </div>

        {/* Planned Start / End */}
        <div className="grid grid-cols-2 gap-4">
          <ALInput
            title="Planned Start"
            required
            type="datetime-local"
            {...register("plannedStartAt")}
            error={errors.plannedStartAt?.message}
          />
          <ALInput
            title="Planned End"
            required
            type="datetime-local"
            {...register("plannedEndAt")}
            error={errors.plannedEndAt?.message}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder="Optional notes…"
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </form>
    </Dialog>
  );
}
