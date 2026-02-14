// src/features/staff/role-list/hooks/useRoleList.ts
import { useState, useCallback, useRef } from "react";
import { RoleDto } from "../types/role.types";
import { getRoles } from "../services/role.service";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

/**
 * Data-fetching hook for roles.
 * Driven by BaseTable's onDataChange - BaseTable owns search/pagination state.
 */
export const useRoleList = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
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
    if (hash === lastFetchHashRef.current) return;
    lastFetchHashRef.current = hash;
    latestParamsRef.current = params;

    const currentFetchId = ++fetchIdRef.current;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    setPaginationInfo({ page, pageSize });
    setIsLoading(true);

    try {
      const res = await getRoles({
        pageIndex: page,
        pageSize,
        search: params.search || "",
      });

      if (currentFetchId === fetchIdRef.current && res) {
        setRoles(res.pageData);
        setTotalCount(res.totalCount);
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Failed to fetch roles:", error);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /** Re-fetch with the last known params */
  const refresh = useCallback(() => {
    lastFetchHashRef.current = "";
    handleDataChange(latestParamsRef.current);
  }, [handleDataChange]);

  return {
    roles,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange: handleDataChange,
    refresh,
  };
};
