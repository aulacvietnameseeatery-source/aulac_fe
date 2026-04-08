import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import type { CreateAccountRequest, CreateAccountResponse } from "../types/account-detail.types";
import { toast } from "sonner";

/**
 * Mutation hook for creating a new staff account.
 * POST /api/account/create
 * Shows toast on success/failure. Invalidates account list cache.
 */
export function useCreateAccount(callbacks?: {
  onSuccess?: (data: CreateAccountResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const t = useTranslations("Account.Create.notifications");

  return useMutation<CreateAccountResponse, Error, CreateAccountRequest>({
    mutationFn: (data) => staffAccountService.createStaffAccount(data),

    onSuccess: (data) => {
      toast.success(t("success"), {
        description: t("successDescription", { username: data.username }),
      });
      // Invalidate account list so it refetches
      queryClient.invalidateQueries({ queryKey: ["staff-accounts"] });
      callbacks?.onSuccess?.(data);
    },

    onError: (error) => {
      toast.error(t("error"), {
        description: t("errorDescription", { message: error.message || "An unexpected error occurred." }),
      });
      callbacks?.onError?.(error);
    },
  });
}
