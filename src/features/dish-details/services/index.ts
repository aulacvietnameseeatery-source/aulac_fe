import { api } from "@/lib/http";
import { DishDetailResponse } from "../types";

export const dishService = {
  /**
   * Get dish detail by ID
   */
  getDishById: async (id: number): Promise<DishDetailResponse> => {
    return api.get<DishDetailResponse>(`/api/dishes/${id}`);
  },
};
