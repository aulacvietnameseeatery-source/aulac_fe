import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignmentFormSchema, type AssignmentFormValues } from "../types/schema";

/** @deprecated Use ShiftAssignmentForm directly; kept for backward-compat. */
export function useScheduleForm(defaultValues?: Partial<AssignmentFormValues>) {
  return useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    mode: "onBlur",
    defaultValues: {
      shiftTemplateId: 0,
      staffId: 0,
      workDate: "",
      plannedStartAt: "",
      plannedEndAt: "",
      notes: "",
      ...defaultValues,
    },
  });
}
