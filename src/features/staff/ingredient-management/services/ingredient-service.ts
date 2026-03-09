import { api } from "@/lib/http"; // Đường dẫn tới file config axios/fetch của bạn
import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    IngredientDto,
    IngredientFilterParams,
    SaveIngredientRequest,
    AdjustStockRequest,
    StockHistoryDto
} from "../types/ingredient-types";

export const ingredientService = {
    // get list
    getIngredients: async (params: IngredientFilterParams): Promise<PagedResult<IngredientDto>> => {
        const query = new URLSearchParams();
        query.set("pageIndex", String(params.pageIndex));
        query.set("pageSize", String(params.pageSize));
        if (params.search) query.set("search", params.search);
        if (params.typeLvId) query.set("typeLvId", String(params.typeLvId));
        if (params.isLowStock) query.set("isLowStock", "true");

        const res = await api.get<ApiResponse<PagedResult<IngredientDto>>>(`/api/ingredients?${query.toString()}`);
        return res.data;
    },

    // get detail
    getIngredientById: async (id: number): Promise<IngredientDto> => {
        const res = await api.get<ApiResponse<IngredientDto>>(`/api/ingredients/${id}`);
        return res.data;
    },

    // new ingredient
    createIngredient: async (data: SaveIngredientRequest): Promise<IngredientDto> => {
        const res = await api.post<ApiResponse<IngredientDto>>("/api/ingredients", data);
        return res.data;
    },

    // update ingredient
    updateIngredient: async (id: number, data: SaveIngredientRequest): Promise<IngredientDto> => {
        const res = await api.put<ApiResponse<IngredientDto>>(`/api/ingredients/${id}`, data);
        return res.data;
    },

    // delete ingredient
    deleteIngredient: async (id: number): Promise<void> => {
        await api.delete(`/api/ingredients/${id}`);
    },

    // export ingredient list to Excel, import file from Excel
    adjustStock: async (id: number, data: AdjustStockRequest): Promise<void> => {
        await api.post(`/api/ingredients/${id}/adjust-stock`, data);
    },

    // history stock
    getStockHistory: async (id: number): Promise<StockHistoryDto[]> => {
        const res = await api.get<ApiResponse<StockHistoryDto[]>>(`/api/ingredients/${id}/stock-history`);
        return res.data;
    }
};