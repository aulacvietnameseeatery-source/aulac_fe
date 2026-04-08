"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { useAccountDetail } from "../hooks/useAccountDetail";
import { useCreateAccount } from "../hooks/useCreateAccount";
import { useUpdateAccount } from "../hooks/useUpdateAccount";
import { useUpdateAccountStatus } from "../hooks/useUpdateAccountStatus";
import { useResetPassword } from "../hooks/useResetPassword";
import { useFilterOptions } from "../../account-list/hooks/useFilterOptions";
import { AccountDetailTabs } from "./AccountDetailTabs";
import { AccountProfileHeader } from "./AccountProfileHeader";
import { AccountForm } from "./forms/AccountForm";
import type {
  AccountDialogMode,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountStatusRequest,
} from "../types/account-detail.types";
import type { CreateAccountFormValues, UpdateAccountFormValues } from "../schemas/account.schema";
import type { AccountStatusCode } from "@/types/status-codes";

// ============================================================

interface AccountDialogProps {
  open: boolean;
  mode: AccountDialogMode;
  accountId: number | null;
  onClose: () => void;
  /** Called after successful create/update so the list can refresh */
  onSuccess?: () => void;
}

// ============================================================

export const AccountDialog = ({
  open,
  mode,
  accountId,
  onClose,
  onSuccess,
}: AccountDialogProps) => {
  // Internal mode — allows switching from view → edit without closing
  const [internalMode, setInternalMode] = useState<AccountDialogMode>(mode);

  // Sync internal mode when parent changes
  React.useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  // Fetch detail only when viewing/editing an existing account
  const needsDetail = (internalMode === "view" || internalMode === "edit") && !!accountId;
  const { data: account, isLoading: isLoadingDetail } = useAccountDetail(
    needsDetail ? accountId : null
  );

  // Roles for the form dropdowns
  const { roles } = useFilterOptions();

  // Mutations
  const createMutation = useCreateAccount({
    onSuccess: () => {
      onClose();
      onSuccess?.();
    },
  });

  const updateMutation = useUpdateAccount(accountId, {
    onSuccess: () => {
      setInternalMode("view"); // Return to view mode after successful update
      onSuccess?.();
    },
  });

  const statusMutation = useUpdateAccountStatus(accountId);

  const resetPasswordMutation = useResetPassword(accountId);

  // Translations
  const tDetail = useTranslations("Account.Detail");
  const tCreate = useTranslations("Account.Create");
  const tEdit = useTranslations("Account.Edit");

  // ---- Handlers ----

  const handleCreateSubmit = (data: CreateAccountFormValues | UpdateAccountFormValues) => {
    const payload: CreateAccountRequest = {
      email: data.email as string,
      fullName: data.fullName as string,
      phone: data.phone || undefined,
      roleId: data.roleId as number,
    };
    createMutation.mutate(payload);
  };

  const handleUpdateSubmit = (data: CreateAccountFormValues | UpdateAccountFormValues) => {
    const payload: UpdateAccountRequest = {
      email: data.email || null,
      fullName: data.fullName || null,
      phone: data.phone || null,
      roleId: data.roleId ?? null,
    };
    updateMutation.mutate(payload);
  };

  const handleStatusChange = (status: string) => {
    statusMutation.mutate(status as AccountStatusCode as UpdateAccountStatusRequest);
  };

  const handleResetPassword = () => {
    resetPasswordMutation.mutate();
  };

  const handleEditFromView = () => {
    setInternalMode("edit");
  };

  const handleCancelEdit = () => {
    if (mode === "view") {
      // If originally opened as view, go back to view
      setInternalMode("view");
    } else {
      onClose();
    }
  };

  // ---- Title ----

  const titleMap: Record<AccountDialogMode, string> = {
    view: tDetail("title"),
    create: tCreate("title"),
    edit: tEdit("title"),
  };

  // ---- Width ----

  const widthMap: Record<AccountDialogMode, string> = {
    view: "1080px",
    create: "640px",
    edit: "640px",
  };

  // ---- Content ----

  const renderContent = () => {
    // Loading state for view/edit
    if (needsDetail && isLoadingDetail) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">{tDetail("loadingAccount")}</p>
        </div>
      );
    }

    // View mode → header + tabs
    if (internalMode === "view") {
      if (!account) {
        return (
          <div className="py-12 text-center text-sm text-gray-400">
            {tDetail("accountNotFound")}
          </div>
        );
      }
      return (
        <div className="flex h-full flex-col overflow-hidden">
          <AccountProfileHeader
            account={account}
            onEdit={handleEditFromView}
            onResetPassword={handleResetPassword}
            onStatusChange={handleStatusChange}
          />
          <div className="flex flex-col flex-1 min-h-0 pt-2">
            <AccountDetailTabs account={account} />
          </div>
        </div>
      );
    }

    // Create / Edit mode → form
    return (
      <AccountForm
        mode={internalMode}
        account={internalMode === "edit" ? account : undefined}
        roles={roles}
        isSubmitting={internalMode === "create" ? createMutation.isPending : updateMutation.isPending}
        onSubmit={internalMode === "create" ? handleCreateSubmit : handleUpdateSubmit}
        onCancel={handleCancelEdit}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={titleMap[internalMode]}
      width={widthMap[internalMode]}
      height={internalMode === "view" ? "80vh" : undefined}
      bodyOverflowY={internalMode === "view" ? "hidden" : "auto"}
    >
      {renderContent()}
    </Dialog>
  );
};
