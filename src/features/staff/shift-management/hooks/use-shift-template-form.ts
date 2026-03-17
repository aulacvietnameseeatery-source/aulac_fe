import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  shiftTemplateFormSchema,
  type ShiftTemplateFormValues,
} from "../types/schema";

export function useShiftTemplateForm(defaultValues?: Partial<ShiftTemplateFormValues>) {
  return useForm<ShiftTemplateFormValues>({
    resolver: zodResolver(shiftTemplateFormSchema),
    mode: "onBlur",
    defaultValues: {
      templateName: "",
      defaultStartTime: "",
      defaultEndTime: "",
      description: "",
      isActive: true,
      ...defaultValues,
    },
  });
}
