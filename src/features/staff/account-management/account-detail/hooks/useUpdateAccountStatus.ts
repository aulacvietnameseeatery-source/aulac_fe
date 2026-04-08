import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import { ACCOUNT_DETAIL_QUERY_KEY } from "./useAccountDetail";
import { toast } from "sonner";
import type { UpdateAccountStatusRequest } from "../types/account-detail.types";

/**
 * Mutation hook for updating account status (ACTIVE / INACTIVE / LOCKED).
 * PUT /api/account/{id}/status
 */
export function useUpdateAccountStatus(
  accountId: number | null,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();
  const t = useTranslations("Account.Detail.notifications");

  return useMutation<void, Error, UpdateAccountStatusRequest>({
    mutationFn: (status) => {
      if (!accountId) throw new Error("Account ID is required");
      return staffAccountService.updateAccountStatus(accountId, status);
    },

    onSuccess: () => {
      toast.success(t("statusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["staff-accounts"] });
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_DETAIL_QUERY_KEY, accountId] });
      callbacks?.onSuccess?.();
    },

    onError: (error) => {
      toast.error(t("statusUpdateError"), {
        description: error.message || t("statusUpdateErrorDesc", { message: "An unexpected error occurred." }),
      });
      callbacks?.onError?.(error);
    },
  });
}
