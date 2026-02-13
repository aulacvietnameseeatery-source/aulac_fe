import { api } from "@/lib/http";
import { DishDetailResponse } from "../types";

export const dishService = {
  /**
   * Get dish detail by ID
   * @param id - Dish ID
   * @param lang - Language code (e.g., "en", "vi")
   */
  getDishById: async (id: number, lang?: string): Promise<DishDetailResponse> => {
    const params = lang ? `?lang=${lang}` : "";
    return api.get<DishDetailResponse>(`/api/dishes/${id}${params}`);
  },
};
