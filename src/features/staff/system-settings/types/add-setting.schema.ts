import { z } from "zod";
import { SettingValueType } from "./system-setting.types";

export const addSettingSchema = z.object({
    key: z.string().trim().min(1, "Key is required"),
    settingName: z.string().trim().optional(),
    valueType: z.enum(['STRING', 'INT', 'DECIMAL', 'BOOL', 'JSON'] as const),
    value: z.string().min(1, "Value is required"),
    valueBool: z.boolean().default(false),
    description: z.string().trim().optional(),
    isSensitive: z.boolean().default(false),
});

export type AddSettingFormValues = z.input<typeof addSettingSchema>;
