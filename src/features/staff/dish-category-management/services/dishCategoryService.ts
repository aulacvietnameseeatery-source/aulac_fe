import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishCategory, CreateDishCategoryRequest, UpdateDishCategoryRequest } from "../types";

export const dishCategoryService = {
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
   * Get category by ID
   */
  getCategoryById: async (id: number): Promise<DishCategory> => {
    const response = await api.get<ApiResponse<DishCategory>>(`/api/dish-categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   */
  createCategory: async (request: CreateDishCategoryRequest): Promise<DishCategory> => {
    const response = await api.post<ApiResponse<DishCategory>, CreateDishCategoryRequest>(
      `/api/dish-categories`,
      request
    );
    return response.data;
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: number, request: UpdateDishCategoryRequest): Promise<DishCategory> => {
    const response = await api.put<ApiResponse<DishCategory>>(
      `/api/dish-categories/${id}`,
      request as never
    );
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
