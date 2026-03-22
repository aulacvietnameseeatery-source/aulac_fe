import { api } from "@/lib/http";
import type { ApiResponse } from "@/types/api-response.types";
import type { IngredientDto } from "@/features/staff/ingredient-management/types/ingredient-types";
import type { AdjustStockPayload } from "../types/stock.types";

export const stockService = {
    getAllIngredientsForAudit: async (): Promise<IngredientDto[]> => {
        const response = await api.get<ApiResponse<IngredientDto[]>>("/api/ingredients/all");
        return (response.data as any)?.data || response.data || [];
    },

    adjustStock: async (ingredientId: number, payload: AdjustStockPayload) => {
        return api.post(`/api/ingredients/${ingredientId}/adjust-stock`, payload);
    }
};