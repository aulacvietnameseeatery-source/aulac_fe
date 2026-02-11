// src/features/auth/role-detail/services/role-detail.service.ts
import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { RoleDetailDto } from "../types/role-detail.types";

export const getRoleDetail = async (roleId: number) => {
  const response = await api.get<ApiResponse<RoleDetailDto>>(`/api/roles/${roleId}`);
  return response.data;
};
