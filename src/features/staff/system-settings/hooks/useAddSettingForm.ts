import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSettingSchema, AddSettingFormValues } from "../types/add-setting.schema";

export function useAddSettingForm(defaultValues?: Partial<AddSettingFormValues>) {
    return useForm<AddSettingFormValues>({
        resolver: zodResolver(addSettingSchema),
        mode: "onBlur",
        defaultValues: {
            key: "",
            settingName: "",
            valueType: "STRING",
            value: "",
            valueBool: false,
            description: "",
            isSensitive: false,
            ...defaultValues,
        },
    });
}
