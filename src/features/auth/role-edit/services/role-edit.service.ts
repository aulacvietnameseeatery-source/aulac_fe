// src/features/auth/role-edit/services/role-edit.service.ts
import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { UpdateRoleRequest } from "../types/role-edit.types";
import { RoleDetailDto } from "../../role-detail/types/role-detail.types";

export const updateRole = async (roleId: number, request: UpdateRoleRequest): Promise<RoleDetailDto> => {
  const response = await api.put<ApiResponse<RoleDetailDto>>(`/api/roles/${roleId}`, request);
  return response.data;
};

export const getRoleForEdit = async (roleId: number): Promise<RoleDetailDto> => {
  const response = await api.get<ApiResponse<RoleDetailDto>>(`/api/roles/${roleId}`);
  return response.data;
};
