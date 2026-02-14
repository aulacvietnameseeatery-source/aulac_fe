import { useQuery } from "@tanstack/react-query";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import type { AccountDetail } from "../types/account-detail.types";

export const ACCOUNT_DETAIL_QUERY_KEY = "account-detail";

/**
 * Fetches a single account's detail by ID.
 * Enabled only when accountId is provided (> 0).
 */
export function useAccountDetail(accountId: number | null) {
  return useQuery<AccountDetail | null>({
    queryKey: [ACCOUNT_DETAIL_QUERY_KEY, accountId],
    queryFn: () => {
      if (!accountId) return null;
      return staffAccountService.getStaffAccountById(accountId);
    },
    enabled: !!accountId && accountId > 0,
  });
}
