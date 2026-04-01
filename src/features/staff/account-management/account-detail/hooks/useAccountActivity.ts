import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { staffAccountService } from "../../account-list/services/staff-account.service";
import type { PagedResult } from "@/types/api-response.types";
import type {
  AccountSubResourceQuery,
  AccountOrderSummary,
  AccountAuditLog,
  AccountLoginActivity,
  AccountServiceError,
  AccountInventoryActivity,
} from "../types/account-detail.types";

// ============================================================
// Query Keys
// ============================================================

export const ACCOUNT_ACTIVITY_KEYS = {
  orders: (id: number, q?: AccountSubResourceQuery) => ["account-orders", id, q] as const,
  auditLogs: (id: number, q?: AccountSubResourceQuery) => ["account-audit-logs", id, q] as const,
  loginActivity: (id: number, q?: AccountSubResourceQuery) => ["account-login-activity", id, q] as const,
  serviceErrors: (id: number, q?: AccountSubResourceQuery) => ["account-service-errors", id, q] as const,
  inventoryActivity: (id: number, q?: AccountSubResourceQuery) => ["account-inventory-activity", id, q] as const,
};

const EMPTY_PAGE: PagedResult<never> = {
  pageData: [],
  pageIndex: 1,
  pageSize: 20,
  totalCount: 0,
  totalPage: 0,
};

// ============================================================
// Hooks
// ============================================================

export function useAccountOrders(accountId: number | null, query?: AccountSubResourceQuery) {
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);
  return useQuery<PagedResult<AccountOrderSummary>>({
    queryKey: ACCOUNT_ACTIVITY_KEYS.orders(accountId!, stableQuery),
    queryFn: () => staffAccountService.getAccountOrders(accountId!, stableQuery),
    enabled: !!accountId && accountId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useAccountAuditLogs(accountId: number | null, query?: AccountSubResourceQuery) {
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);
  return useQuery<PagedResult<AccountAuditLog>>({
    queryKey: ACCOUNT_ACTIVITY_KEYS.auditLogs(accountId!, stableQuery),
    queryFn: () => staffAccountService.getAccountAuditLogs(accountId!, stableQuery),
    enabled: !!accountId && accountId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useAccountLoginActivity(accountId: number | null, query?: AccountSubResourceQuery) {
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);
  return useQuery<PagedResult<AccountLoginActivity>>({
    queryKey: ACCOUNT_ACTIVITY_KEYS.loginActivity(accountId!, stableQuery),
    queryFn: () => staffAccountService.getAccountLoginActivity(accountId!, stableQuery),
    enabled: !!accountId && accountId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useAccountServiceErrors(accountId: number | null, query?: AccountSubResourceQuery) {
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);
  return useQuery<PagedResult<AccountServiceError>>({
    queryKey: ACCOUNT_ACTIVITY_KEYS.serviceErrors(accountId!, stableQuery),
    queryFn: () => staffAccountService.getAccountServiceErrors(accountId!, stableQuery),
    enabled: !!accountId && accountId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useAccountInventoryActivity(accountId: number | null, query?: AccountSubResourceQuery) {
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);
  return useQuery<PagedResult<AccountInventoryActivity>>({
    queryKey: ACCOUNT_ACTIVITY_KEYS.inventoryActivity(accountId!, stableQuery),
    queryFn: () => staffAccountService.getAccountInventoryActivity(accountId!, stableQuery),
    enabled: !!accountId && accountId > 0,
    placeholderData: keepPreviousData,
  });
}
