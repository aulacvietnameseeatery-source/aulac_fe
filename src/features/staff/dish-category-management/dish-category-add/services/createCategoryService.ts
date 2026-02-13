import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { DishCategory, CreateDishCategoryRequest } from "../../types";

export const createCategoryService = {
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
};
