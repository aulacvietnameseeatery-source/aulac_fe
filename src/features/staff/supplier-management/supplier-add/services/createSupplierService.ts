import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { CreateSupplierRequest } from "../types";
import { Supplier } from "@/features/staff/supplier-management/supplier-list";

export const createSupplierService = {
  /**
   * Create a new supplier
   */
  createSupplier: async (request: CreateSupplierRequest): Promise<Supplier> => {
    const response = await api.post<ApiResponse<Supplier>, CreateSupplierRequest>(
      `/api/suppliers`,
      request
    );
    return response.data;
  },
};
