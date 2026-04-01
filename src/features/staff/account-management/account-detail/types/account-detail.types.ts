// ============================================================
// Account Detail — Domain Types & View Models
// Maps to: GET /api/account/{id}/detail response
// ============================================================

import { AccountStatusCode } from '@/types/status-codes';

/** Role detail as returned from /api/account/{id}/detail */
export interface AccountRole {
  roleId: number;
  roleName: string;
  permissions?: string[];
}

/** Full account detail from GET /api/account/{id}/detail */
export interface AccountDetail {
  accountId: number;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  accountStatus: string; // "ACTIVE" | "INACTIVE" | "LOCKED"
  isLocked: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  updatedAt: string | null;
  role: AccountRole;
}

/** Request body for POST /api/account/create */
export interface CreateAccountRequest {
  email: string;
  fullName: string;
  phone?: string;
  roleId: number;
}

/** Response data for POST /api/account/create */
export interface CreateAccountResponse {
  accountId: number;
  username: string;
  email: string;
  fullName: string;
  accountStatus: string;
  temporaryPasswordSent: boolean;
  message: string;
}

/** Request body for PUT /api/account/{id} */
export interface UpdateAccountRequest {
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  roleId?: number | null;
}

/** Request body for PUT /api/account/{id}/status */
export type UpdateAccountStatusRequest = AccountStatusCode;

// ============================================================
// Dialog Control Types
// ============================================================

export type AccountDialogMode = "view" | "create" | "edit";

export interface AccountDialogState {
  open: boolean;
  mode: AccountDialogMode;
  accountId: number | null;
}

export const INITIAL_DIALOG_STATE: AccountDialogState = {
  open: false,
  mode: "view",
  accountId: null,
};

// ============================================================
// Tab definitions for the detail view
// ============================================================

export type AccountTabKey =
  | "general"
  | "role-status"
  | "security"
  | "orders"
  | "inventory"
  | "service-errors"
  | "audit-logs"
  | "system-settings";

export interface AccountTab {
  key: AccountTabKey;
  label: string;
  icon: string; // lucide icon name
  available: boolean; // whether data endpoint exists
}

// ============================================================
// Account Sub-Resource Types (from BE activity endpoints)
// ============================================================

/** Shared query params for account sub-resource list endpoints. */
export interface AccountSubResourceQuery {
  pageIndex?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

/** GET /api/account/{id}/orders → PagedResult<AccountOrderSummary> */
export interface AccountOrderSummary {
  orderId: number;
  tableCode: string | null;
  customerName: string | null;
  totalAmount: number;
  taxAmount: number;
  tipAmount: number | null;
  orderStatus: string;
  source: string;
  createdAt: string | null;
  itemCount: number;
  isPaid: boolean;
}

/** GET /api/account/{id}/audit-logs → PagedResult<AccountAuditLog> */
export interface AccountAuditLog {
  logId: number;
  actionCode: string | null;
  targetTable: string | null;
  targetId: number | null;
  createdAt: string | null;
}

/** GET /api/account/{id}/login-activity → PagedResult<AccountLoginActivity> */
export interface AccountLoginActivity {
  loginActivityId: number;
  eventType: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  occurredAt: string;
}

/** GET /api/account/{id}/service-errors → PagedResult<AccountServiceError> */
export interface AccountServiceError {
  errorId: number;
  orderId: number | null;
  categoryName: string;
  categoryCode: string;
  description: string;
  severityName: string;
  penaltyAmount: number | null;
  isResolved: boolean;
  resolvedByName: string | null;
  resolvedAt: string | null;
  createdAt: string | null;
}

/** GET /api/account/{id}/inventory-activity → PagedResult<AccountInventoryActivity> */
export interface AccountInventoryActivity {
  transactionId: number;
  transactionCode: string | null;
  typeName: string;
  statusName: string;
  note: string | null;
  createdAt: string | null;
  staffRole: string; // "Creator" | "Approver"
  itemCount: number;
}
