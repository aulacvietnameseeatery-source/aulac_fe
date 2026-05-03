// src/services/role.service.ts
import { api } from "@/lib/http";
import { RoleDto } from "../types/role.types";
import { ApiResponse, PagedResult } from "@/types/api-response.types";

type GetRolesParams = {
  pageIndex: number;
  pageSize: number;
  search?: string;
};

export type ActiveRoleOption = {
  roleId: number;
  roleName: string;
};

export type ArchiveRoleRequest = {
  replacementRoleId?: number;
};

export const getRoles = async (params: GetRolesParams) => {
  const query = new URLSearchParams({
    PageIndex: params.pageIndex.toString(),
    PageSize: params.pageSize.toString(),
    ...(params.search ? { search: params.search } : {}),
  });

  const response = await api.get<ApiResponse<PagedResult<RoleDto>>>(`/api/roles?${query.toString()}`);
  return response.data;
};

export const archiveRole = async (id: number, request?: ArchiveRoleRequest) => {
  const response = await api.delete<ApiResponse<object>>(`/api/roles/${id}`, {
    body: JSON.stringify(request ?? {}),
  });
  return response.data;
};

export const getActiveRoles = async (): Promise<ActiveRoleOption[]> => {
  const response = await api.get<ApiResponse<ActiveRoleOption[]>>('/api/account/roles/active');
  return response.data;
};