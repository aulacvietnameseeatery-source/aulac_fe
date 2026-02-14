// ============================================================
// Account Detail — Domain Types & View Models
// Maps to: GET /api/account/{id}/detail response
// ============================================================

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
export type UpdateAccountStatusRequest = "ACTIVE" | "INACTIVE" | "LOCKED";

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
