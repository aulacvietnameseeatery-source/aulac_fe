import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { Supplier, UpdateSupplierRequest } from "../types";

export const editSupplierService = {
  /**
   * Get supplier by ID
   */
  getSupplier: async (id: number): Promise<Supplier> => {
    const response = await api.get<ApiResponse<Supplier>>(`/api/suppliers/${id}`);
    return response.data;
  },

  /**
   * Update supplier
   */
  updateSupplier: async (id: number, request: UpdateSupplierRequest): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>, UpdateSupplierRequest>(
      `/api/suppliers/${id}`,
      request
    );
    return response.data;
  },
};
