import { api } from "@/lib/http";

interface ApiResponse<T> {
  success: boolean;
  code: number;
  userMessage: string;
  data: T;
}

export interface Ingredient {
  ingredientId: number;
  ingredientName: string;
  unitLvId: string;
  unitName?: string;
}

export const ingredientService = {
  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await api.get<ApiResponse<Ingredient[]>>("/api/ingredients/all");
    return response.data;
  },
};
