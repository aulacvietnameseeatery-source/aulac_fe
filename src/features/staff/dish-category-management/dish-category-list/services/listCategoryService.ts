import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishCategory, CategoryFilters, PagedResult } from "../types";

export const listCategoryService = {
  /**
   * Get paginated dish categories with filters
   */
  getCategories: async (filters: CategoryFilters): Promise<PagedResult<DishCategory>> => {
    const query = new URLSearchParams();
    
    if (filters.search) {
      query.append("search", filters.search);
    }
    
    if (filters.isDisabled !== undefined) {
      query.append("isDisabled", filters.isDisabled.toString());
    }
    
    query.append("pageIndex", filters.pageIndex.toString());
    query.append("pageSize", filters.pageSize.toString());

    const response = await api.get<ApiResponse<PagedResult<DishCategory>>>(
      `/api/dish-categories/list?${query.toString()}`
    );
    return response.data;
  },

  /**
   * Get all dish categories
   */
  getAllCategories: async (includeDisabled: boolean = false): Promise<DishCategory[]> => {
    const query = new URLSearchParams();
    if (includeDisabled) {
      query.append("includeDisabled", "true");
    }

    const queryString = query.toString();
    const path = `/api/dish-categories${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<DishCategory[]>>(path);
    return response.data;
  },

  /**
   * Toggle category status (enable/disable) - Soft delete
   */
  toggleCategoryStatus: async (id: number, isDisabled: boolean): Promise<DishCategory> => {
    const response = await api.patch<ApiResponse<DishCategory>, boolean>(
      `/api/dish-categories/${id}/status`,
      isDisabled
    );
    return response.data;
  },
};
