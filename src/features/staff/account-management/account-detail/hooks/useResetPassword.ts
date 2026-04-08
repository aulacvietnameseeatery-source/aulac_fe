import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import { toast } from "sonner";

/**
 * Mutation hook for resetting a staff account password.
 * POST /api/account/{id}/reset-password
 */
export function useResetPassword(
  accountId: number | null,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const t = useTranslations("Account.Detail.notifications");

  return useMutation<void, Error, void>({
    mutationFn: () => {
      if (!accountId) throw new Error("Account ID is required");
      return staffAccountService.resetStaffPassword(accountId);
    },

    onSuccess: () => {
      toast.success(t("resetPasswordSuccess"), {
        description: t("resetPasswordSuccessDesc"),
      });
      callbacks?.onSuccess?.();
    },

    onError: (error) => {
      toast.error(t("resetPasswordError"), {
        description: t("resetPasswordErrorDesc", { message: error.message || "An unexpected error occurred." }),
      });
      callbacks?.onError?.(error);
    },
  });
}
