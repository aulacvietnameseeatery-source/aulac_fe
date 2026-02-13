"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormValues,
  type UpdateAccountFormValues,
} from "../../schemas/account.schema";
import type { AccountDetail, AccountDialogMode } from "../../types/account-detail.types";
import type { Role } from "../../../account-list/types/staff-account.types";

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
// Field wrapper (label + error)
// ============================================================

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
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

  // Map roles to SelectOption
  const roleOptions: SelectOption[] = roles.map((r) => ({
    label: r.roleName,
    value: r.roleId,
  }));

  return (

    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <FieldGroup
          label={tForm("fullName.label")}
          required={isCreate}
          error={errors.fullName?.message as string | undefined}
        >
          <Input
            placeholder={tForm("fullName.placeholder")}
            {...register("fullName")}
            className={cn(errors.fullName && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200")}
          />
        </FieldGroup>

        {/* Email */}
        <FieldGroup
          label={tForm("email.label")}
          required={isCreate}
          error={errors.email?.message as string | undefined}
        >
          <Input
            type="email"
            placeholder={tForm("email.placeholder")}
            {...register("email")}
            className={cn(errors.email && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200")}
          />
        </FieldGroup>

        {/* Phone */}
        <FieldGroup
          label={tForm("phone.label")}
          error={errors.phone?.message as string | undefined}
        >
          <Input
            placeholder={tForm("phone.placeholder")}
            {...register("phone")}
            className={cn(errors.phone && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200")}
          />
        </FieldGroup>

        {/* Role */}
        <FieldGroup
          label={tForm("role.label")}
          required={isCreate}
          error={(errors as Record<string, { message?: string }>).roleId?.message}
        >
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                options={roleOptions}
                placeholder={tForm("role.placeholder")}
                onChange={(val) => field.onChange(Number(val))}
                className={cn(
                  (errors as Record<string, { message?: string }>).roleId &&
                  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200"
                )}
              />
            )}
          />
        </FieldGroup>

        {/* Info banner for create */}
        {isCreate && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            {tForm("note")}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {tForm("cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {tForm("submit")}
          </button>
        </div>
      </form>
    </div>
  );
};
