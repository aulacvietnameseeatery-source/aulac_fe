import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { Supplier, SupplierFilters, PagedResult } from "../types";

export const listSupplierService = {
  /**
   * Get paginated suppliers with filters
   */
  getSuppliers: async (filters: SupplierFilters): Promise<PagedResult<Supplier>> => {
    const query = new URLSearchParams();
    
    if (filters.search) {
      query.append("search", filters.search);
    }
    
    query.append("pageIndex", filters.pageIndex.toString());
    query.append("pageSize", filters.pageSize.toString());

    const response = await api.get<ApiResponse<PagedResult<Supplier>>>(
      `/api/suppliers/list?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Delete a supplier
   */
  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`/api/suppliers/${id}`);
  },
};
