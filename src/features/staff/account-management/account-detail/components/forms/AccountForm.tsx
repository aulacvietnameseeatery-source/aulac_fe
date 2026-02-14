"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Phone, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox, type ALComboboxOption } from "@/components/ui/al-combobox";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormValues,
  type UpdateAccountFormValues,
} from "../../schemas/account.schema";
import type { AccountDetail, AccountDialogMode } from "../../types/account-detail.types";
import type { Role } from "../../../account-list/types/staff-account.types";
import { Button } from "@/components/ui/button";

// ============================================================
// Types
// ============================================================

type FormValues = CreateAccountFormValues | UpdateAccountFormValues;

interface AccountFormProps {
  mode: Extract<AccountDialogMode, "create" | "edit">;
  account?: AccountDetail | null; // Pre-fill for edit mode
  roles: Role[];
  isSubmitting: boolean;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

// ============================================================
// Component
// ============================================================

export const AccountForm = ({
  mode,
  account,
  roles,
  isSubmitting,
  onSubmit,
  onCancel,
}: AccountFormProps) => {
  const isCreate = mode === "create";
  const tForm = useTranslations(isCreate ? "Account.Create.form" : "Account.Edit.form");
  const tValidation = useTranslations("Account.Validation");
  const schema = isCreate ? createAccountSchema(tValidation) : updateAccountSchema(tValidation);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? { email: "", fullName: "", phone: "", roleId: undefined as unknown as number }
      : {
        email: account?.email ?? "",
        fullName: account?.fullName ?? "",
        phone: account?.phone ?? "",
        roleId: account?.role?.roleId ?? undefined,
      },
  });

  // Re-populate form when account data loads (edit mode)
  useEffect(() => {
    if (!isCreate && account) {
      reset({
        email: account.email ?? "",
        fullName: account.fullName ?? "",
        phone: account.phone ?? "",
        roleId: account.role?.roleId ?? undefined,
      });
    }
  }, [account, isCreate, reset]);

  // Map roles to ALComboboxOption
  const roleOptions: ALComboboxOption[] = roles.map((r) => ({
    label: r.roleName,
    value: r.roleId,
  }));

  return (

    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <ALInput
          title={tForm("fullName.label")}
          required={isCreate}
          error={errors.fullName?.message as string | undefined}
          placeholder={tForm("fullName.placeholder")}
          iconStart={<User className="h-4 w-4" />}
          {...register("fullName")}
        />

        {/* Email */}
        <ALInput
          title={tForm("email.label")}
          required={isCreate}
          error={errors.email?.message as string | undefined}
          type="email"
          placeholder={tForm("email.placeholder")}
          iconStart={<Mail className="h-4 w-4" />}
          {...register("email")}
        />

        {/* Phone */}
        <ALInput
          title={tForm("phone.label")}
          error={errors.phone?.message as string | undefined}
          placeholder={tForm("phone.placeholder")}
          iconStart={<Phone className="h-4 w-4" />}
          {...register("phone")}
        />

        {/* Role */}
        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <ALCombobox
              title={tForm("role.label")}
              required={isCreate}
              error={(errors as Record<string, { message?: string }>).roleId?.message}
              options={roleOptions}
              value={field.value ?? ""}
              onChange={(val) => field.onChange(Number(val))}
              placeholder={tForm("role.placeholder")}
              iconStart={<Shield className="h-4 w-4" />}
              searchable
              clearable={!isCreate}
            />
          )}
        />

        {/* Info banner for create */}
        {isCreate && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            {tForm("note")}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-gray-100">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="ghost"
          >
            {tForm("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {tForm("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};
