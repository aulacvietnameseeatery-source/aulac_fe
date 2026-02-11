// ============================================================
// Zod Schemas for Account Create & Update
// Matches API validation rules from AccountController docs
// ============================================================

import { z } from "zod";

// Vietnamese phone regex: (0|+84)[0-9]{9,10}
const vietnamesePhoneRegex = /^(0|\+84)\d{9,10}$/;

/**
 * Schema factory for POST /api/account/create
 */
export const createAccountSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .min(1, t("email.required"))
    .email(t("email.invalid"))
    .max(150, t("email.maxLength")),

  fullName: z
    .string()
    .min(2, t("fullName.minLength"))
    .max(150, t("fullName.maxLength")),

  phone: z
    .string()
    .regex(vietnamesePhoneRegex, t("phone.invalid"))
    .max(30, t("phone.maxLength"))
    .optional()
    .or(z.literal("")),

  roleId: z
    .number({ error: t("role.required") })
    .int()
    .min(1, t("role.invalid")),
});

export type CreateAccountFormValues = z.infer<ReturnType<typeof createAccountSchema>>;

/**
 * Schema factory for PUT /api/account/{id}
 * All fields optional — null = no change on backend
 */
export const updateAccountSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .email(t("email.invalid"))
    .max(150, t("email.maxLength"))
    .optional()
    .or(z.literal("")),

  fullName: z
    .string()
    .min(2, t("fullName.minLength"))
    .max(150, t("fullName.maxLength"))
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(vietnamesePhoneRegex, t("phone.invalid"))
    .max(30, t("phone.maxLength"))
    .optional()
    .or(z.literal("")),

  roleId: z
    .number()
    .int()
    .min(1, t("role.invalid"))
    .optional()
    .nullable(),
});

export type UpdateAccountFormValues = z.infer<ReturnType<typeof updateAccountSchema>>;
