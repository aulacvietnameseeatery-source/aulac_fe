// features/admin/dish-management/dish-list/services/dish.service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { DishManagementDto, GetDishesParams } from "../types/dish-types";
import { api } from "@/lib/http";

export interface DishStatusOption {
    statusId: number;
    statusName: string;
}

export const staffDishService = {
    // 1. Lấy danh sách món ăn
    getDishes: async (params: GetDishesParams): Promise<PagedResult<DishManagementDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.category && params.category !== "All") query.append("category", params.category);
        if (params.status && params.status !== "All") query.append("status", params.status.toString());
        if (params.sortBy) query.append("sortBy", params.sortBy);
        if (params.isDescending !== undefined) query.append("isDescending", params.isDescending.toString());
        if (params.locale) query.append("locale", params.locale);

        // Sử dụng api.get. Return type của api.get đã là parsed JSON nên ta cast thẳng sang ApiResponse
        const response = await api.get<ApiResponse<PagedResult<DishManagementDto>>>(
            `/api/dishes/management?${query.toString()}`,
            {
                headers: {
                    'Accept-Language': params.locale || 'en',
                    'x-locale': params.locale || 'en'
                }
            }
        );

        return response.data;
    },

    // 2. Lấy danh sách Categories cho Dropdown
    getAllCategories: async (): Promise<string[]> => {
        const response = await api.get<ApiResponse<string[]>>(`/api/dishes/categories`);
        return response.data;
    },

    // 3. Lấy danh sách Statuses cho Dropdown
    getDishStatuses: async (): Promise<DishStatusOption[]> => {
        const response = await api.get<ApiResponse<DishStatusOption[]>>(`/api/dishes/statuses`);
        return response.data;
    },

    // 4. Cập nhật trạng thái món ăn (nhận string: "AVAILABLE" hoặc "HIDDEN")
    updateDishStatus: async (dishId: number, status: string): Promise<void> => {
        await api.patch(`/api/dishes/${dishId}/status`, { status });
    }
};