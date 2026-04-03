import { api } from '@/lib/http';
import { ApiResponse, PagedResult } from '@/types/api-response.types';
import { StaffAccount, StaffAccountFilters, Role, AccountStatus } from '../types/staff-account.types';
import type {
  AccountDetail,
  CreateAccountRequest,
  CreateAccountResponse,
  UpdateAccountRequest,
  UpdateAccountStatusRequest,
  AccountSubResourceQuery,
  AccountOrderSummary,
  AccountAuditLog,
  AccountLoginActivity,
  AccountServiceError,
  AccountInventoryActivity,
} from '../../account-detail/types/account-detail.types';

export const staffAccountService = {
  // Get all staff accounts with filters and pagination
  getStaffAccounts: async (filters: StaffAccountFilters): Promise<PagedResult<StaffAccount>> => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('Search', filters.search);
    }
    if (filters.roleId) {
      params.append('RoleId', filters.roleId.toString());
    }
    if (filters.accountStatus) {
      params.append('AccountStatus', filters.accountStatus.toString());
    }
    params.append('PageIndex', filters.pageIndex.toString());
    params.append('PageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const path = `/api/account/staff${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<PagedResult<StaffAccount>>>(path);
    return response.data;
  },

  // Get staff account detail by ID (returns enriched detail)
  getStaffAccountById: async (id: number): Promise<AccountDetail | null> => {
    try {
      const response = await api.get<ApiResponse<AccountDetail>>(`/api/account/${id}/detail`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  },

  // Create a new staff account
  createStaffAccount: async (data: CreateAccountRequest): Promise<CreateAccountResponse> => {
    const response = await api.post<ApiResponse<CreateAccountResponse>, CreateAccountRequest>(
      '/api/account/create',
      data
    );
    return response.data;
  },

  // Update an existing staff account
  updateStaffAccount: async (id: number, data: UpdateAccountRequest): Promise<AccountDetail> => {
    const response = await api.put<ApiResponse<AccountDetail>, UpdateAccountRequest>(
      `/api/account/${id}`,
      data
    );
    return response.data;
  },

  // Update account status
  updateAccountStatus: async (id: number, status: UpdateAccountStatusRequest): Promise<void> => {
    await api.put<ApiResponse<null>, string>(`/api/account/${id}/status`, status);
  },

  // Reset staff account password
  resetStaffPassword: async (id: number): Promise<void> => {
    await api.post<ApiResponse<object>, object>(`/api/account/${id}/reset-password`, {});
  },

  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get<ApiResponse<Role[]>>('/api/account/roles');
    return response.data;
  },

  // Get active roles only (for dropdown/filter usage)
  getActiveRoles: async (): Promise<Role[]> => {
    const response = await api.get<ApiResponse<Role[]>>('/api/account/roles/active');
    return response.data;
  },

  // Get all account statuses
  getAccountStatuses: async (): Promise<AccountStatus[]> => {
    const response = await api.get<ApiResponse<AccountStatus[]>>('/api/account/statuses');
    return response.data;
  },

  // ---- Account Activity Sub-Resource Endpoints ----

  /** Build query string for account sub-resource endpoints */
  _buildSubResourceParams: (query?: AccountSubResourceQuery): string => {
    if (!query) return '';
    const params = new URLSearchParams();
    if (query.pageIndex) params.append('PageIndex', query.pageIndex.toString());
    if (query.pageSize) params.append('PageSize', query.pageSize.toString());
    if (query.fromDate) params.append('FromDate', query.fromDate);
    if (query.toDate) params.append('ToDate', query.toDate);
    if (query.search) params.append('Search', query.search);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  },

  /** GET /api/account/{id}/orders */
  getAccountOrders: async (id: number, query?: AccountSubResourceQuery): Promise<PagedResult<AccountOrderSummary>> => {
    const qs = staffAccountService._buildSubResourceParams(query);
    const response = await api.get<ApiResponse<PagedResult<AccountOrderSummary>>>(`/api/account/${id}/orders${qs}`);
    return response.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  /** GET /api/account/{id}/audit-logs */
  getAccountAuditLogs: async (id: number, query?: AccountSubResourceQuery): Promise<PagedResult<AccountAuditLog>> => {
    const qs = staffAccountService._buildSubResourceParams(query);
    const response = await api.get<ApiResponse<PagedResult<AccountAuditLog>>>(`/api/account/${id}/audit-logs${qs}`);
    return response.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  /** GET /api/account/{id}/login-activity */
  getAccountLoginActivity: async (id: number, query?: AccountSubResourceQuery): Promise<PagedResult<AccountLoginActivity>> => {
    const qs = staffAccountService._buildSubResourceParams(query);
    const response = await api.get<ApiResponse<PagedResult<AccountLoginActivity>>>(`/api/account/${id}/login-activity${qs}`);
    return response.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  /** GET /api/account/{id}/service-errors */
  getAccountServiceErrors: async (id: number, query?: AccountSubResourceQuery): Promise<PagedResult<AccountServiceError>> => {
    const qs = staffAccountService._buildSubResourceParams(query);
    const response = await api.get<ApiResponse<PagedResult<AccountServiceError>>>(`/api/account/${id}/service-errors${qs}`);
    return response.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },

  /** GET /api/account/{id}/inventory-activity */
  getAccountInventoryActivity: async (id: number, query?: AccountSubResourceQuery): Promise<PagedResult<AccountInventoryActivity>> => {
    const qs = staffAccountService._buildSubResourceParams(query);
    const response = await api.get<ApiResponse<PagedResult<AccountInventoryActivity>>>(`/api/account/${id}/inventory-activity${qs}`);
    return response.data ?? { pageData: [], pageIndex: 1, pageSize: 20, totalCount: 0, totalPage: 0 };
  },
};
