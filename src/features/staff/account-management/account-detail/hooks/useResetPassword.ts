import { useMutation } from "@tanstack/react-query";
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
  return useMutation<void, Error, void>({
    mutationFn: () => {
      if (!accountId) throw new Error("Account ID is required");
      return staffAccountService.resetStaffPassword(accountId);
    },

    onSuccess: () => {
      toast.success("Password reset successfully", {
        description: "A new temporary password has been sent to the user's email.",
      });
      callbacks?.onSuccess?.();
    },

    onError: (error) => {
      toast.error("Failed to reset password", {
        description: error.message || "An unexpected error occurred.",
      });
      callbacks?.onError?.(error);
    },
  });
}
