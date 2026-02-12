import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import type { AccountDetail, UpdateAccountRequest } from "../types/account-detail.types";
import { ACCOUNT_DETAIL_QUERY_KEY } from "./useAccountDetail";
import { toast } from "sonner";

/**
 * Mutation hook for updating an existing staff account.
 * PUT /api/account/{id}
 * Shows toast on success/failure. Invalidates both list & detail cache.
 */
export function useUpdateAccount(
  accountId: number | null,
  callbacks?: {
    onSuccess?: (data: AccountDetail) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation<AccountDetail, Error, UpdateAccountRequest>({
    mutationFn: (data) => {
      if (!accountId) throw new Error("Account ID is required");
      return staffAccountService.updateStaffAccount(accountId, data);
    },

    onSuccess: (data) => {
      toast.success("Account updated successfully", {
        description: `"${data.fullName}" has been updated.`,
      });
      // Invalidate both list and the specific detail
      queryClient.invalidateQueries({ queryKey: ["staff-accounts"] });
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_DETAIL_QUERY_KEY, accountId] });
      callbacks?.onSuccess?.(data);
    },

    onError: (error) => {
      toast.error("Failed to update account", {
        description: error.message || "An unexpected error occurred.",
      });
      callbacks?.onError?.(error);
    },
  });
}
