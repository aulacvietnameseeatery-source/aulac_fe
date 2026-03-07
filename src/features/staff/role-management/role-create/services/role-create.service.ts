// src/features/auth/role-create/services/role-create.service.ts
import { api } from "@/lib/http";
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { CreateRoleRequest } from "../types/role-create.types";

import { RoleDto } from "@/features/staff/role-management/role-list";
import { RoleDetailDto } from "../../role-detail";

export const createRole = async (request: CreateRoleRequest): Promise<RoleDetailDto> => {
  const response = await api.post<ApiResponse<RoleDetailDto>>("/api/roles", request);
  return response.data;
};

export const getAllPermissions = async (): Promise<RoleDetailDto> => {
  try {
    // First, get the list of roles to find an existing role ID
    const rolesResponse = await api.get<ApiResponse<PagedResult<RoleDto>>>("/api/roles?PageIndex=1&PageSize=1");
    
    if (!rolesResponse.data?.pageData || rolesResponse.data.pageData.length === 0) {
      throw new Error("No roles found in system. Please create a default role first.");
    }
    
    // Use the first role's ID to get the permission structure
    const firstRoleId = rolesResponse.data.pageData[0].roleId;
    const response = await api.get<ApiResponse<RoleDetailDto>>(`/api/roles/${firstRoleId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
    throw error;
  }
};
