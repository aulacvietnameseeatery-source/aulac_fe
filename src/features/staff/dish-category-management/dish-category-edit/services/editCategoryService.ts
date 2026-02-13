import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishCategory, UpdateDishCategoryRequest } from "../../types";

export const editCategoryService = {
  /**
   * Get category by ID
   */
  getCategoryById: async (id: number): Promise<DishCategory> => {
    const response = await api.get<ApiResponse<DishCategory>>(`/api/dish-categories/${id}`);
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
};
