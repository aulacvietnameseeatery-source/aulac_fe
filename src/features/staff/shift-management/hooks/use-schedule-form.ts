import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleFormSchema, type ScheduleFormValues } from "../types/schema";

export function useScheduleForm(defaultValues?: Partial<ScheduleFormValues>) {
  return useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    mode: "onBlur",
    defaultValues: {
      businessDate: "",
      shiftTypeLvId: 0,
      plannedStartAt: "",
      plannedEndAt: "",
      notes: "",
      ...defaultValues,
    },
  });
}
