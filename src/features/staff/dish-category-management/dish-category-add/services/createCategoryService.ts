import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { CreateDishCategoryRequest } from "../types";
import {DishCategory} from "@/features/staff/dish-category-management/dish-category-edit";

export type TranslateCategoryRequest = {
  sourceLang: string;
  data: { valueName: string; description: string };
};

export type TranslateCategoryResponse = {
  translations: Record<string, { valueName: string; description: string }>;
};

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

  translateContent: async (payload: TranslateCategoryRequest): Promise<TranslateCategoryResponse> => {
    const response = await api.post<ApiResponse<TranslateCategoryResponse>>(
      `/api/translate/lookup`,
      payload
    );
    return response.data;
  },
};
