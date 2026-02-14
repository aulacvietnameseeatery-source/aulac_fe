// src/features/staff/account-management/account-list/hooks/useAccountList.ts
import { useState, useCallback, useRef } from "react";
import { StaffAccount } from "../types/staff-account.types";
import { staffAccountService } from "../services/staff-account.service";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

/**
 * Data-fetching hook for staff accounts.
 * Driven by BaseTable's onDataChange — BaseTable owns search/pagination/filter state.
 *
 * Column filter mapping:
 *   - filters['roleName']       → roleId   (API param)
 *   - filters['accountStatusName'] → accountStatus (API param)
 */
export const useAccountList = () => {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Track current page/pageSize for global row numbering in columns
  const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

  // Dedup + latest-request tracking
  const latestParamsRef = useRef<TableDataChangeParams>({});
  const lastFetchHashRef = useRef("");
  const fetchIdRef = useRef(0);

  /** Called by BaseTable's onDataChange */
  const handleDataChange = useCallback(async (params: TableDataChangeParams) => {
    const hash = JSON.stringify(params);
    if (hash === lastFetchHashRef.current) return; // skip duplicate calls
    lastFetchHashRef.current = hash;
    latestParamsRef.current = params;

    const currentFetchId = ++fetchIdRef.current;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    setPaginationInfo({ page, pageSize });
    setIsLoading(true);

    try {
      // Extract column-filter values
      const roleId = params.filters?.["roleName"]?.value
        ? Number(params.filters["roleName"].value)
        : undefined;
      const accountStatus = params.filters?.["accountStatusName"]?.value
        ? Number(params.filters["accountStatusName"].value)
        : undefined;

      const res = await staffAccountService.getStaffAccounts({
        pageIndex: page,
        pageSize,
        search: params.search || "",
        roleId,
        accountStatus,
      });

      // Only apply result from the latest request (handles race conditions)
      if (currentFetchId === fetchIdRef.current && res) {
        setAccounts(res.pageData);
        setTotalCount(res.totalCount);
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Failed to fetch accounts:", error);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /** Re-fetch with the last known params (used after create/edit/delete) */
  const refresh = useCallback(() => {
    lastFetchHashRef.current = ""; // reset dedup so the same params re-fetch
    handleDataChange(latestParamsRef.current);
  }, [handleDataChange]);

  return {
    accounts,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange: handleDataChange,
    refresh,
  };
};
